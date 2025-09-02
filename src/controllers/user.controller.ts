import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await userService.updateUser(id, data);
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(204).end();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
