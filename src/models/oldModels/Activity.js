const mongoose = require('mongoose')
const options = {
  strict: false,
  timestamps: { createdAt: true, updatedAt: true }
}

const Activity = new mongoose.Schema({

    type: { type: String }, // presence | message
    ts: {type: Number},
    status: {type: String}, // active | away
    userSlackId: { type: String },
    workspaceId: { type: mongoose.Schema.ObjectId, ref: 'Workspace' },
  }, options
)

module.exports = Activity
