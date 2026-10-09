const express = require('express');

const {
    listarEquipamentos,
    listarManutencoes
} = require('../controllers/relatorios.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/equipamentos',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarEquipamentos
);

router.get(
    '/manutencoes',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarManutencoes
);

module.exports = router;