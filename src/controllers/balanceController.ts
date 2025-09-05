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

export const mintRestricted = async (req: Request, res: Response) => {
  try {
    const { userId, projetoId, to, amount } = req.body;

    // Valida parâmetros
    if (!userId || !projetoId || !to || !amount) {
      return res.status(400).json({ error: "Parâmetros 'userId', 'projetoId', 'to' e 'amount' são obrigatórios." });
    }

    // Verifica se usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    // Verifica se projeto existe
    const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
    if (!projeto) return res.status(404).json({ error: "Projeto não encontrado." });

    // Seed phrase do .env ou default
    const mnemonic = process.env.SECRET?.trim() || "ridge jump elder copper squeeze bar valley thumb warm emerge armed cushion";
    if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
      return res.status(500).json({ error: "Seed phrase inválida." });
    }

    const signer = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
    const contractWithSigner = contract.connect(signer);

    // Converte amount para unidades do token
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    // Calcula valor correto de ETH a enviar
    const tokenPrice = await contract.TOKEN_PRICE(); // BigInt
    const valueToSend = tokenPrice * BigInt(amount);

    // Envia a transação
    const tx = await (contractWithSigner as any).mintRestricted(to, amountWei, { value: valueToSend });

    // Cria registro inicial no banco com status "pendente"
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

    // Espera a confirmação da transação (1 bloco)
    const receipt = await provider.waitForTransaction(tx.hash, 1);

    // Atualiza status para "confirmada" ou "falha"
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
