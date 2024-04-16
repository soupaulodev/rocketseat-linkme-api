import { JWT } from "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

type userPayload = {
  id: string;
  name: string;
  email: string;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: userPayload;
  }
}
