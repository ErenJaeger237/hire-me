const { Op } = require('sequelize');
const { User, ProviderProfile, Booking } = require('../models');

class ProviderService {
  async getProviders({ category, maxPrice, verifiedOnly, lat, lng, page = 1, limit = 20 }) {
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

    if (verifiedOnly === 'true' || verifiedOnly === true) {
      whereClause.is_verified = true;
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
        is_verified: p.is_verified,
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
  async getProviderById(providerId) {
    const provider = await ProviderProfile.findByPk(providerId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'createdAt', 'location_text', 'profile_picture_url'],
        }
      ]
    });

    if (!provider) {
      const error = new Error('Provider not found');
      error.statusCode = 404;
      throw error;
    }

    // Fetch reviews from bookings
    const bookings = await Booking.findAll({
      where: {
        provider_id: providerId,
        status: 'COMPLETED',
        rating: { [Op.not]: null }
      },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'profile_picture_url']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 10
    });

    const reviews = bookings.map(b => ({
      id: b.id,
      clientName: b.client ? b.client.name : 'Client',
      clientAvatar: b.client ? b.client.profile_picture_url : null,
      rating: b.rating,
      comment: b.review_comment,
      date: b.updatedAt
    }));

    return {
      id: provider.id,
      userId: provider.user_id,
      name: provider.user ? provider.user.name : 'Unknown',
      email: provider.user ? provider.user.email : '',
      profilePicture: provider.user ? provider.user.profile_picture_url : null,
      locationText: provider.user ? provider.user.location_text : null,
      trade: provider.trade,
      hourlyRate: parseFloat(provider.hourly_rate),
      bio: provider.bio,
      rating: parseFloat(provider.rating || 5.0),
      isVerified: provider.is_verified,
      joinedAt: provider.user ? provider.user.createdAt : null,
      reviews
    };
  }
}

module.exports = new ProviderService();
