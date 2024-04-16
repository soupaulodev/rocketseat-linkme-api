import { FastifyInstance } from "fastify";
import { sql } from "../../lib/postgres";
import bcrypt from "bcryptjs";
import z from "zod";
import { Unauthorized } from "../_errors/unauthorized";
import { NotFound } from "../_errors/not-found";
import { NotModified } from "../_errors/not-modified";

export async function edit(app: FastifyInstance) {
  app.patch(
    "/users/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const editUserSchema = z.object({
        name: z.string().nullish(),
        email: z.string().email().nullish(),
        password: z.string().min(6),
      });

      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const { name, email, password } = editUserSchema.parse(request.body);

      const user = await sql/*sql*/ `
      SELECT * FROM users WHERE id = ${id}
    `;
      if (user.length === 0) {
        throw new NotFound("User not found");
      }

      const passwordMatch = await bcrypt.compare(password, user[0].password);
      if (!passwordMatch) {
        throw new Unauthorized("Invalid password");
      }

      let isUpdated = false;

      if (name && name !== user[0].name) {
        await sql/*sql*/ `
          UPDATE users
          SET name = ${name}
          WHERE id = ${id}
        `;
        isUpdated = true;
      }

      if (email && email !== user[0].email) {
        await sql/*sql*/ `
          UPDATE users
          SET email = ${email}
          WHERE id = ${id}
        `;
        isUpdated = true;
      }

      if (!isUpdated) {
        throw new NotModified(
          "The new data must be different from the old one"
        );
      }

      return reply.status(200).send({ message: "Changes saved successfully" });
    }
  );
}
