import mysql from 'mysql2/promise';

import type { PoolOptions } from 'mysql2';

const poolOptions: PoolOptions = {
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  port: Number(process.env.MYSQL_PORT),
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
  decimalNumbers: true // default is to represent decimals as string, this represents them as numbers
};

const connection = mysql.createPool(poolOptions);

export default connection;