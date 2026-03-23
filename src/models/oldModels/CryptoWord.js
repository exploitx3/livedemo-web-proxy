const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const CryptoWord = new mongoose.Schema({
    cryptoMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'CryptoMessage' },
    text: { type: String, text: true },
    ts: { type: Number },
    tsDate: { type: Date, index: true },
    workspaceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'},
    channelId: {type: mongoose.Schema.Types.ObjectId, ref: 'Channel'},

  }, options
)

module.exports = CryptoWord
