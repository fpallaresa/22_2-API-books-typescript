import express from "express";
import cors from "cors";
import { bookRouter } from "./routes/book.routes";
import { authorRouter } from "./routes/author.routes";
import { fileUploadRouter } from "./routes/file-upload.routes.js";
import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";
import { connect } from "./db";

// Conexión a la BBDD
const main = async (): Promise<void> => {
  const database = await connect();

  // Configuración del server
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );

  // Rutas
  const router = express.Router();
  router.get("/", (req: Request, res: Response) => {
    res.send(`Esta es la home de nuestra API ${database?.connection?.name as string} `);
  });
  router.get("*", (req: Request, res: Response) => {
    res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
  });

  // Middlewares de aplicación, por ejemplo middleware de logs en consola
  app.use((req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
    next();
  });

  // Acepta /author/*
  app.use("/author", (req: Request, res: Response, next: NextFunction) => {
    console.log("Me han pedido autores!!!");
    next();
  });

  // Acepta /book/*
  app.use("/book", (req: Request, res: Response, next: NextFunction) => {
    console.log("Me han pedido libros!!!");
    next();
  });

  // Usamos las rutas
  app.use("/book", bookRouter);
  app.use("/author", authorRouter);
  app.use("/public", express.static("public"));
  app.use("/file-upload", fileUploadRouter);
  app.use("/", router);

  // Middleware de gestión de errores
  app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    console.log("*** INICIO DE ERROR ***");
    console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
    console.log(err);
    console.log("*** FIN DE ERROR ***");

    if (err?.name === "ValidationError") {
      res.status(400).json(err);
    } else {
      res.status(500).json(err);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server levantado en el puerto ${PORT}`);
  });
};
void main();
