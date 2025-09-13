import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Cria um projeto
  const projeto = await prisma.projeto.create({
    data: {
      name: 'Projeto Teste',
      numContrato: '123456',
      precoTokenBRL: 100.5,
      fotos: ['foto1.jpg', 'foto2.jpg'],
      totalTokens: 1000,
      detalhesProjeto: 'Detalhes do projeto de teste',
      inicioDaCapitacao: new Date(),
      dataRecebimento: new Date(),
    },
  });
  console.log('Projeto criado:', projeto);

  // Busca todos os projetos
  const projetos = await prisma.projeto.findMany();
  console.log('Projetos:', projetos);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
