import { Request, Response } from "express";
import * as projetoService from "../services/projeto.service";

export const createProjeto = async (req: Request, res: Response) => {
  try {
    const { name, numContrato, precoTokenBRL, totalTokens } = req.body;

    // extrai arquivos enviados
    const fotos = req.files ? (req.files as Express.Multer.File[]).map(f => f.filename) : [];

    // cria o projeto com valores válidos
    const projeto = await projetoService.createProjeto({
      name,
      numContrato,
      precoTokenBRL: parseFloat(precoTokenBRL) || 0, // se não enviar, usa 0
      fotos,
      totalTokens: parseInt(totalTokens) || 0         // obrigatório
    });

    res.status(201).json(projeto);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const getProjetos = async (_req: Request, res: Response) => {
  try {
    const projetos = await projetoService.getProjetos();
    res.json(projetos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjetoById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const projeto = await projetoService.getProjetoById(id);
    if (!projeto) return res.status(404).json({ error: "Projeto não encontrado" });
    res.json(projeto);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjeto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, numContrato, valorEth, quantidadeToken, precoEth } = req.body;
    const fotos = req.files ? (req.files as Express.Multer.File[]).map(f => f.filename) : undefined;

    const projeto = await projetoService.updateProjeto(id, {
      name,
      numContrato,
      valorEth: valorEth ? parseFloat(valorEth) : undefined,
      fotos,
      quantidadeToken: quantidadeToken ? parseInt(quantidadeToken) : undefined,
      precoEth: precoEth ? parseFloat(precoEth) : undefined,
    });

    res.json(projeto);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProjeto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await projetoService.deleteProjeto(id);
    res.json({ message: "Projeto removido com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
