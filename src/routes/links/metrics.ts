import { FastifyInstance } from "fastify";
import { redis } from "../../lib/redis";
import z from "zod";

export async function metrics(app: FastifyInstance) {
  app.get("/metrics/:id", async (request, reply) => {
    const getMetricsSchema = z.object({
      id: z.string(),
    });

    const { id } = getMetricsSchema.parse(request.params);
    const result = await redis.zrangebyscore(
      `metrics:${id}`,
      0,
      50,
      "WITHSCORES"
    );
    const metrics = [];

    for (let i = 0; i < result.length; i += 2) {
      metrics.push({
        shorteLinkId: result[i],
        clicks: Number(result[i + 1]),
      });
    }

    metrics.sort((a, b) => b.clicks - a.clicks);

    return reply.status(200).send({ result: metrics });
  });
}
