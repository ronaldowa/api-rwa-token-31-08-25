"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const projeto_controller_1 = require("../controllers/projeto.controller");
const router = (0, express_1.Router)();
// Configuração do Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// Rotas
router.post('/', upload.array('fotos', 5), projeto_controller_1.createProjeto); // até 5 fotos
router.get('/', projeto_controller_1.getProjetos);
router.get('/:id', projeto_controller_1.getProjetoById);
router.put('/:id', upload.array('fotos', 5), projeto_controller_1.updateProjeto);
router.delete('/:id', projeto_controller_1.deleteProjeto);
exports.default = router;
