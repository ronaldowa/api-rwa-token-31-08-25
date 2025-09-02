import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createOrUpdateKyc = async (userId: number, data: {
  cpf: string;
  dataNascimento: Date;
  endereco: string;
  foto?: string;
  status?: string;
}) => {
  const existingKyc = await prisma.kYC.findUnique({ where: { userId } });

  if (existingKyc) {
    // Atualiza KYC existente
    return prisma.kYC.update({
      where: { userId },
      data: {
        ...data,
      },
    });
  } else {
    // Cria novo KYC
    return prisma.kYC.create({
      data: {
        userId,
        ...data,
        status: data.status || 'inativo',
      },
    });
  }
};

// Nova função: atualização parcial (patch)
export const updateKyc = async (
  userId: number,
  data: Partial<{
    cpf: string;
    dataNascimento: Date;
    endereco: string;
    foto?: string;
    status?: string;
  }>
) => {
  const existingKyc = await prisma.kYC.findUnique({ where: { userId } });
  if (!existingKyc) throw new Error('KYC não encontrado');

  return prisma.kYC.update({
    where: { userId },
    data: {
      ...data,
    },
  });
};

// Novas funções: findId (busca por userId) e finds (lista todos)
export const findId = async (userId: number) => {
  return prisma.kYC.findUnique({ where: { userId } });
};

export const finds = async () => {
  return prisma.kYC.findMany();
};
