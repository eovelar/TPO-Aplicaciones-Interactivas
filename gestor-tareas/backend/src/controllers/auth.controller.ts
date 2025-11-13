import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const userRepo = AppDataSource.getRepository(User);

// Registro de usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el email ya existe
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Crear usuario nuevo
    const newUser = userRepo.create({ name, email, password, role });
    await userRepo.save(newUser);

    return res.status(201).json({
      message: "Usuario registrado correctamente ✅",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error en registro", error });
  }
};

// Login de usuario (sin JWT, usando headers)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await userRepo.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const valid = await existingUser.checkPassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // En lugar de token, devolvemos los datos del usuario
    return res.status(200).json({
      message: "Login exitoso ✅",
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
      info: "Usá estos datos en los headers (x-user-id, x-user-role) para probar endpoints.",
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en login", error });
  }
};

// Eliminar usuario → solo propietario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { id } = req.params;

    const existingUser = await userRepo.findOne({ where: { id: Number(id) } });
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await userRepo.remove(existingUser);
    return res.status(200).json({ message: "Usuario eliminado correctamente ✅" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};
