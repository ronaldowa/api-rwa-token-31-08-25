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
    if (!address || typeof address !== "string")
      return res.status(400).json({ error: "Endereço não informado" });

    const balance = await contract.balanceOf(address);
    let balanceInUnits = ethers.formatUnits(balance, 18);
    if (balanceInUnits.endsWith(".0")) balanceInUnits = balanceInUnits.slice(0, -2);

    res.json({ address, balance: balanceInUnits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractMetadata = async (_req: Request, res: Response) => {
  try {
    const metadata = await contract.contractMetadata();
    res.json({ contractMetadata: metadata });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRemainingTokensInt = async (_req: Request, res: Response) => {
  try {
    const remaining = await contract.remainingTokensInt();
    res.json({ remainingTokensInt: remaining.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaxSupply = async (_req: Request, res: Response) => {
  try {
    const maxSupply = await contract.MAX_SUPPLY();
    let maxSupplyInUnits = ethers.formatUnits(maxSupply, 18);
    if (maxSupplyInUnits.endsWith(".0")) maxSupplyInUnits = maxSupplyInUnits.slice(0, -2);
    res.json({ maxSupply: maxSupplyInUnits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTokenPrice = async (_req: Request, res: Response) => {
  try {
    const tokenPrice = await contract.TOKEN_PRICE();
    let tokenPriceInUnits = ethers.formatUnits(tokenPrice, 18);
    if (tokenPriceInUnits.endsWith(".0")) tokenPriceInUnits = tokenPriceInUnits.slice(0, -2);
    res.json({ tokenPrice: tokenPriceInUnits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSymbol = async (_req: Request, res: Response) => {
  try {
    const symbol = await contract.symbol();
    res.json({ symbol });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getName = async (_req: Request, res: Response) => {
  try {
    const name = await contract.name();
    res.json({ name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminRole = async (_req: Request, res: Response) => {
  try {
    const adminRole = await contract.ADMIN_ROLE();
    res.json({ adminRole });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractAddress = async (_req: Request, res: Response) => {
  try {
    res.json({ contractAddress: CONTRACT_ADDRESS });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- Função mintRestricted --------------------

export const mintRestricted = async (req: Request, res: Response) => {
  try {
    let { userId, projetoId, amount } = req.body;
    userId = typeof userId === "string" ? parseInt(userId) : userId;
    projetoId = typeof projetoId === "string" ? parseInt(projetoId) : projetoId;
    amount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (!userId || !projetoId || !amount)
      return res.status(400).json({ error: "Parâmetros 'userId', 'projetoId' e 'amount' são obrigatórios." });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { cart: true } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
    if (!projeto) return res.status(404).json({ error: "Projeto não encontrado." });

    const kyc = await prisma.kYC.findUnique({ where: { userId } });
    if (!kyc || kyc.status !== "ativo")
      return res.status(403).json({ error: "KYC não aprovado." });

    if (!user.cart?.publicAddress)
      return res.status(400).json({ error: "Carteira não vinculada." });

    const to = user.cart.publicAddress;

    // Configura signer
    const mnemonic = process.env.SECRET?.trim() || "ridge jump elder copper squeeze bar valley thumb warm emerge armed cushion";
    let signer;
    try {
      signer = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
    } catch {
      return res.status(500).json({ error: "Seed phrase inválida." });
    }

    const contractWithSigner = contract.connect(signer);

    // Verifica KYC on-chain
    try {
      const kycTx = await (contractWithSigner as any).verifyKyc(to);
      await kycTx.wait(1);
    } catch {
      return res.status(500).json({ error: "Falha ao registrar KYC no contrato." });
    }

    // Converte amount para unidades do token
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    // Calcula valor de ETH a enviar
    const tokenPrice = await contract.TOKEN_PRICE(); // bigint
    const valueToSend = (tokenPrice * amountWei) / (10n ** BigInt(decimals));

    // Pega nonce correto
    const nonce = await provider.getTransactionCount(signer.address, "latest");

    // Mint Restricted
    const tx = await (contractWithSigner as any).mintRestricted(to, amountWei, {
      value: valueToSend,
      nonce: nonce,
    });

    const receipt = await tx.wait(1);

    // Registro de compra somente se sucesso
    if (receipt.status === 1) {
      const comprovante = tx.hash; // txHash como comprovante
      await prisma.registroCompras.create({
        data: { userId,  projetoId, valorDaCompra: amount, quantidadeToken: amount, comprovante },
      });
    }

    res.json({
      txHash: tx.hash,
      message: "Mint executado com sucesso!",
      status: receipt.status === 1 ? "confirmada" : "falha",
    });
  } catch (error: any) {
    console.error("Erro em mintRestricted:", error);
    res.status(500).json({ error: error.message });
  }
};

// -------------------- Funções de transações --------------------

export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await prisma.txMint.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, projeto: { select: { name: true } } },
    });

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
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string")
      return res.status(400).json({ error: "userId obrigatório" });

    const transactions = await prisma.txMint.findMany({
      where: { userId: parseInt(userId) },
      include: { user: { select: { name: true } }, projeto: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
