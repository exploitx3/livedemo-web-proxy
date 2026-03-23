const mongoose = require('mongoose')
const options = {
  strict: false,
  timestamps: { createdAt: true, updatedAt: true }
}

const GroupActivity = new mongoose.Schema({

    startTimestamp: { type: Number },
    endTimestamp: { type: Number },
    duration: { type: Number },


    publicMessages: [{ type: mongoose.Schema.ObjectId, ref: 'Message'  }],
    imMessages: [{ type: mongoose.Schema.ObjectId, ref: 'InstantMessage' }],
    conversationIds: [{ type: mongoose.Schema.ObjectId, ref: 'Conversation' }],
    activities: [{ type: mongoose.Schema.ObjectId, ref: 'Activity' }],
    userSlackId: { type: String },
    workspaceId: { type: mongoose.Schema.ObjectId, ref: 'Workspace' },
  }, options
)

module.exports = GroupActivity
