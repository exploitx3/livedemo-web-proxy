const mongoose = require('mongoose')
const ScreenType = require('../constants/ScreenTypes')

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}

const ScreenTransitionSchema = require('./ScreenTransition')

const Screen = new mongoose.Schema({

    name: { type: String },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },

    type: { type: String, default: ScreenType.SCREEN_SCREENSHOT}, // Screen_Page, Screen_Screenshot, Screen_Video

    customTransitions: [
      ScreenTransitionSchema
    ],
    index: { type: Number },
    imageUrl: {type: String},
  }, options
)

module.exports = Screen
