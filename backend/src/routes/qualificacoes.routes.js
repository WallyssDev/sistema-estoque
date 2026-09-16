const express = require('express');

const {
    criarQualificacao,
    listarQualificacoes,
    atualizarQualificacao
} = require('../controllers/qualificacoes.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarQualificacoes
);

router.post(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    criarQualificacao
);

router.put(
    '/:id',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    atualizarQualificacao
);

module.exports = router;