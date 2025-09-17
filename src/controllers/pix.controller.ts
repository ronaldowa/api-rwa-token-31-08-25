import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// 1) Criar PIX imediato e registrar no DB
export const criarPix = async (req: Request, res: Response) => {
  try {
    const { userId, projetoId, valor } = req.body;
    if (!userId || !projetoId || !valor) {
      return res.status(400).json({ error: 'userId, projetoId e valor são obrigatórios' });
    }

    // Buscar user + kyc (precisa do cpf)
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const kyc = await prisma.kYC.findUnique({ where: { userId: user.id } });
    if (!kyc) return res.status(400).json({ error: 'KYC não cadastrado (cpf required)' });

    // Buscar projeto
    const projeto = await prisma.projeto.findUnique({ where: { id: Number(projetoId) } });
    if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' });

    // Chamada Asaas
    const body = {
      customer: { name: user.name, email: user.email, cpfCnpj: kyc.cpf },
      billingType: 'PIX',
      value: Number(valor),
      description: `PIX imediato - Projeto ${projeto.name}`,
      dueDate: new Date().toISOString().split('T')[0]
    };

    const resp = await fetch('https://sandbox.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'access_token': process.env.ASAAS_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (data.errors) return res.status(400).json({ error: data.errors });

    // Salva no DB
    const pagamento = await prisma.pixPayment.create({
      data: {
        userId: user.id,
        projetoId: projeto.id, // ✅ necessário
        value: Number(valor),
        status: (data.status ?? 'PENDING').toUpperCase(),
        qrCode: data.pixQrCode ?? null,
        qrCodeBase64: data.pixQrCodeBase64 ?? null,
        asaasId: String(data.id)
      }
    });

    return res.status(201).json({ message: 'PIX gerado', pagamento });
  } catch (err: any) {
    console.error('criarPix error:', err);
    return res.status(500).json({ error: err.message || err });
  }
};


// 2) Consultar status no Asaas e atualizar DB (manual)
export const consultarStatusPix = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id do registro PixPayment no DB
    const pagamento = await prisma.pixPayment.findUnique({ where: { id: Number(id) } });
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const resp = await fetch(`https://sandbox.asaas.com/api/v3/payments/${pagamento.asaasId}`, {
      headers: { 'access_token': process.env.ASAAS_API_KEY || '', 'Content-Type': 'application/json' }
    });
    const data = await resp.json();
    if (data.errors) return res.status(400).json({ error: data.errors });

    const atualizado = await prisma.pixPayment.update({
      where: { id: pagamento.id },
      data: { status: (data.status ?? pagamento.status).toUpperCase(), qrCode: data.pixQrCode ?? pagamento.qrCode, qrCodeBase64: data.pixQrCodeBase64 ?? pagamento.qrCodeBase64 }
    });

    return res.json(atualizado);
  } catch (err: any) {
    console.error('consultarStatusPix error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// 3) Webhook Asaas — Asaas enviará evento quando pagamento for recebido/atualizado
export const asaasWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body; // consulte a estrutura (event / payment) na sua conta Asaas
    // Padrão seguro: procure payment.id e payment.status
    const payment = payload?.payment || payload?.resource || payload;
    const asaasId = payment?.id;
    const newStatus = (payment?.status || payment?.paymentStatus)?.toString().toUpperCase();

    if (!asaasId) {
      console.warn('Webhook sem payment.id:', payload);
      return res.status(400).json({ error: 'payload inválido' });
    }

    // Atualiza registro correspondente
    const registro = await prisma.pixPayment.findUnique({ where: { asaasId } });
    if (!registro) {
      console.warn('Pagamento não encontrado no DB para asaasId', asaasId);
      return res.status(200).json({ message: 'OK - pagamento não encontrado localmente' }); // evitar retries desnecessários
    }

    if (registro.status !== newStatus) {
      await prisma.pixPayment.update({ where: { id: registro.id }, data: { status: newStatus } });
      console.log(`Pagamento ${registro.id} atualizado para ${newStatus}`);
    }

    // Retorne 200 rápido
    return res.status(200).json({ message: 'webhook processed' });
  } catch (err: any) {
    console.error('asaasWebhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
