const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Mention = new mongoose.Schema({
    type: { type: String }, // member, channel
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    fromSlackId: { type: String },
    toSlackId: { type: String },
    messageSlackId: { type: String },
    ts: { type: Number },
    tsDate: { type: Date, index: true },

  }, options
)

module.exports = Mention
