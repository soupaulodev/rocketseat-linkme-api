import { FastifyInstance } from "fastify";
import postgres from "postgres";
import z from "zod";
import { Conflit } from "./routes/_errors/conflit";
import { BadRequest } from "./routes/_errors/bad-request";
import { Unauthorized } from "./routes/_errors/unauthorized";
import { NotFound } from "./routes/_errors/not-found";
import { NotModified } from "./routes/_errors/not-modified";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof z.ZodError) {
    return reply.status(400).send({
      message: "Error during validation",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof postgres.PostgresError) {
    if (error.code === "23505") {
      return reply.status(409).send({ message: "Data already exists" });
    }
    if (error.code === "23503") {
      return reply.status(404).send({ message: "Data not found" });
    }
    if (error.code === "23514") {
      return reply.status(409).send({ message: "Data already exists" });
    }
    if (error.code === "23502") {
      return reply.status(404).send({ message: "Data not found" });
    }
  }

  // Defaults
  if (error instanceof NotModified) {
    return reply.status(304).send({ message: error.message });
  }

  if (error instanceof BadRequest) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof Unauthorized) {
    return reply.status(401).send({ message: error.message });
  }

  if (error instanceof NotFound) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof Conflit) {
    return reply.status(409).send({ message: error.message });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
