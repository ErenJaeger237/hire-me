const { User, ProviderProfile, SavedProvider } = require('../models');

/**
 * @desc  Get all saved providers for the logged-in client
 */
const getSaved = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: ProviderProfile, as: 'savedProviders' }]
    });
    res.json({ saved: user.savedProviders || [] });
  } catch (err) {
    console.error('getSaved error:', err);
    res.status(500).json({ error: 'Failed to fetch saved providers.' });
  }
};

/**
 * @desc  Save a provider (bookmark)
 */
const saveProvider = async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await ProviderProfile.findByPk(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });

    const [record, created] = await SavedProvider.findOrCreate({
      where: { client_id: req.user.id, provider_id: providerId }
    });

    if (!created) return res.status(409).json({ message: 'Provider already saved.' });
    res.status(201).json({ message: 'Provider saved successfully.' });
  } catch (err) {
    console.error('saveProvider error:', err);
    res.status(500).json({ error: 'Failed to save provider.' });
  }
};

/**
 * @desc  Unsave a provider (remove bookmark)
 */
const unsaveProvider = async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const deleted = await SavedProvider.destroy({
      where: { client_id: req.user.id, provider_id: providerId }
    });
    if (!deleted) return res.status(404).json({ error: 'Saved provider not found.' });
    res.json({ message: 'Provider removed from saved list.' });
  } catch (err) {
    console.error('unsaveProvider error:', err);
    res.status(500).json({ error: 'Failed to unsave provider.' });
  }
};

module.exports = { getSaved, saveProvider, unsaveProvider };
