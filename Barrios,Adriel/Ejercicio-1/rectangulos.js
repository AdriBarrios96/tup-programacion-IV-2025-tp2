import express from "express";
import { db } from "./db.js";
import { validarLados, validarLadoCuadrado, validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// POST: Crea un rectángulo (Recalcula Perímetro/Superficie y guarda)

router.post(
    "/base-altura", 
    validarLados, 
    verificarValidaciones,   
    async (req, res) => {
    
    const { base, altura } = req.body;
    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    const sql = `INSERT INTO rectangulos (lado_base, lado_altura, perimetro, superficie) VALUES (?, ?, ?, ?)`;
    const values = [base, altura, perimetro, superficie];

    const [result] = await db.execute(sql, values);
    
    res.status(201).json({ 
        success: true,
        mensaje: "Se guardado el rectangulo.",
        id: result.insertId
    });
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

//POST: crea un cuadrado (recibe solo lado)
router.post(
    "/cuadrado", 
    validarLadoCuadrado, 
    verificarValidaciones,   
    async (req, res) => {
    
    const lado = req.body.lado;
    const base = lado; // Base y altura son iguales
    const altura = lado;

    const perimetro = 4 * lado;
    const superficie = lado * lado;

    const sql = `INSERT INTO rectangulos (lado_base, lado_altura, perimetro, superficie) VALUES (?, ?, ?, ?)`;
    const values = [base, altura, perimetro, superficie];

    const [result] = await db.execute(sql, values);
    
    res.status(201).json({ 
        success: true,
        mensaje: "Cuadrado guardado exitosamente.",
        id: result.insertId
    });
}); 

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// GET - Trae todos los rectángulos desde la DB

router.get("/muestra", async (req, res) => {
    
    const [rows] = await db.execute('SELECT * FROM rectangulos');

    // Mapeamos para agregar el campo 'tipo'
    const resultadoTipo = rows.map(calculo => {
        const tipo = (calculo.lado_base === calculo.lado_altura) ? 'cuadrado' : 'rectangulo';
        return { ...calculo, tipo };
    });

    res.json({ success: true, data: resultadoTipo });
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// PUT - Modifica un rectángulo por ID (Recibe lados y recalcula)

router.put(
    "/:id", 
    validarId,
    validarLados,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { base, altura } = req.body;

        const perimetro = 2 * (base + altura);
        const superficie = base * altura;

        const sql = `UPDATE rectangulos SET lado_base = ?, lado_altura = ?, perimetro = ?, superficie = ? WHERE id = ?`;
        const values = [base, altura, perimetro, superficie, id];

        const [result] = await db.execute(sql, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, mensaje: "Rectangulo no encontrado." });
        }

        res.status(200).json({ 
            success: true,
            mensaje: "Rectangulo modificado exitosamente.",
            id: id
        });
    }
);

export default router;