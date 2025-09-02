import { Router } from 'express';
import { createUser, getUsers, updateUser, deleteUser, getUser } from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
