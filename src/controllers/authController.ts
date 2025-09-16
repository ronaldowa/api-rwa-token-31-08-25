import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 🔹 Busca usuário no Prisma
    const user = await prisma.user.findUnique({
      where: { email },
      include: { cart: true }, // incluir dados da carteira
    });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // 🔹 Valida senha
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Senha inválida" });
    }

    // 🔹 Gera token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      cart: user.cart ? { publicAddress: user.cart.publicAddress } : null,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};
