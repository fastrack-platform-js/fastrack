declare module "mssql" {
  export interface ConnectionPool {
    connect(): Promise<ConnectionPool>;
    request(): Request;
    close(): Promise<void>;
  }
  export interface Request {
    input(name: string, value: unknown): Request;
    query(sql: string): Promise<{ recordset: unknown[] }>;
  }
  export interface Transaction {
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
  }
  export class ConnectionPool {
    constructor(config: string | Record<string, unknown>, options?: { max?: number });
  }
  export class Transaction {
    constructor(pool: ConnectionPool);
  }
  export class Request {
    constructor(transaction?: Transaction);
  }
}
