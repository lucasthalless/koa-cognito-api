import "reflect-metadata";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { AppDataSource } from "./database/data-source";
// import router from "./routes";

const app = new Koa();

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// Middlewares
app.use(cors());
app.use(bodyParser());

// Routes
// app.use(router.routes());
// app.use(router.allowedMethods());

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
