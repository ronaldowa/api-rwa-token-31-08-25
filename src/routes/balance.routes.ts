// routes/balance.routes.ts
import express from "express";
import { getBalance, getContractMetadata, getRemainingTokensInt, getMaxSupply, getTokenPrice, getSymbol, getName, getAdminRole, getContractAddress, mintRestricted } from "../controllers/balanceController";

const router = express.Router();

// rota raiz do router
router.get("/", getBalance);
router.get("/metadata", getContractMetadata);
router.get("/remaining-tokens", getRemainingTokensInt);
router.get("/max-supply", getMaxSupply);
router.get("/token-price", getTokenPrice);
router.get("/symbol", getSymbol);
router.get("/name", getName);
router.get("/admin-role", getAdminRole);
router.get("/contract-address", getContractAddress);
router.post("/mint-restricted", mintRestricted);

export default router;
