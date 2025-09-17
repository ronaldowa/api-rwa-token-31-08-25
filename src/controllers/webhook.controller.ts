import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { executeMint } from "./contract.controller";

const prisma = new PrismaClient();

export const asaasWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const payment = payload?.payment || payload?.resource || payload;
    const asaasId = payment?.id;
    const newStatus = (payment?.status || payment?.paymentStatus)?.toString().toUpperCase();

    if (!asaasId) return res.status(400).json({ error: "payload inválido" });

    const registro = await prisma.pixPayment.findUnique({ where: { asaasId } });
    if (!registro) return res.status(200).json({ message: "Pagamento não encontrado localmente" });

    // Atualiza status
    if (registro.status !== newStatus) {
      await prisma.pixPayment.update({ where: { id: registro.id }, data: { status: newStatus } });
    }

    // Mint automático
    if (newStatus === "RECEIVED") {
      try {
        await executeMint({ userId: registro.userId, projetoId: registro.projetoId, amount: registro.value });
        console.log(`Mint automático executado para pagamento ${registro.id}`);
      } catch (err: any) {
        console.error("Erro no mint automático:", err.message);
      }
    }

    return res.status(200).json({ message: "webhook processed" });
  } catch (err: any) {
    console.error("asaasWebhook error:", err);
    return res.status(500).json({ error: err.message });
  }
};
