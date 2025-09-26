"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./config/data-source");
const User_1 = require("./entities/User");
const Task_1 = require("./entities/Task");
const Team_1 = require("./entities/Team");
const seed = async () => {
    try {
        console.log("Ejecutando seeds...");
        await data_source_1.AppDataSource.initialize();
        // Limpiar tablas
        await data_source_1.AppDataSource.manager.query(`TRUNCATE "task", "team", "user" RESTART IDENTITY CASCADE`);
        // Crear propietario (Admin)
        const admin = data_source_1.AppDataSource.manager.create(User_1.User, {
            name: "Admin",
            email: "admin@test.com",
            password: "admin123",
            role: "propietario",
        });
        await data_source_1.AppDataSource.manager.save(admin);
        // Crear miembros
        const eva = data_source_1.AppDataSource.manager.create(User_1.User, {
            name: "Eva",
            email: "eva@example.com",
            password: "eva123",
            role: "miembro",
        });
        const lucia = data_source_1.AppDataSource.manager.create(User_1.User, {
            name: "Lucia",
            email: "lucia@example.com",
            password: "lucia123",
            role: "miembro",
        });
        const juan = data_source_1.AppDataSource.manager.create(User_1.User, {
            name: "Juan",
            email: "juan@example.com",
            password: "juan123",
            role: "miembro",
        });
        const maria = data_source_1.AppDataSource.manager.create(User_1.User, {
            name: "Maria",
            email: "maria@example.com",
            password: "maria123",
            role: "miembro",
        });
        const pedro = data_source_1.AppDataSource.manager.create(User_1.User, {
            name: "Pedro",
            email: "pedro@example.com",
            password: "pedro123",
            role: "miembro",
        });
        await data_source_1.AppDataSource.manager.save([eva, lucia, juan, maria, pedro]);
        // Crear equipos con owner + members
        const equipoA = data_source_1.AppDataSource.manager.create(Team_1.Team, {
            name: "Equipo A",
            owner: admin, // propietario del equipo
            members: [eva, juan], // miembros del equipo
        });
        const equipoB = data_source_1.AppDataSource.manager.create(Team_1.Team, {
            name: "Equipo B",
            owner: lucia,
            members: [maria, pedro],
        });
        await data_source_1.AppDataSource.manager.save([equipoA, equipoB]);
        // Crear tareas nuevas
        const task1 = data_source_1.AppDataSource.manager.create(Task_1.Task, {
            title: "Configurar servidor",
            description: "Admin debe levantar el servidor de producción",
            priority: "alta",
            status: "pendiente",
            user: admin,
        });
        const task2 = data_source_1.AppDataSource.manager.create(Task_1.Task, {
            title: "Diseñar prototipo",
            description: "Eva trabaja en el prototipo de la interfaz",
            priority: "media",
            status: "en progreso",
            user: eva,
        });
        const task3 = data_source_1.AppDataSource.manager.create(Task_1.Task, {
            title: "Escribir documentación",
            description: "Juan prepara la documentación técnica inicial",
            priority: "baja",
            status: "pendiente",
            user: juan,
        });
        await data_source_1.AppDataSource.manager.save([task1, task2, task3]);
        console.log("Seeds ejecutados con éxito (usuarios + equipos + nuevas tareas)");
        process.exit(0);
    }
    catch (error) {
        console.error("Error al ejecutar seeds:", error);
        process.exit(1);
    }
};
seed();
