import { Router } from 'express';
import { createOrUpdateKyc, UpdateKyc, findId, finds } from '../controllers/kyc.controller';
import { upload } from '../middleware/upload';

const router = Router();

// Nova rota: lista todos
router.get('/', finds);

// Envio de foto KYC
router.post('/:userId', upload.single('foto'), createOrUpdateKyc);

// Nova rota: atualização parcial (PATCH)
router.patch('/:userId', upload.single('foto'), UpdateKyc);

// Nova rota: busca por userId
router.get('/:userId', findId);

export default router;
