import express from "express";
import { conectarDB } from "./db.js";
import alumnosRouter from "./alumnos.js";

conectarDB();

const app = express();
const port = 1234;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de Gestión de Alumnos y Notas funcionando!");
});

app.use("/alumnos", alumnosRouter);

app.listen(port, () => {
    console.log(`La aplicación esta funcionando en el puerto ${port}`);
});