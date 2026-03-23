const AuthTokenTypes = require('../constants/AuthTokenTypes')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}

const AuthToken_UserDirectInstallSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workspaceMemberSlackId: { type: String },
  workspaceMemberId: { type: String }
}, options)


module.exports = AuthToken_UserDirectInstallSchema

