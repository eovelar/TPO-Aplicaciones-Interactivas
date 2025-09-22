"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.login = exports.register = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
// Registro de usuario
const register = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: "Error en registro", error });
    }
};
exports.register = register;
// Login de usuario
const login = async (req, res) => {
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Login exitoso", token });
    }
    catch (error) {
        res.status(500).json({ message: "Error en login", error });
    }
};
exports.login = login;
// Eliminar usuario → solo propietario
const deleteUser = async (req, res) => {
    try {
        if (req.user?.role !== "propietario") {
            return res.status(403).json({ message: "No autorizado" });
        }
        const { id } = req.params;
        const user = await userRepo.findOne({ where: { id: Number(id) } });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        await userRepo.remove(user);
        res.json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error });
    }
};
exports.deleteUser = deleteUser;
