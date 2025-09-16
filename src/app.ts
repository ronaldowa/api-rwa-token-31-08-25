import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pixRoutes from './routes/pix.routes';
import txMintRoutes from './routes/txMintRoutes';
import userRoutes from './routes/user.routes';
import kycRoutes from './routes/kyc.routes';
import projetoRoutes from './routes/projeto.routes';
import balanceRoutes from './routes/balance.routes';
import registroComprasRoutes from "./routes/registroComprasRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/pix', pixRoutes);
app.use('/txmint', txMintRoutes);
app.use('/users', userRoutes);
app.use('/kyc', kycRoutes);
app.use('/projetos', projetoRoutes);
app.use('/balance', balanceRoutes);
app.use("/registro-compras", registroComprasRoutes);
app.use("/api", authRoutes);

export default app;
