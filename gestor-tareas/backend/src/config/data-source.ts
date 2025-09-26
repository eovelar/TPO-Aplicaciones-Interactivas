// src/data-source.ts (ajustado)
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Entidades
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Team } from "../entities/Team";
import { Historial } from "../entities/historial.entities";
import { Comment } from "../entities/comment.entities";

// Subscriber de auditoría
import { AuditSubscriber } from "../subscribers/audit.subscriber";

dotenv.config();

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Importante: desactivar synchronize y usar migraciones
  synchronize: false,
  logging: false,

  entities: [User, Task, Team, Historial, Comment],

  // Migraciones (detecta tanto .ts en dev como .js en prod si compilás)
  migrations: ["src/migrations/*.{ts,js}"],

  // Registrar el subscriber de auditoría
  subscribers: [AuditSubscriber],

  // Opcional: correr migraciones automáticamente al iniciar
  // migrationsRun: true,
});
