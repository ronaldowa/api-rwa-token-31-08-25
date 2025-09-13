import { Router } from 'express';
import * as txMintController from '../controllers/txMintController';

const router = Router();

router.get('/', txMintController.findAll);
router.get('/user/:userId', txMintController.findByUserId);

export default router;
