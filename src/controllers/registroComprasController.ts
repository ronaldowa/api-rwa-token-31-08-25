import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * Criar uma nova compra
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, valorDaCompra, quantidadeToken, projetoId } = req.body;

    if (!userId || !valorDaCompra || !quantidadeToken || !projetoId) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    // Gerar comprovante aleatório legível
    const comprovante = `CMP-${Math.floor(Math.random() * 1_000_000_000)}`;

    const compra = await prisma.registroCompras.create({
      data: {
        userId,
        valorDaCompra,
        quantidadeToken,
        projetoId, // vincula a compra ao projeto
        comprovante,
      },
      include: {
        projeto: true, // retorna dados do projeto junto
        user: true,    // retorna dados do usuário junto
      },
    });

    res.status(201).json(compra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar compra" });
  }
});

/**
 * Listar todas as compras
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const compras = await prisma.registroCompras.findMany({
      include: { user: true },
    });
    res.json(compras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar compras" });
  }
});

/**
 * Listar compras por usuário
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const compras = await prisma.registroCompras.findMany({
      where: { userId: parseInt(userId) },
      include: { user: true },
    });
    res.json(compras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar compras do usuário" });
  }
});

/**
 * Atualizar compra
 */
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { valorDaCompra, quantidadeToken } = req.body;

  try {
    const compra = await prisma.registroCompras.update({
      where: { id: parseInt(id) },
      data: { valorDaCompra, quantidadeToken },
    });
    res.json(compra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar compra" });
  }
});

/**
 * Deletar compra
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.registroCompras.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Compra deletada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar compra" });
  }
});

export default router;
