import { Request, Response } from 'express';
import * as kycService from '../services/kyc.service';

export const createOrUpdateKyc = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'UserId inválido' });

    const { cpf, dataNascimento, endereco } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const kyc = await kycService.createOrUpdateKyc(userId, {
      cpf,
      dataNascimento: new Date(dataNascimento),
      endereco,
      foto,
      status: 'pendente', // Ao criar/atualizar manualmente fica pendente
    });

    res.status(200).json(kyc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Novo handler: atualização parcial (PATCH)
export const UpdateKyc = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'UserId inválido' });

    const { cpf, dataNascimento, endereco, status } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const updateData: any = {};
    if (cpf !== undefined) updateData.cpf = cpf;
    if (dataNascimento !== undefined) updateData.dataNascimento = new Date(dataNascimento);
    if (endereco !== undefined) updateData.endereco = endereco;
    if (foto !== undefined) updateData.foto = foto;
    if (status !== undefined) updateData.status = status;

    const kyc = await kycService.updateKyc(userId, updateData);

    res.status(200).json(kyc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Novo handler: busca por userId
export const findId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'UserId inválido' });

    const kyc = await kycService.findId(userId);
    if (!kyc) return res.status(404).json({ error: 'KYC não encontrado' });

    res.status(200).json(kyc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Novo handler: lista todos os KYC
export const finds = async (_req: Request, res: Response) => {
  try {
    const kycs = await kycService.finds();
    res.status(200).json(kycs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Atualiza apenas o status do KYC pelo id
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const kycId = parseInt(req.params.id);
    if (!kycId) return res.status(400).json({ error: 'KycId inválido' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status obrigatório' });

    const kyc = await kycService.updateKyc(kycId, { status });
    if (!kyc) return res.status(404).json({ error: 'KYC não encontrado' });

    res.status(200).json(kyc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
