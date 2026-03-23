const mongoose = require('mongoose')
const LiveDemoStatuses = require('../constants/LiveDemoStatuses')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const LiveDemo = new mongoose.Schema({

    name: { type: String }, // channel | workspace
    url: { type: String }, // info | error | saga
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    status: { type: String, default: LiveDemoStatuses.POPULATED }, // populated, updating
    path: { type: String },
    sessionRecordingId: { type: String },
    publishedLiveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublishedLiveDemo' },
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
    firstDoc: {},
    manifest: {},
    localStorage: {},
    cookies: {},
    visible: {type: Boolean, default: true},
    scripts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Script'}],
    tours: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tour'}],
  }, options
)

module.exports = LiveDemo
