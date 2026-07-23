const AdminService = require('../services/AdminService');

class AdminController {
  async getAnalytics(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }
      const data = await AdminService.getAnalytics();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUsers(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }
      const users = await AdminService.getAllUsers();
      res.json({ users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getProviders(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }
      const providers = await AdminService.getAllProviders();
      res.json({ providers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async verifyProvider(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }
      const { id } = req.params;
      const { is_verified } = req.body;
      const profile = await AdminService.verifyProvider(id, is_verified);
      res.json({ message: 'Provider verification updated', profile });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getDisputes(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }
      const disputes = await AdminService.getDisputes();
      res.json({ disputes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AdminController();
