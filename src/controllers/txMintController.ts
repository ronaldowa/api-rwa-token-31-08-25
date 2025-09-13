import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buscar todas as transações
export const findAll = async (req: Request, res: Response) => {
  try {
    const txMints = await prisma.txMint.findMany();
    res.json(txMints);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
};

// Buscar transações por userId
export const findByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const txMints = await prisma.txMint.findMany({
      where: { userId: Number(userId) }
    });
    res.json(txMints);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar transações por usuário.' });
  }
};
