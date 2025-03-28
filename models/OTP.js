const pool = require('../config/db');

class OTP {
  static async create(phone, otp, expiresAt) {
    await pool.query(
      'INSERT INTO otps (phone, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?',
      [phone, otp, expiresAt, otp, expiresAt]
    );
  }

  static async findValidOTP(phone, otp) {
    const [rows] = await pool.query(
      'SELECT * FROM otps WHERE phone = ? AND otp = ? AND expires_at > NOW()',
      [phone, otp]
    );
    return rows[0];
  }

  static async delete(phone) {
    await pool.query('DELETE FROM otps WHERE phone = ?', [phone]);
  }
}

module.exports = OTP;