const { User, ProviderProfile } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const hashedPwd = await bcrypt.hash('password123', 10);
    
    // Create Demo Client
    await User.findOrCreate({
      where: { email: 'client@example.com' },
      defaults: {
        name: 'Demo Client',
        password_hash: hashedPwd,
        role: 'CLIENT'
      }
    });

    // Create Demo Provider
    const [marcus] = await User.findOrCreate({
      where: { email: 'marcus@example.com' },
      defaults: {
        name: 'Marcus Thorne',
        password_hash: hashedPwd,
        role: 'PROVIDER'
      }
    });

    await ProviderProfile.findOrCreate({
      where: { user_id: marcus.id },
      defaults: {
        trade: 'Marketing',
        hourly_rate: 40,
        bio: 'Growth hacker and SEO strategist helping startups achieve 10x organic traffic growth.'
      }
    });

    console.log('Demo users seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
