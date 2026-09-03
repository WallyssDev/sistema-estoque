const express = require('express');
const pool = require('./database/connection');
const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const { autenticar } = require('./middlewares/auth.middleware');
const { autorizar } = require('./middlewares/permissao.middleware');

const app = express();

app.use(express.json());

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({
        sistema: 'Sistema de Controle de Estoque',
        mensagem: 'API funcionando!'
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        mensagem: 'Servidor funcionando corretamente'
    });
});

app.get('/api/database-test', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW()');

        res.status(200).json({
            status: 'OK',
            mensagem: 'Conexão com o banco de dados funcionando!',
            dataHoraBanco: resultado.rows[0]
        });
    } catch (error) {
        console.error('Erro ao conectar ao banco:', error);

        res.status(500).json({
            status: 'ERRO',
            mensagem: 'Não foi possível conectar ao banco de dados'
        });
    }
});

app.get(
    '/api/teste-protegida',
    autenticar,
    autorizar('ADMIN'),
    (req, res) => {
        res.status(200).json({
            mensagem: 'Você está autenticado e possui permissão!',
            usuario: req.usuario
        });
    }
);

module.exports = app;