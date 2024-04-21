import { FastifyInstance } from "fastify";

export async function helloWorld(app: FastifyInstance) {
  app.get("/helloworld", async (request, reply) => {
    return reply.status(200).send({ message: "Hello World" });
  });
}
