const bcrypt = require('bcryptjs');
const { User, ProviderProfile } = require('../models');
const UserClass = require('../classes/UserClass');

class AuthService {
  async register({ name, email, password, role, trade, hourlyRate, bio }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw Object.assign(new Error('Email address is already registered.'), { statusCode: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRecord = await User.create({
      name,
      email,
      password_hash,
      role: role.toUpperCase(),
    });

    if (role.toUpperCase() === 'PROVIDER') {
      await ProviderProfile.create({
        user_id: userRecord.id,
        trade: trade || 'General Helper',
        hourly_rate: hourlyRate || 25.0,
        bio: bio || 'Professional service provider.',
      });
    }

    const userInstance = new UserClass(userRecord.toJSON());
    const token = userInstance.generateAuthToken();
    
    return { token, user: userInstance.toJSON() };
  }

  async login({ email, password }) {
    const userRecord = await User.findOne({ where: { email } });
    if (!userRecord) {
      throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
    }

    const userInstance = new UserClass(userRecord.toJSON());
    const isMatch = await userInstance.verifyPassword(password);

    if (!isMatch) {
      throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
    }

    let profile = null;
    if (userRecord.role === 'PROVIDER') {
      profile = await ProviderProfile.findOne({ where: { user_id: userRecord.id } });
    }

    const token = userInstance.generateAuthToken();

    return {
      token,
      user: {
        ...userInstance.toJSON(),
        profile: profile ? profile.toJSON() : null,
      },
    };
  }
}

module.exports = new AuthService();
