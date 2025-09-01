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
