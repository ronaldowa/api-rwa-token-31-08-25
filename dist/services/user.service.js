"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const prisma = new client_1.PrismaClient();
const createUser = async (data) => {
    const hashedPassword = await (0, hash_1.hashPassword)(data.password);
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
exports.createUser = createUser;
const getUsers = async () => {
    return prisma.user.findMany({ include: { kyc: true } });
};
exports.getUsers = getUsers;
