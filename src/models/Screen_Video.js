const mongoose = require('mongoose')

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}


const ScreenVideo = new mongoose.Schema({
    asset: {},
    playbackRate: { type: mongoose.Number, default: 1},
}, options
)

module.exports = ScreenVideo
