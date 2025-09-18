import { Task } from "../models/Task.js";

export const getTasks = async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la tarea", error });
  }
};

export const updateTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  await task.update(req.body);
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  await task.destroy();
  res.json({ message: "Tarea eliminada" });
};
