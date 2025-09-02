"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kyc_controller_1 = require("../controllers/kyc.controller");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Envio de foto KYC
router.post('/:userId', upload_1.upload.single('foto'), kyc_controller_1.createOrUpdateKyc);
exports.default = router;
