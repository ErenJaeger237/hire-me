const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserClass {
  constructor({ id, name, email, password_hash, role, createdAt }) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._passwordHash = password_hash;
    this._role = role;
    this._createdAt = createdAt;
  }

  // Encapsulated Getters
  getId() { return this._id; }
  getName() { return this._name; }
  getEmail() { return this._email; }
  getRole() { return this._role; }
  getCreatedAt() { return this._createdAt; }

  // Encapsulated Methods
  async verifyPassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this._passwordHash);
  }

  generateAuthToken() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is not set.');
    
    return jwt.sign(
      { id: this._id, email: this._email, role: this._role },
      secret,
      { expiresIn: '7d' }
    );
  }

  async login(plainPassword) {
    const isValid = await this.verifyPassword(plainPassword);
    if (!isValid) throw new Error('Invalid credentials');
    return this.generateAuthToken();
  }

  logout() {
    return true;
  }

  async updatePassword(newPassword) {
    this._passwordHash = await bcrypt.hash(newPassword, 10);
    return true;
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this._role,
      createdAt: this._createdAt,
    };
  }
}

module.exports = UserClass;
