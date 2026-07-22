const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const dbName = process.env.DB_NAME || 'hire_me_db';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || 'root';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 3306;
const dialect = process.env.DB_DIALECT || 'sqlite'; // Default to SQLite for easy local setup

let sequelize;

if (dialect === 'sqlite' || isTest) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTest ? ':memory:' : './hire_me_db.sqlite',
    logging: false,
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
  });
}

async function ensureDatabaseExists() {
  if (isTest || dialect === 'sqlite') return;
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
  } catch (error) {
    console.warn(`[Database Warning] MySQL connection failed (${error.message}).`);
  }
}

module.exports = { sequelize, ensureDatabaseExists };
