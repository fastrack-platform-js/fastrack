import { Type, type Static } from "@sinclair/typebox";
import oracledb from "oracledb";
import type { FastifyInstance } from "fastify";
import type { FastrackStarter, FastrackContext } from "@fastrack/core";
import { registerHealthContributor } from "@fastrack/starter-actuator";

export const OracleStarterConfigSchema = Type.Object({
  connectionString: Type.String(),
  user: Type.Optional(Type.String()),
  password: Type.Optional(Type.String()),
  poolMin: Type.Optional(Type.Number({ default: 0 })),
  poolMax: Type.Optional(Type.Number({ default: 10 })),
});

export type OracleStarterConfig = Static<typeof OracleStarterConfigSchema>;

export interface OracleClient {
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
  transaction<T>(fn: (tx: { query: (sql: string, params?: unknown[]) => Promise<unknown[]> }) => Promise<T>): Promise<T>;
  health(): Promise<{ ok: boolean }>;
}

export const oracleStarter: FastrackStarter<OracleStarterConfig> = {
  name: "db-oracle",
  configSchema: OracleStarterConfigSchema,
  defaults: { poolMin: 0, poolMax: 10 },
  register(app: FastifyInstance, ctx: FastrackContext, config: OracleStarterConfig) {
    const poolConfig: oracledb.PoolAttributes = {
      user: config.user,
      password: config.password,
      connectString: config.connectionString,
      poolMin: config.poolMin ?? 0,
      poolMax: config.poolMax ?? 10,
    };
    let pool: oracledb.Pool | null = null;
    async function getPool(): Promise<oracledb.Pool> {
      if (!pool) pool = await oracledb.createPool(poolConfig);
      return pool;
    }
    const client: OracleClient = {
      async query(sqlText: string, params?: unknown[]) {
        const p = await getPool();
        const conn = await p.getConnection();
        try {
          const result = await conn.execute(sqlText, params ?? []);
          return (result.rows ?? []) as unknown[];
        } finally {
          await conn.close();
        }
      },
      async transaction<T>(fn: (tx: { query: (s: string, p?: unknown[]) => Promise<unknown[]> }) => Promise<T>) {
        const p = await getPool();
        const conn = await p.getConnection();
        try {
          await conn.execute("BEGIN NULL; END;");
          const tx = {
            query: async (sqlText: string, params?: unknown[]) => {
              const result = await conn.execute(sqlText, params ?? []);
              return (result.rows ?? []) as unknown[];
            },
          };
          const out = await fn(tx);
          return out;
        } finally {
          await conn.close();
        }
      },
      async health() {
        try {
          const rows = await client.query("SELECT 1 FROM DUAL");
          return { ok: Array.isArray(rows) && rows.length > 0 };
        } catch {
          return { ok: false };
        }
      },
    };
    app.decorate("oracle", client);
    registerHealthContributor(app, "oracle", () => client.health());
    ctx.onShutdown?.(async () => {
      if (pool) await pool.close(10);
    });
  },
};
