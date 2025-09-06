const express = require('express');
const router = express.Router();
const txMintController = require('../controllers/txMintController');

// Buscar todas as transações
router.get('/', txMintController.findAll);

// Buscar transações por userId
router.get('/user/:userId', txMintController.findByUserId);

module.exports = router;