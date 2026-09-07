const express = require('express');

const {
    criarEquipamento,
    listarEquipamentos,
    buscarEquipamentoPorId,
    atualizarEquipamento,
    desativarEquipamento,
    reativarEquipamento,
    listarEquipamentosInativos
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
    '/inativos',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarEquipamentosInativos
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

router.delete(
    '/:id',
    autenticar,
    autorizar('ADMIN'),
    desativarEquipamento
);

router.patch(
    '/:id/reativar',
    autenticar,
    autorizar('ADMIN'),
    reativarEquipamento
);

module.exports = router;