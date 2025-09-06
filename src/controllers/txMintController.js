const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findAll = async (req, res) => {
  try {
    const txMints = await prisma.txMint.findMany();
    res.json(txMints);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
};

exports.findByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const txMints = await prisma.txMint.findMany({
      where: { userId: Number(userId) }
    });
    res.json(txMints);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações por usuário.' });
  }
};