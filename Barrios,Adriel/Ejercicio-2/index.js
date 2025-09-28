// BASE PARA INICIAR CON EL SERVIDOR Y UNA API
import express from "express";
import { conectarDB } from "./db.js";
import tareasRouter from "./tareas.js";

//conectamos la BD
conectarDB();

const app = express();
const port = 1234;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de Tareas funcionando!");
});

app.use("/tareas", tareasRouter);

app.listen(port, () => {
    console.log(`La aplicacion funciona en el puerto: ${port}`);
});