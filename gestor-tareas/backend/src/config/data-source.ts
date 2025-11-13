import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

// Cargar variables de entorno
dotenv.config();

// Importar entidades
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Team } from "../entities/Team";
import { Historial } from "../entities/Historial.entities";
import { Comment } from "../entities/comment.entities";

// Importar Subscriber de auditoría
import { AuditSubscriber } from "../subscribers/audit.subscriber";

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Configuración general
  synchronize: false, // siempre false en producción
  logging: false,

  // Registrar entidades y migraciones
  entities: [User, Task, Team, Historial, Comment],
  migrations: ["src/migrations/*.{ts,js}"],
  subscribers: [AuditSubscriber],

  namingStrategy: new SnakeNamingStrategy(),
});
