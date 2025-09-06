import express from "express";
import { 
  getBalance, 
  getContractMetadata, 
  getRemainingTokensInt, 
  getMaxSupply, 
  getTokenPrice, 
  getSymbol, 
  getName, 
  getAdminRole, 
  getContractAddress, 
  mintRestricted,
  getTransactions, 
  getTransactionsByUser
} from "../controllers/balanceController";

const router = express.Router();

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
router.get("/transactions", getTransactions);
router.get("/transactions/user", getTransactionsByUser);
export default router;
