import express from "express";
import { conectarDB } from "./db.js";
import rectangulosRouter from "./rectangulos.js";

// conectamos la BD
conectarDB();

const app = express();
const port = 1234;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de Rectangulos funcionando!");
});

app.use("/rectangulos", rectangulosRouter);

app.listen(port, () => {
    console.log(`La aplicacion funciona en el puerto: ${port}`);
});