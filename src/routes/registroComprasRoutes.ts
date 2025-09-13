import { Router } from "express";
import registroComprasController from "../controllers/registroComprasController";

const router = Router();

// Todas as rotas CRUD ficam disponíveis em /registro-compras
router.use("/", registroComprasController);

export default router;
