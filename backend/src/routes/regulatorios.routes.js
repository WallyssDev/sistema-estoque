const express = require('express');

const {
    criarRegulatorio,
    listarRegulatorios,
    atualizarRegulatorio
} = require('../controllers/regulatorios.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarRegulatorios
);

router.post(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    criarRegulatorio
);

router.put(
    '/:id',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    atualizarRegulatorio
);

module.exports = router;