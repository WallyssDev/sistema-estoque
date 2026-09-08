const express = require('express');

const {
    consultarAuditoria
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

module.exports = router;