const express = require('express');

const {
    listarUsuarios,
    criarUsuario,
    buscarUsuarioPorId,
    atualizarUsuario,
    desativarUsuario,
    reativarUsuario
} = require('../controllers/usuarios.controller');

const { autenticar } = require('../middlewares/auth.middleware');
const { autorizar } = require('../middlewares/permissao.middleware');

const router = express.Router();

router.get(
    '/',
    autenticar,
    autorizar('ADMIN'),
    listarUsuarios
);

router.post(
    '/',
    autenticar,
    autorizar('ADMIN'),
    criarUsuario
);

router.get(
    '/:id',
    autenticar,
    autorizar('ADMIN'),
    buscarUsuarioPorId
);

router.put(
    '/:id',
    autenticar,
    autorizar('ADMIN'),
    atualizarUsuario
);

router.patch(
    '/:id/desativar',
    autenticar,
    autorizar('ADMIN'),
    desativarUsuario
);

router.patch(
    '/:id/reativar',
    autenticar,
    autorizar('ADMIN'),
    reativarUsuario
);

module.exports = router;