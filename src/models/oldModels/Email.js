const EmailTypes = require('../constants/EmailTypes')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

// define the Auth Tokens Schema
const EmailSchema = new mongoose.Schema({

  type: { type: String }, // EmailTypes
  templateProps: {},
  templateData: {},
  toAddresses: [
    { type: String }
  ],
  messageId: { type: String }
}, options)


module.exports = EmailSchema

