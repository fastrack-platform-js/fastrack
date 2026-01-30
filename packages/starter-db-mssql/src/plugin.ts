import { Type, type Static } from "@sinclair/typebox";
import sql from "mssql";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";
import { registerHealthContributor } from "@fastrack/starter-actuator";

export const MssqlStarterConfigSchema = Type.Object({
  connectionString: Type.String(),
  poolMax: Type.Optional(Type.Number({ default: 10 })),
});

export type MssqlStarterConfig = Static<typeof MssqlStarterConfigSchema>;

export interface MssqlClient {
  query(sql: string, params?: Record<string, unknown>): Promise<unknown[]>;
  transaction<T>(fn: (tx: { query: (sql: string, params?: Record<string, unknown>) => Promise<unknown[]> }) => Promise<T>): Promise<T>;
  health(): Promise<{ ok: boolean }>;
}

export const mssqlStarter: FastrackStarter<MssqlStarterConfig> = {
  name: "db-mssql",
  configSchema: MssqlStarterConfigSchema,
  defaults: { poolMax: 10 },
  register(app: FastifyInstance, ctx: FastrackContext, config: MssqlStarterConfig) {
    const pool = new sql.ConnectionPool(config.connectionString, { max: config.poolMax ?? 10 });
    let poolPromise: Promise<sql.ConnectionPool> | null = null;
    async function getPool(): Promise<sql.ConnectionPool> {
      if (!poolPromise) poolPromise = pool.connect();
      return poolPromise;
    }
    const client: MssqlClient = {
      async query(sqlText: string, params?: Record<string, unknown>) {
        const p = await getPool();
        const req = p.request();
        if (params) for (const [k, v] of Object.entries(params)) req.input(k, v);
        const result = await req.query(sqlText);
        return result.recordset ?? [];
      },
      async transaction<T>(fn: (tx: { query: (s: string, p?: Record<string, unknown>) => Promise<unknown[]> }) => Promise<T>) {
        const p = await getPool();
        const t = new sql.Transaction(p);
        await t.begin();
        try {
          const tx = {
            query: async (sqlText: string, params?: Record<string, unknown>) => {
              const req = new sql.Request(t);
              if (params) for (const [k, v] of Object.entries(params)) req.input(k, v);
              const result = await req.query(sqlText);
              return result.recordset ?? [];
            },
          };
          const out = await fn(tx);
          await t.commit();
          return out;
        } catch (e) {
          await t.rollback();
          throw e;
        }
      },
      async health() {
        try {
          const rows = await client.query("SELECT 1 AS n");
          return { ok: Array.isArray(rows) && rows.length > 0 };
        } catch {
          return { ok: false };
        }
      },
    };
    app.decorate("mssql", client);
    registerHealthContributor(app, "mssql", () => client.health());
    ctx.onShutdown?.(async () => {
      await pool.close();
    });
  },
};
