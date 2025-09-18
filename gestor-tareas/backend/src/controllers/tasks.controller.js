import { Task } from "../models/Task.js";

// listar tareas - si es propietario ve todas, si es miembro solo las suyas
export const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "propietario") {
      tasks = await Task.findAll();
    } else {
      tasks = await Task.findAll({ where: { userId: req.user.id } });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas", error });
  }
};

// Crear tarea - se guarda con el userId del usuario logueado
export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id, // importante para identificar prop
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la tarea", error });
  }
};

// actualizar tarea - miembro solo sus tareas, propietario cualquiera
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (req.user.role !== "propietario" && task.userId !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await task.update(req.body);
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar la tarea", error });
  }
};

// eliminar tarea - miembro solo sus tareas, propietario cualquiera
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (req.user.role !== "propietario" && task.userId !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await task.destroy();
    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la tarea", error });
  }
};
