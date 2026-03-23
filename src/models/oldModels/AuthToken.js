const AuthTokenTypes = require('../constants/AuthTokenTypes')
const AuthTokenStatuses = require('../constants/AuthTokenStatuses')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}

// define the Auth Tokens Schema
const AuthTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  type: { type: String, default: AuthTokenTypes.AuthToken },
  status: { type: String, default: AuthTokenStatuses.ACTIVE},
  clientId: { type: String, default: 'customScopes' },
  scopes: [
    { type: String }
  ]
}, options)


module.exports = AuthTokenSchema

