const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const IMCryptoMessage = new mongoose.Schema({
    oldId: {type: mongoose.Schema.Types.ObjectId, ref: 'InstantMessage'},
    slackId: { type: String },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    slackFiles: { type: Array },
    hasFiles: { type: Boolean, default: false },
    filesPopulated: { type: Boolean, default: false },
    userSlackId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    analyses: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'IMMessageAnalysis' }
    ],
    encryptedData: { type: String },
    IV: {type: String},
    cryptoWords: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'IMCryptoWord' }
    ],
    type: { type: String },
    subtype: { type: String },
    replyData: { type: Object, default: {} },
    threadData: { type: Object, default: {} },
    isParentThread: { type: Boolean, default: false },
    isReply: { type: Boolean, default: false },
    ts: { type: Number },
    tsDate: { type: Date, index: true }
  }, options
)

module.exports = IMCryptoMessage
