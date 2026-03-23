const SubscriptionTypes = require('../constants/SubscriptionTypes')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Subscription = new mongoose.Schema({
    type: { type: String }, // one of SubscriptionTypes
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    chargeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charge' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    autoPay: { type: Boolean, default: false },
    expired: { type: Boolean, default: false },
    expireDate: { type: Date },
    active: { type: Boolean, default: false },
    // exportsAllowed: { type: Number, default: 0 },
    // instantUpdatesAllowed: { type: Number, default: 0 },
    membersAllowed: { type: Number, default: 1 },
    adminsAllowed: { type: Number, default: 0 },
    attachedJobs: [
      { type: mongoose.Schema.ObjectId, ref: 'Job' }
    ],
  }, options
)

module.exports = Subscription
