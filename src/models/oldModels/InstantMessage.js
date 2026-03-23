const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

// Same like Message but only for InstantMessages/DirectMessages (IM/DM)

const InstantMessage = new mongoose.Schema({
    slackId: { type: String },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    text: { type: String, text: true },
    processedText: { type: String },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
      slackFiles: { type: Array },
      hasFiles: { type: Boolean, default: false },
      filesPopulated: {type: Boolean, default: false},
      attachments: { type: Array },
      userSlackId: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    analyses: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'IMMessageAnalysis' }
    ],
    reactions: [{
      name: { type: String },
      userSlackIds: [],
      count: { type: Number }
    }],
    isParentThread: { type: Boolean, default: false },
    isReply: { type: Boolean, default: false },
    threadData: {
      ts: { type: Number },
      replyMemberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' }],
      replyMemberSlackIds: [{ type: String }],
      lastReplyTS: { type: Number },
      replyCount: { type: Number },
    },
    replyData: {
      threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstantMessage' },
      parentThreadTS: { type: Number },
      parentSlackUserId: { type: String },
    },
    ts: { type: Number },
    tsDate: { type: Date, index: true },
    type: { type: String },
    subtype: { type: String },
    encrypted: { type: Boolean, default: false },
    cryptoMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'IMCryptoMessage' }

  // transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  }, options
)

module.exports = InstantMessage
