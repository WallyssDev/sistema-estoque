const express = require('express');

const {
    listarUsuarios,
    criarUsuario
} = require('../controllers/usuarios.controller');

const router = express.Router();

router.get('/', listarUsuarios);

router.post('/', criarUsuario);

module.exports = router;