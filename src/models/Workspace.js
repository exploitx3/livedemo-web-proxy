const WorkspaceTypes = require('../constants/WorkspaceTypes')
const mongoose = require('mongoose')
require('mongoose-long')(mongoose)

const options = {
  strict: false,
  timestamps: { createdAt: true, updatedAt: true },
  typeKey: '$type'
}

const WorkspaceSchema = new mongoose.Schema({
    name: { $type: String, default: '' },
    type: { $type: String, default: WorkspaceTypes.EMPTY }, // startup | pro | business
    adminUser: { $type: mongoose.Schema.ObjectId, ref: 'User'},
    users: [
      { $type: mongoose.Schema.ObjectId, ref: 'User' }
    ],
    subscriptions: [
      { $type: mongoose.Schema.ObjectId, ref: 'Subscription' }
    ],
    liveDemos: [{
      $type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo', default: []
    }],
    invitedEmails: [
      {$type: String, default: []}
    ],
    library: {
      pages: [
        { $type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
      ],
      screenshots: [
        { $type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
      ],
      videos: [
        { $type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
      ]
    }
  }, options
)

module.exports = WorkspaceSchema
