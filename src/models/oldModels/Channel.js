const mongoose = require('mongoose')
const options = {
  strict: false,
  timestamps: { createdAt: true, updatedAt: true }
}

const ChannelSchema = new mongoose.Schema({
    name: {
      type: String,
      index: true
    },
    created: { type: String },
    slackId: { type: String },
    isGroup: { type: Boolean },
    isPrivate: { type: Boolean },
    isIm: { type: Boolean },
    locked: {type: Boolean, default: false},
    workspaceId: { type: mongoose.Schema.ObjectId, ref: 'Workspace' },
    messagesCount: { type: Number, default: 0 },
    members: [{ type: mongoose.Schema.ObjectId, ref: 'WorkspaceMember', default: [] }],
    status: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusPopulateMessages: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusPopulateFiles: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusAnalysis: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusConversations: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    latestMessageTimeStamp: { type: String, default: '1' },
    filesPopulatePaging: {
      count: { type: Number, default: null },
      total: { type: Number, default: null },
      page: { type: Number, default: null },
      pages: { type: Number, default: null }
    },
    channelReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelReport' },

    encrypted: { type: Boolean, default: false }
    // transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  }, options
)

module.exports = ChannelSchema
