/**
 * Hello Fastrack Service — reference app (design §17).
 * Demonstrates: actuator endpoints, public route, optional openapi at /docs.
 * Add starter-security-entra, starter-redis, starter-db-mssql, starter-http for full reference.
 */
import { createApp } from "@fastrack/core";
import { webStarter } from "@fastrack/starter-web";
import { actuatorStarter } from "@fastrack/starter-actuator";
import { openapiStarter } from "@fastrack/starter-openapi";

async function main() {
  const app = await createApp({
    starters: [webStarter, actuatorStarter, openapiStarter],
  });

  app.get("/", async (_request, _reply) => {
    return { message: "Hello Fastrack" };
  });

  await app.listen({ port: 3000, host: "0.0.0.0" });
  console.log("Hello Fastrack Service listening on http://0.0.0.0:3000");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
