import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// MariaDB connection
const pool = mysql.createPool({
  host: '82.67.56.137',
  port: 11407,
  user: 'web',
  password: 'corne2002',
  database: 'website',
});

export const db = drizzle(pool, { schema, mode: 'default' });