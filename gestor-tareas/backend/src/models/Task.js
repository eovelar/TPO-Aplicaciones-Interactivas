import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("pendiente", "progreso", "completada"),
    defaultValue: "pendiente",
  },
  priority: {
    type: DataTypes.ENUM("alta", "media", "baja"),
    defaultValue: "media",
  },
});
