const AuthTokenTypes = require('../constants/AuthTokenTypes')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}

// define the Auth Tokens Schema
const AuthToken_UserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, options)


module.exports = AuthToken_UserSchema

