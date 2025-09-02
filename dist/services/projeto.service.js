"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjeto = exports.updateProjeto = exports.getProjetoById = exports.getProjetos = exports.createProjeto = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createProjeto = async (data) => {
    return prisma.projeto.create({
        data,
    });
};
exports.createProjeto = createProjeto;
const getProjetos = async () => {
    return prisma.projeto.findMany();
};
exports.getProjetos = getProjetos;
const getProjetoById = async (id) => {
    return prisma.projeto.findUnique({ where: { id } });
};
exports.getProjetoById = getProjetoById;
const updateProjeto = async (id, data) => {
    return prisma.projeto.update({
        where: { id },
        data,
    });
};
exports.updateProjeto = updateProjeto;
const deleteProjeto = async (id) => {
    return prisma.projeto.delete({ where: { id } });
};
exports.deleteProjeto = deleteProjeto;
