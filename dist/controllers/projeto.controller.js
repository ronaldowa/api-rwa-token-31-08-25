"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjeto = exports.updateProjeto = exports.getProjetoById = exports.getProjetos = exports.createProjeto = void 0;
const projetoService = __importStar(require("../services/projeto.service"));
const createProjeto = async (req, res) => {
    try {
        const { name, numContrato, valorEth, quantidadeToken, precoEth } = req.body;
        // Fotos (array de arquivos)
        const fotos = req.files
            ? req.files.map((file) => file.filename)
            : [];
        const projeto = await projetoService.createProjeto({
            name,
            numContrato,
            valorEth: parseFloat(valorEth),
            fotos,
            quantidadeToken: parseInt(quantidadeToken),
            precoEth: parseFloat(precoEth),
        });
        res.status(201).json(projeto);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createProjeto = createProjeto;
const getProjetos = async (req, res) => {
    try {
        const projetos = await projetoService.getProjetos();
        res.json(projetos);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProjetos = getProjetos;
const getProjetoById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const projeto = await projetoService.getProjetoById(id);
        if (!projeto)
            return res.status(404).json({ error: 'Projeto não encontrado' });
        res.json(projeto);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProjetoById = getProjetoById;
const updateProjeto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, numContrato, valorEth, quantidadeToken, precoEth } = req.body;
        const fotos = req.files
            ? req.files.map((file) => file.filename)
            : undefined;
        const projeto = await projetoService.updateProjeto(id, {
            name,
            numContrato,
            valorEth: valorEth ? parseFloat(valorEth) : undefined,
            fotos,
            quantidadeToken: quantidadeToken ? parseInt(quantidadeToken) : undefined,
            precoEth: precoEth ? parseFloat(precoEth) : undefined,
        });
        res.json(projeto);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProjeto = updateProjeto;
const deleteProjeto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await projetoService.deleteProjeto(id);
        res.json({ message: 'Projeto deletado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteProjeto = deleteProjeto;
