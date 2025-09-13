import { Request, Response } from "express";
import * as projetoService from "../services/projeto.service";

export const createProjeto = async (req: Request, res: Response) => {
  try {
    const { name, numContrato, precoTokenBRL, totalTokens, detalhesProjeto, inicioDaCapitacao, dataRecebimento } = req.body;

    // extrai arquivos enviados
    const fotos = req.files ? (req.files as Express.Multer.File[]).map(f => f.filename) : [];

    // cria o projeto com valores válidos
    const projeto = await projetoService.createProjeto({
      name,
      numContrato,
      precoTokenBRL: parseFloat(precoTokenBRL) || 0, // se não enviar, usa 0
      fotos,
      totalTokens: parseInt(totalTokens) || 0,        // obrigatório
      detalhesProjeto,
      inicioDaCapitacao,
      dataRecebimento
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
    const { name, numContrato, quantidadeToken, precoTokenBRL, detalhesProjeto, inicioDaCapitacao, dataRecebimento } = req.body;
    const fotos = req.files ? (req.files as Express.Multer.File[]).map(f => f.filename) : undefined;

    const projeto = await projetoService.updateProjeto(id, {
      name,
      numContrato,
      fotos,
      quantidadeToken: quantidadeToken ? parseInt(quantidadeToken) : undefined,
      precoTokenBRL: precoTokenBRL ? parseFloat(precoTokenBRL) : undefined,
      detalhesProjeto,
      inicioDaCapitacao,
      dataRecebimento
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
