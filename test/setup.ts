import dotenv from "dotenv";
import { beforeAll, afterAll } from "@jest/globals";
import { AppDataSource } from "../src/database/data-source";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});
