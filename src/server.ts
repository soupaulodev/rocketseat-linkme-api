import fastify from "fastify";
import z from "zod";
import { sql } from "./lib/postgres";
import postgres from "postgres";
import { redis } from "./lib/redis";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";

dotenv.config();
const PORT = Number(process.env.PORT || 3000);
const HOST = String(
  process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0"
);

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.get("/:code", async (request, reply) => {
  const getLinkSchema = z.object({
    code: z.string().min(3),
  });
  const { code } = getLinkSchema.parse(request.params);

  const result = await sql/*sql*/ `
    SELECT id, original_url
    FROM short_links
    WHERE short_links.code = ${code}
  `;

  if (result.length === 0) {
    return reply.status(400).send({ message: "Link not found" });
  }

  const link = result[0];

  await redis.zincrby("metrics", 1, String(link.id));

  return reply.redirect(301, link.original_url);
});

app.get("/api/links", async (request, reply) => {
  const result = await sql/*sql*/ `
    SELECT *
    FROM short_links
    ORDER BY created_at DESC
  `;

  return reply.status(200).send({ result: result });
});

app.post("/api/links", async (request, reply) => {
  const createLinkSchema = z.object({
    code: z.string().min(3),
    url: z.string().url(),
  });

  try {
    const { code, url } = createLinkSchema.parse(request.body);

    const result = await sql/*sql*/ `
    INSERT INTO short_links (code, original_url)
    VALUES (${code}, ${url})
    RETURNING id
  `;

    const link = result[0];

    return reply.status(201).send({ shortedLinkId: link.id });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      if (err.code === "23505") {
        return reply.status(400).send({
          message: "Duplicated code",
        });
      }
    }

    console.log(err);

    return reply.status(500).send({ Error: "Internal server error" });
  }
});

app.get("/api/metrics", async (request, reply) => {
  const result = await redis.zrangebyscore("metrics", 0, 50, "WITHSCORES");
  const metrics = [];

  for (let i = 0; i < result.length; i += 2) {
    metrics.push({
      shorteLinkId: Number(result[i]),
      clicks: Number(result[i + 1]),
    });
  }

  metrics.sort((a, b) => b.clicks - a.clicks);

  return reply.status(200).send({ result: metrics });
});

app
  .listen({ port: PORT, host: HOST })
  .then((address) => {
    console.log(`Server listening at ${address}`);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
