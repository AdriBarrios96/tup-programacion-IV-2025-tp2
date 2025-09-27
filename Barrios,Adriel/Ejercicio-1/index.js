
import express from "express";
import mysql from 'mysql2/promise';
import { check, validationResult } from 'express-validator';

const app = express();
const port = 1234;
app.use(express.json());


// Configuramos la BD

const dbConfig = {
    host: 'localhost',   
    user: 'root',        
    password: 'admin', 
    database: 'db-prog4' 
};

// Función para obtener la conexión
const getConnection = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error.message);
        throw error; 
    }
};

// MIDDLEWARE DE VALIDACIÓN CON EXPRESS-VALIDATOR
const reglasValidacion = [
    check('base')
        // isFloat verifica que sea un número flotante y sea mayor a cero.
        .isFloat({ gt: 0 }).withMessage('La base debe ser un número decimal positivo y mayor a 0.'),

    check('altura')
        .isFloat({ gt: 0 }).withMessage('La altura debe ser un número decimal positivo y mayor a 0.')
];

// Verificamos si las reglas funcionan
const manejarErrores = (req, res, next) => {
    const errors = validationResult(req); 
    
    if (!errors.isEmpty()) {
        // Si hay errores, devolvemos un 400
        return res.status(400).json({ 
            mensaje: 'Error de validación en los datos de entrada.',
            errores: errors.array() 
        });
    }
    // Si la validación es exitosa continuamos
    next();
};

// POST, Creamos un nuevo rectángulo y lo guardamos en la BD
app.post(
    "/base-altura", 
    reglasValidacion, // Ejecutamos las reglas de validación
    manejarErrores,   // Maneja los errores
    async (req, res) => {
    
    // Validacion exitosa y seguimos
    const base = req.body.base;
    const altura = req.body.altura;

    // Calculamos perimetro y base
    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    let connection;
    try {
        connection = await getConnection();
        
        const sql = `INSERT INTO rectangulos (lado_base, lado_altura, perimetro, superficie) VALUES (?, ?, ?, ?)`;
        const values = [base, altura, perimetro, superficie];

        const [result] = await connection.execute(sql, values);
        
        res.status(201).json({ 
            mensaje: "Rectángulo guardado exitosamente.",
            id: result.insertId
        });
        
    } catch (error) {
        console.error("Error al insertar el rectángulo:", error);
        res.status(500).json({ error: "Ocurrió un error en el servidor al guardar el dato." });
    }
});

// GET, Traemos todos los rectángulos guardados en la BD
app.get("/muestra", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        // Consultamos todos los registros de la tabla
        const [rows] = await connection.execute('SELECT id, lado_base, lado_altura, perimetro, superficie FROM rectangulos');

        // Mapeamos los resultados y agregamos el campo 'tipo'
        const resultadoTipo = rows.map(calculo => {
            // Verificamos si es un cuadrado o un rectángulo
            const tipo = (calculo.lado_base === calculo.lado_altura) ? 'cuadrado' : 'rectangulo';
            // Retornamos un objeto con los datos de la DB y el nuevo campo 'tipo'
            return { calculo, tipo };
        });

        res.json(resultadoTipo);
        
    } catch (error) {
        console.error("Error al obtener los rectángulos:", error);
        res.status(500).json({ error: "Ocurrió un error en el servidor al obtener los datos." });
    }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
});