const express = require('express');

const {
    criarOperacional,
    listarOperacionais,
    atualizarOperacional
} = require('../controllers/operacionais.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarOperacionais
);

router.post(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    criarOperacional
);

router.put(
    '/:id',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    atualizarOperacional
);

module.exports = router;