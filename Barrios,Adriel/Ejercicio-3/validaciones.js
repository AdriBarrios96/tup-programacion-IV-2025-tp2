// validaciones.js
import { param, body, validationResult } from "express-validator";

// 1. Validaciones para el BODY (Alumnos y Notas)
export const validarAlumnoNotas = [
    body("alumno")
        .trim().notEmpty().isLength({ max: 50 }).withMessage('El nombre del alumno es requerido y debe tener hasta 50 caracteres.'),
    
    body("id_materia")
        .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un número entero positivo.'),

    // Usamos los nombres de columna de tu tabla
    body("nota1").isFloat({ min: 1, max: 10 }).withMessage('Nota 1 debe ser un número entre 1 y 10.'),
    body("nota2").isFloat({ min: 1, max: 10 }).withMessage('Nota 2 debe ser un número entre 1 y 10.'),
    body("note3").isFloat({ min: 1, max: 10 }).withMessage('Nota 3 debe ser un número entre 1 y 10.'),
];

// 2. Validaciones para PARAM (ID)
export const validarId = param("id").isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.');


// 3. Manejador de Errores (Middleware centralizado)
export const verificarValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Falla de validacion en los datos de entrada.",
            errores: validacion.array(),
        });
    }
    next();
};