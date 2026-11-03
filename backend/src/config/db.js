const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let useFallback = false;

// Configuration from environment variables
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'linkhub_db',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// URL parser for cloud platforms (Railway, Render, CleverCloud, etc.)
if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
  const url = new URL(process.env.MYSQL_URL || process.env.DATABASE_URL);
  dbConfig.host = url.hostname;
  dbConfig.port = parseInt(url.port || '3306', 10);
  dbConfig.user = url.username;
  dbConfig.password = url.password;
  dbConfig.database = url.pathname.replace(/^\//, '');
}

/**
 * Initialize Database Connection and run migrations
 */
async function initDatabase() {
  try {
    // Try connecting to MySQL server directly first to ensure database exists
    const initConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      connectTimeout: 4000
    });

    await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initConnection.end();

    // Now establish connection pool with the selected database
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log(`[Database] Connected to MySQL database "${dbConfig.database}" on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();

    // Run schema scripts
    await runMigrations();
    return true;
  } catch (err) {
    console.warn(`[Database Warning] Unable to connect to MySQL (${err.message}).`);
    console.warn(`[Database Note] Switching to LinkHub Resilient Memory Store for local development.`);
    console.warn(`[Database Note] To use real MySQL, ensure MySQL is running and configure credentials in backend/.env`);
    useFallback = true;
    const fallbackDb = require('./fallbackDb');
    fallbackDb.initFallbackData();
    return false;
  }
}

async function runMigrations() {
  if (!pool) return;
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (stmtErr) {
          // ignore already exists errors
        }
      }
      console.log('[Database] Schema verified and updated successfully.');
    }

    // Seed check
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const statements = seedSql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (seedErr) {
            // ignore duplicates
          }
        }
        console.log('[Database] Seed data loaded successfully.');
      }
    }
  } catch (e) {
    console.error('[Database Migration Error]', e.message);
  }
}

/**
 * Execute a query with parameters
 */
async function query(sql, params = []) {
  if (useFallback) {
    const fallbackDb = require('./fallbackDb');
    return fallbackDb.query(sql, params);
  }
  return pool.query(sql, params);
}

module.exports = {
  initDatabase,
  query,
  getPool: () => pool,
  isUsingFallback: () => useFallback
};
