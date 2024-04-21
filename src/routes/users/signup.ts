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
      confirmPassword: z.string().min(6),
    });

    const { name, email, password, confirmPassword } = createUserSchema.parse(
      request.body
    );

    if (password !== confirmPassword) {
      throw new BadRequest("Passwords do not match");
    }

    const acessToken = request.cookies.access_token;
    if (acessToken) {
      throw new BadRequest("Already logged in");
    }

    const result = await sql/*sql*/ `
      SELECT name FROM users WHERE email = ${email}
    `;
    if (result.length !== 0) {
      throw new Conflit("User already exists");
    }

    const id = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await sql/*sql*/ `
      INSERT INTO users (id, name, email, password)
      VALUES (${id}, ${name}, ${email}, ${hashedPassword})
      RETURNING *
    `;

    const payload = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
    };

    const token = request.jwt.sign(payload);

    reply.status(200).setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return;

    // return reply.status(201).send({ user: { id, name } });
  });
}
