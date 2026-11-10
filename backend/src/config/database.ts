import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// export const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: Number(process.env.DB_PORT) || 3306,
//   user: process.env.DB_USER || 'baiten_user',
//   password: process.env.DB_PASSWORD || 'baiten_pass',
//   database: process.env.DB_NAME || 'seinenkai_baiten',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   decimalNumbers: true, // Garante que DECIMAL seja retornado como number
// });

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'seinenkai_baiten',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true, // Garante que DECIMAL seja retornado como number
});

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('❌ Falha ao conectar ao MySQL:', error);
    return false;
  }
}

