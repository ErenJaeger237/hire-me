const userService = require('../services/UserService');
const { updateProfileSchema } = require('../validators/userValidator');

class UserController {
  async getNotifications(req, res) {
    try {
      const result = await userService.getNotifications(req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async getProfile(req, res) {
    try {
      const result = await userService.getProfile(req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const result = await userService.updateProfile(req.user.id, validatedData);
      res.json(result);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update profile' });
    }
  }

  async upgradeToProvider(req, res) {
    try {
      const { trade, hourlyRate } = req.body;
      const result = await userService.upgradeToProvider(req.user.id, trade, hourlyRate);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ error: error.message || 'Failed to upgrade to professional' });
    }
  }
}

module.exports = new UserController();
