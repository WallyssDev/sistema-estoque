const { obterDashboard } = require('../services/dashboard.service');

const obter = async (req, res) => {
  try {
    const dashboard = await obterDashboard();

    return res.status(200).json(dashboard);
  } catch (erro) {
    console.error('Erro ao obter dashboard:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao carregar os dados do dashboard.'
    });
  }
};

module.exports = {
  obter
};