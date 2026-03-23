const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const Content = new mongoose.Schema({

    liveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo' },
    text: { type: String, text: true }
  }, options
)

module.exports = Content
