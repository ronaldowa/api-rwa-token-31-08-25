import { Router } from "express";
import multer from "multer";
import path from "path";
import * as projetoController from "../controllers/projeto.controller";

const router = Router();

// Configuração de upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/projetos"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/", upload.array("fotos", 5), projetoController.createProjeto);
router.get("/", projetoController.getProjetos);
router.get("/:id", projetoController.getProjetoById);
router.put("/:id", upload.array("fotos", 5), projetoController.updateProjeto);
router.delete("/:id", projetoController.deleteProjeto);

export default router;
