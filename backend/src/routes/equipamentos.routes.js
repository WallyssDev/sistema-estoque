const express = require('express');

const {
    criarEquipamento,
    listarEquipamentos,
    buscarEquipamentoPorId,
    atualizarEquipamento
} = require('../controllers/equipamentos.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarEquipamentos
);

router.get(
    '/:id',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    buscarEquipamentoPorId
);

router.post(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    criarEquipamento
);

router.put(
    '/:id',
    autenticar,
    autorizar('ADMIN', 'EDITOR'),
    atualizarEquipamento
);

module.exports = router;