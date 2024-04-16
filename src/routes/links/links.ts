import { FastifyInstance } from "fastify";
import { sql } from "../../lib/postgres";
import z from "zod";

export async function links(app: FastifyInstance) {
  app.get(
    "/links/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const getLinkSchema = z.object({
        id: z.string(),
      });
      const { id } = getLinkSchema.parse(request.params);

      const result = await sql/*sql*/ `
      SELECT sl.code, sl.original_url, sl.created_at
      FROM short_links sl
      JOIN users u ON sl.user_id = u.id
      WHERE u.id = ${id}
      ORDER BY sl.created_at DESC;
    `;

      return reply.status(200).send({ result: result });
    }
  );
}
