const bcrypt = require('bcryptjs');
const { User, ProviderProfile } = require('../models');
const UserClass = require('../classes/UserClass');

async function register(req, res) {
  try {
    const { name, email, password, role, trade, hourlyRate, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields: name, email, password, role.' });
    }

    if (!['CLIENT', 'PROVIDER'].includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Role must be either CLIENT or PROVIDER.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email address is already registered.' });
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

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: userInstance.toJSON(),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const userRecord = await User.findOne({ where: { email } });
    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userInstance = new UserClass(userRecord.toJSON());
    const isMatch = await userInstance.verifyPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let profile = null;
    if (userRecord.role === 'PROVIDER') {
      profile = await ProviderProfile.findOne({ where: { user_id: userRecord.id } });
    }

    const token = userInstance.generateAuthToken();

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        ...userInstance.toJSON(),
        profile: profile ? profile.toJSON() : null,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
}

module.exports = { register, login };
