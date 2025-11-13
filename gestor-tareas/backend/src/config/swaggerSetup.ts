import swaggerUi from "swagger-ui-express";
import { openapi } from "../swagger";
import { Express } from "express";

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
  console.log("📘 Swagger disponible en http://localhost:4000/api-docs");
}
