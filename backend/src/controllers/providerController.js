const { Op } = require('sequelize');
const { User, ProviderProfile } = require('../models');

async function getProviders(req, res) {
  try {
    const { category, maxPrice } = req.query;

    const whereClause = {};

    if (category && category.trim() !== '') {
      whereClause.trade = { [Op.like]: `%${category.trim()}%` };
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereClause.hourly_rate = { [Op.lte]: parseFloat(maxPrice) };
    }

    const providers = await ProviderProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'createdAt'],
        },
      ],
    });

    const formattedProviders = providers.map((p) => ({
      id: p.id,
      userId: p.user_id,
      name: p.user ? p.user.name : 'Unknown Professional',
      email: p.user ? p.user.email : '',
      trade: p.trade,
      hourlyRate: parseFloat(p.hourly_rate),
      bio: p.bio,
      rating: parseFloat(p.rating || 5.0),
    }));

    return res.status(200).json(formattedProviders);
  } catch (error) {
    console.error('Fetch Providers Error:', error);
    return res.status(500).json({ error: 'Failed to fetch service providers.' });
  }
}

module.exports = { getProviders };
