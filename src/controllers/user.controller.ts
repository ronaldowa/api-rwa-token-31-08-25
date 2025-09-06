import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";

// Cria instância do Prisma
const prisma = new PrismaClient();

// -------------------- Criptografia da privateKey --------------------
const algorithm = "aes-256-gcm";
const secretKey = Buffer.from(process.env.PRIVATE_KEY_SECRET!, "hex");
const ivLength = 16;

const encryptPrivateKey = (privateKey: string) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
};

const decryptPrivateKey = (ciphertext: string) => {
  const [ivHex, encryptedText, authTagHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// -------------------- Função para gerar carteira --------------------
const generateWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    privateKey: wallet.privateKey,
    publicAddress: wallet.address,
  };
};

// -------------------- Controller --------------------
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria usuário + cart + KYC em transação
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Criar usuário
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      // 2. Criar carteira
      const wallet = generateWallet();

      const cart = await prisma.cart.create({
        data: {
          userId: user.id,
          privateKey: encryptPrivateKey(wallet.privateKey),
          publicAddress: wallet.publicAddress,
        },
      });

      // 3. Criar KYC automático (status pendente)
      const kyc = await prisma.kYC.create({
        data: {
          userId: user.id,
          cpf: "", // vazio até o usuário preencher
          dataNascimento: new Date("1900-01-01"), // placeholder
          endereco: "",
          status: "pendente",
        },
      });

      // Retorna usuário + cart + kyc (sem privateKey)
      return {
        user,
        cart: { publicAddress: cart.publicAddress },
        kyc,
      };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { cart: { select: { publicAddress: true } } },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { cart: { select: { publicAddress: true } } },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: any = { ...req.body };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await userService.updateUser(id, data);
    if (!updated) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(id);
    if (!deleted) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
