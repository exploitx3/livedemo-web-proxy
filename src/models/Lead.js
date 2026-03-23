const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const Lead = new mongoose.Schema({

    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
    liveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo' },
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'screenId' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    data: {

    }
  }, options
)

module.exports = Lead
