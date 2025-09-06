import { Request, Response } from "express";
import { ethers, Contract } from "ethers";
import abi from "../services/abi.json";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const PROVIDER_URL = process.env.PROVIDER_URL as string;

if (!CONTRACT_ADDRESS) throw new Error("CONTRACT_ADDRESS não configurado no .env");
if (!PROVIDER_URL) throw new Error("PROVIDER_URL não configurado no .env");

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const contract = new Contract(CONTRACT_ADDRESS, abi, provider);

// -------------------- Funções de consulta --------------------

export const getBalance = async (req: Request, res: Response) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Endereço não informado" });
    }

    const balance = await contract.balanceOf(address);
    let balanceInUnits = ethers.formatUnits(balance, 18);

    if (balanceInUnits.endsWith(".0")) balanceInUnits = balanceInUnits.slice(0, -2);

    res.json({ address, balance: balanceInUnits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractMetadata = async (req: Request, res: Response) => {
  try {
    const metadata = await contract.contractMetadata();
    res.json({ contractMetadata: metadata });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRemainingTokensInt = async (req: Request, res: Response) => {
  try {
    const remaining = await contract.remainingTokensInt();
    res.json({ remainingTokensInt: remaining.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaxSupply = async (req: Request, res: Response) => {
  try {
    const maxSupply = await contract.MAX_SUPPLY();
    let maxSupplyInUnits = ethers.formatUnits(maxSupply, 18);
    if (maxSupplyInUnits.endsWith(".0")) maxSupplyInUnits = maxSupplyInUnits.slice(0, -2);
    res.json({ maxSupply: maxSupplyInUnits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTokenPrice = async (req: Request, res: Response) => {
  try {
    const tokenPrice = await contract.TOKEN_PRICE();
    let tokenPriceInUnits = ethers.formatUnits(tokenPrice, 18);
    if (tokenPriceInUnits.endsWith(".0")) tokenPriceInUnits = tokenPriceInUnits.slice(0, -2);
    res.json({ tokenPrice: tokenPriceInUnits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSymbol = async (req: Request, res: Response) => {
  try {
    const symbol = await contract.symbol();
    res.json({ symbol });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getName = async (req: Request, res: Response) => {
  try {
    const name = await contract.name();
    res.json({ name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminRole = async (req: Request, res: Response) => {
  try {
    const adminRole = await contract.ADMIN_ROLE();
    res.json({ adminRole });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractAddress = async (req: Request, res: Response) => {
  try {
    res.json({ contractAddress: CONTRACT_ADDRESS });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- Função mintRestricted --------------------

// -------------------- Função mintRestricted --------------------
export const mintRestricted = async (req: Request, res: Response) => {
  try {
    const { userId, projetoId, amount } = req.body;

    // Valida parâmetros
    if (!userId || !projetoId || !amount) {
      return res.status(400).json({
        error: "Parâmetros 'userId', 'projetoId' e 'amount' são obrigatórios.",
      });
    }

    // Busca usuário + carteira
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cart: true },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    // Busca projeto
    const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
    if (!projeto) return res.status(404).json({ error: "Projeto não encontrado." });

    // Busca KYC
    const kyc = await prisma.kYC.findUnique({ where: { userId } });
    if (!kyc || kyc.status !== "ativo") {
      return res.status(403).json({ error: "Usuário não possui KYC aprovado." });
    }

    // Verifica se tem carteira
    if (!user.cart || !user.cart.publicAddress) {
      return res.status(400).json({ error: "Usuário não possui carteira vinculada." });
    }
    const to = user.cart.publicAddress;

    // Configura signer
    const mnemonic =
      process.env.SECRET?.trim() ||
      "ridge jump elder copper squeeze bar valley thumb warm emerge armed cushion";
    if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
      return res.status(500).json({ error: "Seed phrase inválida." });
    }

    const signer = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
    const contractWithSigner = contract.connect(signer);

    // 🔹 Chama verifyKyc no contrato ANTES do mint
    try {
      const kycTx = await (contractWithSigner as any).verifyKyc(to);
      await kycTx.wait(1);
      console.log(`KYC verificado on-chain para ${to}: ${kycTx.hash}`);
    } catch (err: any) {
      console.error("Erro ao verificar KYC on-chain:", err);
      return res.status(500).json({ error: "Falha ao registrar KYC no contrato." });
    }

    // Converte amount para unidades do token
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    // Calcula valor de ETH a enviar
    const tokenPrice = await contract.TOKEN_PRICE();
    const valueToSend = tokenPrice * BigInt(amount);

    // Mint Restricted
    const tx = await (contractWithSigner as any).mintRestricted(to, amountWei, {
      value: valueToSend,
    });

    // Cria registro inicial no banco
    const txRecord = await prisma.txMint.create({
      data: {
        userId,
        projetoId,
        amount: parseFloat(amount.toString()),
        toAddress: to,
        txHash: tx.hash,
        status: "pendente",
      },
    });

    // Confirma transação
    const receipt = await provider.waitForTransaction(tx.hash, 1);

    await prisma.txMint.update({
      where: { id: txRecord.id },
      data: {
        status: receipt.status === 1 ? "confirmada" : "falha",
        confirmedAt: new Date(),
      },
    });

    res.json({
      txHash: tx.hash,
      message: `Transação enviada para ${to} com sucesso!`,
      status: receipt.status === 1 ? "confirmada" : "falha",
    });
  } catch (error: any) {
    console.error("Erro em mintRestricted:", error);
    res.status(500).json({ error: error.message });
  }
};



export const getTransactions = async (req: Request, res: Response) => {
  try {
    // Consulta todas as transações, incluindo usuário e projeto
    const transactions = await prisma.txMint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true }, // pega apenas o nome do usuário
        },
        projeto: {
          select: { name: true }, // pega apenas o nome do projeto
        },
      },
    });

    // Mapeia para um formato amigável
    const formatted = transactions.map(tx => ({
      id: tx.id,
      userName: tx.user.name,
      projetoName: tx.projeto.name,
      amount: tx.amount,
      toAddress: tx.toAddress,
      txHash: tx.txHash,
      status: tx.status,
      createdAt: tx.createdAt,
      confirmedAt: tx.confirmedAt,
    }));

    res.json({ transactions: formatted });

  } catch (error: any) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Parâmetro 'userId' é obrigatório e deve ser string." });
    }

    const transactions = await prisma.txMint.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: { select: { name: true } },
        projeto: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(transactions);

  } catch (error: any) {
    console.error("Erro em getTransactionsByUser:", error);
    res.status(500).json({ error: error.message });
  }
};