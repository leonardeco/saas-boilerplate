import fp from "fastify-plugin";
import cors from "@fastify/cors";

export const corsPlugin = fp(async (app) => {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
});
