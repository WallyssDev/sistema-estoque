const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Sistema de Estoque funcionando com JavaScript!');
});

module.exports = app;