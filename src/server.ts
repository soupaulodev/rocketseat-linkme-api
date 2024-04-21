import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyCors from "@fastify/cors";
import { signup } from "./routes/users/signup";
import { login } from "./routes/users/login";
import { logout } from "./routes/users/logout";
import { links } from "./routes/links/links";
import { createLink } from "./routes/links/create-link";
import { metrics } from "./routes/links/metrics";
import { link } from "./routes/links/link";
import { edit } from "./routes/users/edit";
import { errorHandler } from "./error-handler";
import { del } from "./routes/users/del";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import { Unauthorized } from "./routes/_errors/unauthorized";
import { helloWorld } from "./routes/hello-world";
import { setup } from "./setup";

const PORT = Number(process.env.PORT || 3000);
const HOST = String(
  process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0"
);
const JWT_KEY = String(process.env.JWT_SECRET || "YOUR_SECRET");
const COOKIE_KEY = String(process.env.COOKIE_SECRET || "YOUR_SECRET");

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(fjwt, { secret: JWT_KEY });
app.addHook("preHandler", (request, reply, next) => {
  request.jwt = app.jwt;
  return next();
});

app.register(fCookie, {
  secret: COOKIE_KEY,
  hook: "preHandler",
  // parseOptions: {
  //   secure: process.env.NODE_ENV === "production",
  //   signed: true,
  //   maxAge: 1000 * 60 * 60 * 24 * 7,
  //   httpOnly: true,
  // path: "/",
  // domain: process.env.NODE_ENV === "production" ? ".linkme.dev" : undefined,
  // sameSite: "lax",
  // },
});

app.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies.access_token;

    if (!token) {
      throw new Unauthorized("Authentication required");
    }

    const decored = request.jwt.verify<FastifyJWT["user"]>(token);
    request.user = decored;
  }
);

app.register(helloWorld);
app.register(signup, { prefix: "/api/auth" });
app.register(login, { prefix: "/api/auth" });
app.register(logout, { prefix: "/api/auth" });
app.register(edit, { prefix: "/api" });
app.register(del, { prefix: "/api" });
app.register(link);
app.register(links, { prefix: "/api" });
app.register(createLink, { prefix: "/api" });
app.register(metrics, { prefix: "/api" });

const listeners = ["SIGINT", "SIGTERM"];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
});

app.setErrorHandler(errorHandler);

app
  .listen({ port: PORT, host: HOST })
  .then((address) => {
    try {
      setup();
    } catch (error) {
      console.log("Error setup db: ", error);
    }
    console.log(`Server listening at ${address}`);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
