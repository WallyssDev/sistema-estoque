const express = require('express');

const {
    consultarAuditoria,
    consultarUsuariosAuditoria
} = require('../controllers/auditoria.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    consultarAuditoria
);

router.get(
    '/usuarios',
    autenticar,
    autorizar('ADMIN', 'EDITOR', 'LEITOR'),
    consultarUsuariosAuditoria
);

module.exports = router;