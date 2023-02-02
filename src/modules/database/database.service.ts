import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CONNECTION_POOL } from './database.module-definition';

@Injectable()
class DatabaseService {
  /**
   * @ignore
   */
  constructor(@Inject(CONNECTION_POOL) private readonly pool: Pool) {}

  /**
   * This method gets postgres pool instance
   * @returns A postgres pool instance
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * This method runs custom postgres query
   * @param query Query string with included parameters($1, $2, ...$n)
   * @param params Array of parameters
   * @example query: Select * from 'users' WHERE user.id = $1
   * @example params: [1]
   * @returns A promise with query result
   */
  async runQuery(query: string, params?: unknown[]) {
    return this.pool.query(query, params);
  }
}

export default DatabaseService;
