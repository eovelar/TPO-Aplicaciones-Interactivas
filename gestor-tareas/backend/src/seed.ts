import { AppDataSource } from "./config/db";  
import { User } from "./entities/User";  
import { Task } from "./entities/Task";  

const seed = async () => {
  try {
    console.log("🌱 Ejecutando seeds...");

    // Inicializar conexión
    await AppDataSource.initialize();

    // Limpiar tablas antes de insertar datos (equivalente a { force: true } en Sequelize)
    await AppDataSource.manager.query(`TRUNCATE "task", "user" RESTART IDENTITY CASCADE`);

    // Crear usuarios
    const admin = AppDataSource.manager.create(User, {
      name: "Admin",
      email: "admin@test.com",
      password: "123456",
      role: "propietario",
    });
    await AppDataSource.manager.save(admin);

    const user1 = AppDataSource.manager.create(User, {
      name: "Usuario 1",
      email: "user1@test.com",
      password: "123456",
      role: "miembro",
    });
    await AppDataSource.manager.save(user1);

    // Crear tareas
    const task1 = AppDataSource.manager.create(Task, {
      title: "Tarea inicial Admin",
      description: "Ejemplo de tarea creada por el propietario",
      priority: "alta",
      status: "pendiente",
      user: admin, // 👈 relación con usuario
    });
    await AppDataSource.manager.save(task1);

    const task2 = AppDataSource.manager.create(Task, {
      title: "Tarea inicial User1",
      description: "Ejemplo de tarea creada por un miembro",
      priority: "media",
      status: "pendiente",
      user: user1,
    });
    await AppDataSource.manager.save(task2);

    console.log("✅ Seeds ejecutados con éxito");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seeds:", error);
    process.exit(1);
  }
};

seed();
