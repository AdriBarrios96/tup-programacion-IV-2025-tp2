// alumnos.js
import express from "express";
import { db } from "./db.js";
import { validarAlumnoNotas, validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// ----------------------------------------------------------------------
// POST: Crear nuevo registro
// ----------------------------------------------------------------------
router.post(
    "/notas", 
    validarAlumnoNotas, 
    verificarValidaciones,   
    async (req, res) => {
    
    const { alumno, id_materia, nota1, nota2, note3 } = req.body; 

    // 1. Verificación de unicidad: (alumno + id_materia)
    const [existente] = await db.execute(
        "SELECT id FROM alumnos WHERE alumno = ? AND id_materia = ?", 
        [alumno, id_materia]
    );

    if (existente.length > 0) {
        return res.status(409).json({ 
            success: false, 
            message: "El alumno ya tiene notas registradas para esta materia." 
        });
    }

    // 2. Inserción en la base de datos
    const sql = `INSERT INTO alumnos (alumno, id_materia, nota1, nota2, note3) VALUES (?, ?, ?, ?, ?)`;
    const values = [alumno, id_materia, nota1, nota2, note3];

    const [result] = await db.execute(sql, values);
    
    res.status(201).json({ 
        success: true,
        mensaje: "Notas registradas exitosamente.",
        id: result.insertId
    });
});

// ----------------------------------------------------------------------
// GET: Listar todos los registros (JOIN)
// ----------------------------------------------------------------------
router.get("/notas", async (req, res) => {
    
    const sql = 
        `SELECT 
            a.id, 
            a.alumno,        
            m.nombre_materia AS materia, 
            a.nota1,         
            a.nota2,         
            a.note3          
        FROM 
            alumnos a
        JOIN 
            materias m ON a.id_materia = m.id
        ORDER BY 
            a.alumno, m.nombre_materia`;

    const [rows] = await db.execute(sql);

    // Mantenemos la lógica de promedio
    const datosConPromedio = rows.map(registro => {
        // Usamos note3 para el cálculo
        const promedio = (registro.nota1 + registro.nota2 + registro.note3) / 3;
        return {
            ...registro,
            promedio: Number(promedio.toFixed(2))
        };
    });

    res.json({ success: true, data: datosConPromedio });
});


// ----------------------------------------------------------------------
// PUT: Modificar un registro por ID
// ----------------------------------------------------------------------
router.put(
    "/notas/:id", 
    validarId,      
    validarAlumnoNotas,   
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { alumno, id_materia, nota1, nota2, note3 } = req.body; 

        // 1. Verificación de unicidad contra OTROS registros
        const [existente] = await db.execute(
            "SELECT id FROM alumnos WHERE alumno = ? AND id_materia = ? AND id != ?", 
            [alumno, id_materia, id]
        );

        if (existente.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: "La combinación de Alumno y Materia ya existe en otro registro." 
            });
        }
        
        // 2. Actualización
        const sql = `
            UPDATE alumnos 
            SET alumno = ?, id_materia = ?, nota1 = ?, nota2 = ?, note3 = ? 
            WHERE id = ?`;
        
        const values = [alumno, id_materia, nota1, nota2, note3, id];

        const [result] = await db.execute(sql, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, mensaje: "Registro de notas no encontrado." });
        }

        res.status(200).json({ 
            success: true,
            mensaje: "Notas modificadas exitosamente.",
            id: id
        });
    }
);

export default router;