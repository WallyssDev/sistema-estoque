const express = require('express');


const {
    listarEquipamentos,
    listarManutencoes,
    listarQualificacoes,
    listarOperacionais
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

router.get(
    '/qualificacoes',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarQualificacoes
);



router.get(
    '/operacionais',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    listarOperacionais
);



module.exports = router;