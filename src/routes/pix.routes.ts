import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// Endpoint para criar pagamento PIX no Asaas Sandbox
router.post('/', async (req: Request, res: Response) => {
  try {
    const { valor, nome, email, cpfCnpj } = req.body;

    if (!valor || !nome || !email || !cpfCnpj) {
      return res.status(400).json({ error: 'Campos obrigatórios: valor, nome, email, cpfCnpj' });
    }

    // Criar pagamento PIX no Asaas Sandbox
    const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'access_token': process.env.ASAAS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: {
          name: nome,
          email: email,
          cpfCnpj: cpfCnpj
        },
        billingType: 'PIX',
        value: Number(valor),
        description: 'Pagamento teste PIX',
        dueDate: new Date(Date.now() + 3600 * 1000).toISOString().split('T')[0] // vencimento 1h
      })
    });

    const data = await response.json();

    // Retornar QR Code PIX
    res.json({
      id: data.id,
      qr_code: data.pixQrCode || null,
      qr_code_base64: data.pixQrCodeBase64 || null,
      raw: data
    });

  } catch (err: any) {
    console.error('Erro PIX Asaas:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
