const { Op } = require('sequelize');
const { User, ProviderProfile } = require('../models');

async function getProviders(req, res) {
  try {
    const { category, maxPrice, lat, lng } = req.query;

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
          attributes: ['id', 'name', 'email', 'createdAt', 'location_lat', 'location_lng', 'location_text', 'profile_picture_url'],
        },
      ],
    });

    let formattedProviders = providers.map((p) => {
      let distance = null;
      if (lat && lng && p.user?.location_lat && p.user?.location_lng) {
        // Haversine formula
        const R = 6371; // Earth radius in km
        const dLat = (p.user.location_lat - parseFloat(lat)) * Math.PI / 180;
        const dLon = (p.user.location_lng - parseFloat(lng)) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(parseFloat(lat) * Math.PI / 180) * Math.cos(p.user.location_lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        distance = R * c;
      }

      return {
        id: p.id,
        userId: p.user_id,
        name: p.user ? p.user.name : 'Unknown Professional',
        email: p.user ? p.user.email : '',
        profilePicture: p.user ? p.user.profile_picture_url : null,
        locationText: p.user ? p.user.location_text : null,
        trade: p.trade,
        hourlyRate: parseFloat(p.hourly_rate),
        bio: p.bio,
        rating: parseFloat(p.rating || 5.0),
        distance,
      };
    });

    if (lat && lng) {
      formattedProviders.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return res.status(200).json(formattedProviders);
  } catch (error) {
    console.error('Fetch Providers Error:', error);
    return res.status(500).json({ error: 'Failed to fetch service providers.' });
  }
}

module.exports = { getProviders };
