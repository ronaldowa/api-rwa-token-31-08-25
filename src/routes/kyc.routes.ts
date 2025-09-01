import { Router } from 'express';
import { createOrUpdateKyc } from '../controllers/kyc.controller';
import { upload } from '../middleware/upload';

const router = Router();

// Envio de foto KYC
router.post('/:userId', upload.single('foto'), createOrUpdateKyc);

export default router;
