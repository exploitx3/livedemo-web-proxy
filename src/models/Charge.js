const ChargeStatuses = require('../constants/ChargeStatuses')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}
const Charge = new mongoose.Schema({
    amount: { type: Number },
    status: { type: String }, // one of ChargeStatuses
    paymentIntentId: { type: String },
    paymentMethodId: { type: String },
    subscriptionType: { type: String },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    useSavedCard: { type: Boolean },
    currency: { type: String },
    autoPay: { type: Boolean, default: false }
  }, options
)

module.exports = Charge
