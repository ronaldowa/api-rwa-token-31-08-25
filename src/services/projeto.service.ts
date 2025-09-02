import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface ProjetoInput {
  name: string;
  numContrato: string;
  valorEth: number;
  fotos?: string[];
  quantidadeToken: number;
  precoEth: number;
}

export const createProjeto = async (data: ProjetoInput) => {
  return prisma.projeto.create({
    data,
  });
};

export const getProjetos = async () => {
  return prisma.projeto.findMany();
};

export const getProjetoById = async (id: number) => {
  return prisma.projeto.findUnique({ where: { id } });
};

export const updateProjeto = async (id: number, data: Partial<ProjetoInput>) => {
  return prisma.projeto.update({
    where: { id },
    data,
  });
};

export const deleteProjeto = async (id: number) => {
  return prisma.projeto.delete({ where: { id } });
};
