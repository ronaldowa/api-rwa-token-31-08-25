import { Router } from 'express';
import { criarPix, consultarStatusPix, asaasWebhook } from '../controllers/pix.controller';

const router = Router();

router.post('/', criarPix);               // criar PIX e salvar no DB
router.get('/:id/status', consultarStatusPix); // consultar/atualizar status manualmente
router.post('/webhook', asaasWebhook);    // endpoint público para Asaas

export default router;
