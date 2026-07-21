const authService = require('../services/AuthService');
const { registerSchema, loginSchema } = require('../validators/authValidator');

class AuthController {
  async register(req, res) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      
      return res.status(201).json({
        message: 'User registered successfully.',
        ...result
      });
    } catch (error) {
      console.error('Registration Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(error.statusCode || 500).json({ error: error.message || 'Failed to register user.' });
    }
  }

  async login(req, res) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      return res.status(200).json({
        message: 'Login successful.',
        ...result
      });
    } catch (error) {
      console.error('Login Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(error.statusCode || 500).json({ error: error.message || 'Authentication failed.' });
    }
  }
}

module.exports = new AuthController();
