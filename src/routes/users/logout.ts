import { FastifyInstance } from "fastify";
import z from "zod";

export async function logout(app: FastifyInstance) {
  app.delete("/logout/:id", async (request, reply) => {
    const logoutSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = logoutSchema.parse(request.params);

    return reply.status(200).send({ message: "Logout successfully" });
  });
}
