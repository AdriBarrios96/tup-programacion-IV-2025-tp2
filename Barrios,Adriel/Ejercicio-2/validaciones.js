// validaciones.js
import { param, query, body, validationResult } from "express-validator";

//Validaciones para PARAM ( GET, PUT, DELETE /:id)
export const validarId = param("id").isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.');

// Errores
export const verificarValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Falla de validacion",
            errores: validacion.array(),
        });
    }
    next();
};