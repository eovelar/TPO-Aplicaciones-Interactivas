import { AppDataSource } from "./config/data-source";
import { User } from "./entities/User";
import { Task } from "./entities/Task";
import { Team } from "./entities/Team";

const seed = async () => {
  try {
    console.log("🌱 Ejecutando seeds...");

    await AppDataSource.initialize();

    // Limpiar tablas
    await AppDataSource.manager.query(
      `TRUNCATE "task", "team", "user" RESTART IDENTITY CASCADE`
    );

    // Crear propietario (Admin)
    const admin = AppDataSource.manager.create(User, {
      name: "Admin",
      email: "admin@test.com",
      password: "admin123",
      role: "propietario",
    });
    await AppDataSource.manager.save(admin);

    // Crear miembros
    const eva = AppDataSource.manager.create(User, {
      name: "Eva",
      email: "eva@example.com",
      password: "eva123",
      role: "miembro",
    });
    const lucia = AppDataSource.manager.create(User, {
      name: "Lucia",
      email: "lucia@example.com",
      password: "lucia123",
      role: "miembro",
    });
    const juan = AppDataSource.manager.create(User, {
      name: "Juan",
      email: "juan@example.com",
      password: "juan123",
      role: "miembro",
    });
    const maria = AppDataSource.manager.create(User, {
      name: "Maria",
      email: "maria@example.com",
      password: "maria123",
      role: "miembro",
    });
    const pedro = AppDataSource.manager.create(User, {
      name: "Pedro",
      email: "pedro@example.com",
      password: "pedro123",
      role: "miembro",
    });

    await AppDataSource.manager.save([eva, lucia, juan, maria, pedro]);

    // Crear equipos con owner + members
    const equipoA = AppDataSource.manager.create(Team, {
      name: "Equipo A",
      owner: admin,             // 👈 propietario del equipo
      members: [eva, juan],     // 👈 miembros del equipo
    });

    const equipoB = AppDataSource.manager.create(Team, {
      name: "Equipo B",
      owner: lucia,
      members: [maria, pedro],
    });

    await AppDataSource.manager.save([equipoA, equipoB]);

    // Crear tareas nuevas
    const task1 = AppDataSource.manager.create(Task, {
      title: "Configurar servidor",
      description: "Admin debe levantar el servidor de producción",
      priority: "alta",
      status: "pendiente",
      user: admin,
    });

    const task2 = AppDataSource.manager.create(Task, {
      title: "Diseñar prototipo",
      description: "Eva trabaja en el prototipo de la interfaz",
      priority: "media",
      status: "en progreso",
      user: eva,
    });

    const task3 = AppDataSource.manager.create(Task, {
      title: "Escribir documentación",
      description: "Juan prepara la documentación técnica inicial",
      priority: "baja",
      status: "pendiente",
      user: juan,
    });

    await AppDataSource.manager.save([task1, task2, task3]);

    console.log("✅ Seeds ejecutados con éxito (usuarios + equipos + nuevas tareas)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seeds:", error);
    process.exit(1);
  }
};

seed();
