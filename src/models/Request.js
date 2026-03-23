const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const Request = new mongoose.Schema({

    fileName: { type: String }, // channel | workspace
    liveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo' },
    request: {}, // info | error | saga
    response: {
      headers: {},
      statusCode: { type: Number },
      responseBodyEncoded: { type: String },
      responseBodyEncodedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
      base64Encoded: { type: Boolean },
      bodyString: { type: String, text: true }
    }, // info | error | saga
    updatedResponse: {
      responseBodyEncodedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
      responseBodyEncoded: {type: String},
      headers: {},
    },
    modified: { type: Boolean, default: false}
  }, options
)

module.exports = Request
