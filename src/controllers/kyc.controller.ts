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
