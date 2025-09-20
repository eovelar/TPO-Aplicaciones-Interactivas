import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Team } from "../entities/Team";

dotenv.config(); // 👈 aseguramos cargar .env

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,      // 👈 correcto
  password: process.env.DB_PASSWORD,  // 👈 correcto
  database: process.env.DB_NAME,      // 👈 correcto
  synchronize: true, // ⚠️ solo para desarrollo
  logging: false,
  entities: [User, Task, Team],
});
