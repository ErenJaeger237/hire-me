const providerService = require('../services/ProviderService');
const { getProvidersSchema } = require('../validators/providerValidator');

class ProviderController {
  async getProviders(req, res) {
    try {
      const validatedQuery = getProvidersSchema.parse(req.query);
      const result = await providerService.getProviders(validatedQuery);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Fetch Providers Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: 'Failed to fetch service providers.' });
    }
  }
}

module.exports = new ProviderController();
