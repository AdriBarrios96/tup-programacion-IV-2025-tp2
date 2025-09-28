import { param, body, validationResult } from "express-validator";

// Validaciones para el BODY
export const validarLados = [
    // isFloat con { gt: 0 } asegura que es un número positivo
    body("base")
        .isFloat({ gt: 0 }).withMessage('La base debe ser positiva y mayor a 0.'),
    
    body("altura")
        .isFloat({ gt: 0 }).withMessage('La altura debe ser positiva y mayor a 0.')
];

// Validacion para cuadrado
export const validarLadoCuadrado = [
    body("lado")
        .isFloat({ gt: 0 }).withMessage('El lado del cuadrado debe ser un número decimal positivo.')
];

// Validaciones para PARAM (GET, PUT, DELETE /:id)
export const validarId = param("id").isInt({ min: 1 }).withMessage('El ID debe ser entero y positivo.');

// Manejador de Errores
export const verificarValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Falla la validacion.",
            errores: validacion.array(),
        });
    }
    next();
};