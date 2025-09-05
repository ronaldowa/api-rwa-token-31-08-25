import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/user.routes';
import kycRoutes from './routes/kyc.routes';
import projetoRoutes from "./routes/projeto.routes";
import balanceRoutes from "./routes/balance.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/users', userRoutes);
app.use('/kyc', kycRoutes);
app.use("/projetos", projetoRoutes);
app.use("/balance", balanceRoutes);
export default app;
