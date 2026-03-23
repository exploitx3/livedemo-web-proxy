const mongoose = require('mongoose')
const options = {
    strict: true,
    timestamps: { createdAt: true, updatedAt: true }
}

const InstantMessagesChannel = new mongoose.Schema({
    created: { type: String },
    slackId: { type: String },
    name: { type: String },
    locked: { type: Boolean, default: false },
    ownerSlackId: { type: String },
    ownerName: { type: String },
    memberName: { type: String },
    memberSlackId: { type: String },
    members: [{ type: mongoose.Schema.ObjectId, ref: 'WorkspaceMember' }],
    owner: { type: mongoose.Schema.ObjectId, ref: 'WorkspaceMember' },
    member: { type: mongoose.Schema.ObjectId, ref: 'WorkspaceMember' },
    hasFiles: {type: Boolean, default: false},
    filesPopulated: {type: Boolean, default: false},
    isIm: { type: Boolean },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    messagesCount: { type: Number, default: 0 },
    status: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusPopulateMessages: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusPopulateFiles: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusAnalysis: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    statusConversations: { type: String, default: 'empty' }, // empty, updating, populated, stopped
    latestMessageTimeStamp: { type: String, default: '1' },
    filesPopulatePaging: {
        count: {type: Number},
        total: {type: Number },
        page: {type: Number },
        pages: {type: Number }
    },
    encrypted: { type: Boolean, default: false }
  }, options
)

module.exports = InstantMessagesChannel
