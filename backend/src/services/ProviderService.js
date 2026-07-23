const { Op } = require('sequelize');
const { User, ProviderProfile } = require('../models');

class ProviderService {
  async getProviders({ category, maxPrice, lat, lng, page = 1, limit = 20 }) {
    const whereClause = {};

    if (category && category.trim() !== '') {
      whereClause[Op.or] = [
        { trade: { [Op.like]: `%${category.trim()}%` } },
        { '$user.name$': { [Op.like]: `%${category.trim()}%` } },
        { '$user.location_text$': { [Op.like]: `%${category.trim()}%` } }
      ];
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereClause.hourly_rate = { [Op.lte]: parseFloat(maxPrice) };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: providers } = await ProviderProfile.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'createdAt', 'location_lat', 'location_lng', 'location_text', 'profile_picture_url'],
        },
      ],
      limit: parseInt(limit),
      offset,
    });

    let formattedProviders = providers.map((p) => {
      let distance = null;
      if (lat && lng && p.user?.location_lat && p.user?.location_lng) {
        const R = 6371; 
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

    return {
      providers: formattedProviders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }
}

module.exports = new ProviderService();
