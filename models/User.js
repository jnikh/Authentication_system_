const pool = require('../config/db');

class User {
    static async findAll() {
        const [rows] = await pool.query('SELECT id,phone , created_at , profile_picture FROM users');
        return rows; 
      }
      
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0]; 
      }
  static async findByPhone(phone) {
    const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0];
  }
 
   
  static async create(userData) {
    const { phone, name } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (phone, name) VALUES (?, ?)',
      [phone, name]
    );
    return {
      id: result.insertId,
      phone,
      name
    };
  }


  static async updateProfilePicture(userId, imagePath) {
    await pool.query('UPDATE users SET profile_picture = ? WHERE id = ?', [imagePath, userId]);
  }
}

module.exports = User;