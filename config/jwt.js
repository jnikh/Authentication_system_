require('dotenv').config();

module.exports={
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: '30m',
  refreshTokenExpiry: '7d'
}