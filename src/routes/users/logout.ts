import { FastifyInstance } from "fastify";
import z from "zod";
import { BadRequest } from "../_errors/bad-request";

export async function logout(app: FastifyInstance) {
  app.delete(
    "/logout/",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      reply.clearCookie("access_token");
      return reply.status(200).send({ message: "Logout successfully" });
    }
  );
}
