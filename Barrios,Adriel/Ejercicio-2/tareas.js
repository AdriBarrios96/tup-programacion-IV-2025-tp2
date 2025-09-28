import express from "express";
import { db } from "./db.js";
import { verificarValidaciones, validarId } from "./validaciones.js";
import { query, body} from "express-validator";

//Validaciones para el BODY (POST/PUT)
const validarTareaBody = [
    body("nombre").trim().notEmpty().isLength({ max: 100 }).withMessage('El nombre de la tarea es requerido (máx. 100 chars).'),
    body("completado").optional().isBoolean().withMessage('El campo "completado" debe ser true o false.'),
];

//Validaciones para el QUERY (filtro)
const validarFiltroTarea = [
    query("estado")
        .optional()
        .custom(value => {
            if (value !== 'completado' && value !== 'sin-completar') {
                throw new Error("El filtro 'estado' debe ser 'completado' o 'sin-completar'.");
            }
            return true;
        })
];

const router = express.Router();

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// GET -- Listado y Filtros

router.get("/", validarFiltroTarea, verificarValidaciones, async (req, res) => {
    const { estado } = req.query; 

    let sql = "SELECT * FROM tareas";
    
    if (estado === "completado") {
        sql += " WHERE completado = 1";
    } else if (estado === "sin-completar") {
        sql += " WHERE completado = 0";
    }

    // Si falla la consulta, lanzará un error que deberá ser manejado por Express globalmente
    const [rows] = await db.execute(sql);
    res.json({ success: true, data: rows });
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// GET -- Obtener Tarea por ID

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [rows] = await db.execute("SELECT id, nombre, completado FROM tareas WHERE id=?", [id]);

    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }

    res.json({ success: true, data: rows[0] });
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// POST -- Crear Tarea (Con verificación de unicidad)
router.post("/", validarTareaBody, verificarValidaciones, async (req, res) => {
    const { nombre, completado = false } = req.body; 
    
    // Verificación de unicidad (Lógica de negocio, no necesita try/catch)
    const [existente] = await db.execute("SELECT id FROM tareas WHERE nombre = ?", [nombre]);
    if (existente.length > 0) {
        return res.status(409).json({ success: false, message: "La tarea ya existe. No se permiten nombres duplicados." });
    }
    
    const estadocompletado = completado ? 1 : 0; 
    
    const [result] = await db.execute(
        "INSERT INTO tareas (nombre, completado) VALUES (?, ?)",
        [nombre, estadocompletado]
    );

    res.status(201).json({ 
        success: true, 
        data: { id: result.insertId, nombre, completado: estadocompletado } 
    });
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// PUT -- Modificar Tarea por ID

router.put(
    "/:id",
    validarId,
    validarTareaBody, 
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, completado } = req.body;
        
        // Verificación de unicidad
        const [existente] = await db.execute("SELECT id FROM tareas WHERE nombre = ? AND id != ?", [nombre, id]);
        if (existente.length > 0) {
            return res.status(409).json({ success: false, message: "El nuevo nombre de tarea ya existe en otro registro." });
        }

        const estadocompletado = completado !== undefined ? (completado ? 1 : 0) : undefined;
        
        // Construcción de la consulta
        let sql = "UPDATE tareas SET ";
        const updates = [];
        const values = [];

        if (nombre !== undefined) {
            updates.push("nombre = ?");
            values.push(nombre);
        }
        if (estadocompletado !== undefined) {
            updates.push("completado = ?");
            values.push(estadocompletado);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No se proporcionaron campos para actualizar." });
        }

        sql += updates.join(", ") + " WHERE id = ?";
        values.push(id);

        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Tarea no encontrada." });
        }

        res.json({ success: true, message: "Tarea modificada exitosamente.", data: { id, nombre, completado } });
    }
);

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// DELETE: Eliminar Tarea por ID
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM tareas WHERE id=?", [id]);
    
    if (result.affectedRows === 0) {
         return res.status(404).json({ success: false, message: "Tarea no encontrada para eliminar." });
    }
    res.json({ success: true, data: id, message: "Tarea eliminada exitosamente." });
});

export default router;