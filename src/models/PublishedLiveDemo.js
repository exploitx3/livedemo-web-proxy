const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const PublishedLiveDemo = new mongoose.Schema({

    url: { type: String }, // info | error | saga
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    path: { type: String },
    liveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo' }

  }, options
)

module.exports = PublishedLiveDemo
