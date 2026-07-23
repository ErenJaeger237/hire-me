const providerService = require('../services/ProviderService');
const { getProvidersSchema } = require('../validators/providerValidator');

class ProviderController {
  async getProviders(req, res) {
    try {
      const validatedQuery = getProvidersSchema.parse(req.query);
      const result = await providerService.getProviders({
        ...validatedQuery,
        verifiedOnly: req.query.verifiedOnly,
        lat: req.user?.location_lat,
        lng: req.user?.location_lng
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error('Fetch Providers Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: 'Failed to fetch service providers.' });
    }
  }

  async getProviderById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid provider ID' });
      
      const result = await providerService.getProviderById(id);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Fetch Provider By ID Error:', error);
      if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
      return res.status(500).json({ error: 'Failed to fetch provider details.' });
    }
  }
}

module.exports = new ProviderController();
