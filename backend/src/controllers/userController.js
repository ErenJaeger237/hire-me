const { User, ProviderProfile } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] },
      include: req.user.role === 'PROVIDER' ? [{ model: ProviderProfile, as: 'profile' }] : [],
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { phone_number, profile_picture_url, location_text, location_lat, location_lng, resume_url, bio } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update User fields
    if (phone_number !== undefined) user.phone_number = phone_number;
    if (profile_picture_url !== undefined) user.profile_picture_url = profile_picture_url;
    if (location_text !== undefined) user.location_text = location_text;
    if (location_lat !== undefined) user.location_lat = location_lat;
    if (location_lng !== undefined) user.location_lng = location_lng;

    await user.save();

    // Update Provider profile if applicable
    if (user.role === 'PROVIDER') {
      const profile = await ProviderProfile.findOne({ where: { user_id: user.id } });
      if (profile) {
        if (resume_url !== undefined) profile.resume_url = resume_url;
        if (bio !== undefined) profile.bio = bio;
        await profile.save();
      }
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
