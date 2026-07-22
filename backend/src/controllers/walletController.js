const walletService = require('../services/WalletService');

class WalletController {
  async getBalance(req, res) {
    try {
      const data = await walletService.getBalance(req.user.id);
      res.json(data);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async topUp(req, res) {
    try {
      const { amount, provider } = req.body;
      const data = await walletService.topUp(req.user.id, amount, provider);
      res.json(data);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  async getHistory(req, res) {
    try {
      const data = await walletService.getHistory(req.user.id);
      res.json({ transactions: data });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
}

module.exports = new WalletController();
