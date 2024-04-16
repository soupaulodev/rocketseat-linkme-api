import { FastifyInstance } from "fastify";
import z from "zod";
import { sql } from "../../lib/postgres";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

export async function createLink(app: FastifyInstance) {
  app.post("/links", async (request, reply) => {
    const createLinkSchema = z.object({
      code: z.string().min(3),
      url: z.string().url(),
      userId: z.string().uuid(),
    });

    const { code, url, userId } = createLinkSchema.parse(request.body);
    const id = uuidv4();

    const result = await sql/*sql*/ `
      INSERT INTO short_links (id, code, original_url, user_id)
      VALUES (${id}, ${code}, ${url}, ${userId})
      RETURNING *
    `;

    return reply.status(201).send({
      shortedLink: {
        id: result[0].id,
        code: result[0].code,
        originalUrl: result[0].original_url,
      },
    });
  });
}
