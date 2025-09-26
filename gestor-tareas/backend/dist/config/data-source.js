"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../entities/User");
const Task_1 = require("../entities/Task");
const Team_1 = require("../entities/Team");
dotenv_1.default.config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, 
    logging: false,
    entities: [User_1.User, Task_1.Task, Team_1.Team],
});
