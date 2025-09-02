"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateKyc = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createOrUpdateKyc = async (userId, data) => {
    const existingKyc = await prisma.kYC.findUnique({ where: { userId } });
    if (existingKyc) {
        // Atualiza KYC existente
        return prisma.kYC.update({
            where: { userId },
            data: {
                ...data,
            },
        });
    }
    else {
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
exports.createOrUpdateKyc = createOrUpdateKyc;
