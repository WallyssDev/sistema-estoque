const express = require('express');

const {
    criarManutencao,
    listarManutencoes
} = require('../controllers/manutencoes.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarManutencoes
);

router.post(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    criarManutencao
);

module.exports = router;