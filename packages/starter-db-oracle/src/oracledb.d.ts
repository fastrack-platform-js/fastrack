declare module "oracledb" {
  export interface PoolAttributes {
    user?: string;
    password?: string;
    connectString?: string;
    poolMin?: number;
    poolMax?: number;
  }
  export interface Pool {
    getConnection(): Promise<Connection>;
    close(gracePeriod?: number): Promise<void>;
  }
  export interface Connection {
    execute(sql: string, params?: unknown[]): Promise<{ rows?: unknown[] }>;
    close(): Promise<void>;
  }
  export function createPool(config: PoolAttributes): Promise<Pool>;
}
