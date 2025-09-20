import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

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
    const user = userRepo.create({ name, email, password, role });
    await userRepo.save(user);

    res.status(201).json({ message: "Usuario registrado", user });
  } catch (error) {
    res.status(500).json({ message: "Error en registro", error });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const valid = await user.checkPassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Asegurar que la secret existe
    if (!process.env.JWT_SECRET) {
      throw new Error("Falta definir JWT_SECRET en el archivo .env");
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error en login", error });
  }
};
