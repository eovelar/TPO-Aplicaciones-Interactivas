"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../config/data-source");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * Resetea todas las tablas
 * Solo accesible para usuarios con rol "propietario"
 */
router.delete("/reset", (0, role_middleware_1.hasRole)(["propietario"]), async (req, res) => {
    try {
        await data_source_1.AppDataSource.manager.query(`TRUNCATE "task", "team", "user" RESTART IDENTITY CASCADE`);
        return res.json({ message: "✅ Base de datos reseteada" });
    }
    catch (error) {
        console.error("❌ Error al resetear la BD:", error);
        return res.status(500).json({ message: "Error al resetear la base de datos" });
    }
});
exports.default = router;
