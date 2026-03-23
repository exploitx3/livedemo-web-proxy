const mongoose = require('mongoose')
const options = {
  strict: false,
  timestamps: { createdAt: true, updatedAt: true }
}

const AppBot = new mongoose.Schema({
    // appId: { type: String },
    slackId: {type: String},
    botSlackUserId: { type: String },
    workspaceSlackId: { type: String },
    workspaceSlackName: { type: String },
    slackAccessTokens: [{
      memberSlackId: {type: String},
      token: { type: String },
      scopes: []
    }],
    workspaceId: { type: mongoose.Schema.ObjectId, ref: 'Workspace' },
  }, options
)

module.exports = AppBot
