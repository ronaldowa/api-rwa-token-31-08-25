import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import kycRoutes from './routes/kyc.routes';
import projetoRoutes from "./routes/projeto.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/kyc', kycRoutes);
app.use("/projetos", projetoRoutes);
export default app;
