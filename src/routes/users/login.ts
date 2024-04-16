import { FastifyInstance } from "fastify";
import z from "zod";
import { sql } from "../../lib/postgres";
import bcrypt from "bcryptjs";
import { BadRequest } from "../_errors/bad-request";
import { Unauthorized } from "../_errors/unauthorized";
import { NotFound } from "../_errors/not-found";

export async function login(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = loginSchema.parse(request.body);

    const acessToken = request.cookies.access_token;
    if (acessToken) {
      throw new BadRequest("Already logged in");
    }

    const result = await sql/*sql*/ `
      SELECT id, name, password
      FROM users
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      throw new NotFound("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, result[0].password);
    if (!passwordMatch) {
      throw new Unauthorized("Invalid password");
    }

    const payload = {
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
    };

    const token = request.jwt.sign(payload);

    reply.status(200).setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return;

    // return reply.status(200).send({
    //   user: {
    //     id: result[0].id,
    //     name: result[0].name,
    //   },
    // });
  });
}
