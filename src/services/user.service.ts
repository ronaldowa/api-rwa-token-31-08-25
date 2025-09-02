import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/hash';

const prisma = new PrismaClient();

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  kyc?: {
    cpf: string;
    dataNascimento: Date | string; // aceita string ou Date
    endereco: string;
  };
}) => {
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      kyc: {
        create: {
          cpf: data.kyc?.cpf || '',
          dataNascimento: data.kyc?.dataNascimento
            ? new Date(data.kyc.dataNascimento) // converte string para Date
            : new Date(),
          endereco: data.kyc?.endereco || '',
          status: 'inativo',
        },
      },
    },
    include: { kyc: true }, // ✅ deve estar fora de `data`
  });

  return user;
};

export const getUsers = async () => {
  return prisma.user.findMany({ include: { kyc: true } });
};

// NOVA POSIÇÃO: busca usuário por id (inclui kyc)
export const getUserById = async (id: string | number) => {
  const userId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;
  const user = await prisma.user.findUnique({
    where: { id: userId as any },
    include: { kyc: true },
  });
  return user; // retorna null se não encontrado
};

export const updateUser = async (
  id: string | number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    kyc?: {
      cpf?: string;
      dataNascimento?: Date | string;
      endereco?: string;
      status?: string;
    };
  }
) => {
  // tenta converter id para number se for string numérica (ajusta conforme seu schema)
  const userId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;

  // prepara objeto de update para user
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.password !== undefined) {
    updateData.password = await hashPassword(data.password);
  }

  if (data.kyc) {
    const kycDataCreate = {
      cpf: data.kyc.cpf || '',
      dataNascimento: data.kyc.dataNascimento ? new Date(data.kyc.dataNascimento) : new Date(),
      endereco: data.kyc.endereco || '',
      status: data.kyc.status || 'inativo',
    };
    const kycDataUpdate = {
      ...(data.kyc.cpf !== undefined && { cpf: data.kyc.cpf }),
      ...(data.kyc.dataNascimento !== undefined && { dataNascimento: new Date(data.kyc.dataNascimento as any) }),
      ...(data.kyc.endereco !== undefined && { endereco: data.kyc.endereco }),
      ...(data.kyc.status !== undefined && { status: data.kyc.status }),
    };

    updateData.kyc = {
      upsert: {
        create: kycDataCreate,
        update: kycDataUpdate,
      },
    };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId as any },
      data: updateData,
      include: { kyc: true },
    });
    return updated;
  } catch (err: any) {
    // se não encontrado, prisma lança erro; normalizamos para null
    if (err.code === 'P2025') {
      return null;
    }
    throw err;
  }
};

// SUBSTITUIR: deleta usuário pelo id, agora apaga KYC relacionado via SQL raw dentro de uma transação
export const deleteUser = async (id: string | number) => {
  const userId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      // REMOVE a(s) linha(s) da tabela KYC diretamente (evita problemas de nome do delegate)
      // ajusta o nome da tabela entre aspas caso seu schema use outro nome exato
      await tx.$executeRaw`DELETE FROM "KYC" WHERE "userId" = ${userId}`;
      const userDeleted = await tx.user.delete({
        where: { id: userId as any },
        include: { kyc: true },
      });
      return userDeleted;
    });
    return deleted;
  } catch (err: any) {
    // P2025 = Record to delete does not exist.
    if (err?.code === 'P2025') {
      return null;
    }
    throw err;
  }
};

