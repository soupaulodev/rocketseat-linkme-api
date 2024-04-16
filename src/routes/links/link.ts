import { FastifyInstance } from "fastify";
import z from "zod";
import { sql } from "../../lib/postgres";
import { redis } from "../../lib/redis";
import { NotFound } from "../_errors/not-found";

export async function link(app: FastifyInstance) {
  app.get("/:code", async (request, reply) => {
    const getLinkSchema = z.object({
      code: z.string().min(3),
    });
    const { code } = getLinkSchema.parse(request.params);

    const result = await sql/*sql*/ `
      SELECT id, original_url, user_id
      FROM short_links
      WHERE short_links.code = ${code}
    `;
    if (result.length === 0) {
      throw new NotFound("Link not found");
    }

    const link = result[0];

    await redis.zincrby(`metrics:${link.user_id}`, 1, String(link.id));

    return reply.redirect(301, link.original_url);
  });
}
