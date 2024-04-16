import fastify from "fastify";
import dotenv from "dotenv";
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

dotenv.config();
const PORT = Number(process.env.PORT || 3000);
const HOST = String(
  process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0"
);

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(signup, { prefix: "/api/auth" });
app.register(login, { prefix: "/api/auth" });
app.register(logout, { prefix: "/api/auth" });
app.register(edit, { prefix: "/api" });
app.register(del, { prefix: "/api" });
app.register(link);
app.register(links, { prefix: "/api" });
app.register(createLink, { prefix: "/api" });
app.register(metrics, { prefix: "/api" });

app.setErrorHandler(errorHandler);

app
  .listen({ port: PORT, host: HOST })
  .then((address) => {
    console.log(`Server listening at ${address}`);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
