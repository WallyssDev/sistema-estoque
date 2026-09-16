const express = require('express');

const {
    criarManutencao
} = require('../controllers/manutencoes.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.post(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    criarManutencao
);

module.exports = router;