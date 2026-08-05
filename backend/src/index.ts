import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import categoryRoutes from "./routes/categories";
import incomeRoutes from "./routes/incomes";
import expenseRoutes from "./routes/expenses";
import creditCardRoutes from "./routes/creditCards";
import tuitionRoutes from "./routes/tuitions";
import goalRoutes from "./routes/goals";
import bettingRoutes from "./routes/betting";
import moduleRoutes from "./routes/modules";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gestão Financeira Pessoal API",
      version: "1.0.0",
      description: "API REST do sistema de gestão financeira pessoal SaaS-ready",
    },
    servers: [{ url: `http://localhost:${PORT}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/credit-cards", creditCardRoutes);
app.use("/api/tuitions", tuitionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/betting", bettingRoutes);
app.use("/api/modules", moduleRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Docs on http://localhost:${PORT}/api-docs`);
});
