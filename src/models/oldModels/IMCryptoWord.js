const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const IMCryptoWord = new mongoose.Schema({
    cryptoMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'IMCryptoMessage' },
    text: { type: String, text: true },
    ts: { type: Number },
    tsDate: { type: Date, index: true },
    workspaceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'},
    channelId: {type: mongoose.Schema.Types.ObjectId, ref: 'InstantMessageChannel'},

  }, options
)

module.exports = IMCryptoWord
