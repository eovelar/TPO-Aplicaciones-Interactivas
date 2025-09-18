import express from "express";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL");
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    process.exit(1);
  }
};