const mongoose = require('mongoose')

// Read-only subset of livedemo-backend's AiDemoAgent (same collection), for share-card tags.
const AiDemoAgent = new mongoose.Schema({
  name: { type: String },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  isPublished: { type: Boolean, default: false },
  avatarUrl: { type: String, default: '' },
  defaultDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', default: null },
  deletedAt: { type: Date, default: null },
}, {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
})

module.exports = AiDemoAgent
