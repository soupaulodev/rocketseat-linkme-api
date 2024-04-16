import { FastifyInstance } from "fastify";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { sql } from "../../lib/postgres";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { BadRequest } from "../_errors/bad-request";
import { Conflit } from "../_errors/conflit";

export async function signup(app: FastifyInstance) {
  app.post("/signup", async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = createUserSchema.parse(request.body);

    const result = await sql/*sql*/ `
      SELECT name FROM users WHERE email = ${email}
    `;
    if (result.length !== 0) {
      throw new Conflit("User already exists");
    }

    const id = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await sql/*sql*/ `
      INSERT INTO users (id, name, email, password)
      VALUES (${id}, ${name}, ${email}, ${hashedPassword})
    `;

    return reply.status(201).send({ user: { id, name } });
  });
}
