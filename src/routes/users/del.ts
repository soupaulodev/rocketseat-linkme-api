import { FastifyInstance } from "fastify";
import z from "zod";
import { sql } from "../../lib/postgres";
import { NotFound } from "../_errors/not-found";

export async function del(app: FastifyInstance) {
  app.delete(
    "/users/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const delUserSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = delUserSchema.parse(request.params);

      const result = await sql/*sql*/ `
      SELECT name FROM users WHERE id = ${id}
    `;
      if (result.length === 0) {
        throw new NotFound("User not found");
      }

      await sql/*sql*/ `
      DELETE FROM users
      WHERE id = ${id}
    `;

      reply.status(204).send({ message: "User deleted successfully" });
    }
  );
}
