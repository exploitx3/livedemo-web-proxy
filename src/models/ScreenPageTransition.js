const mongoose = require('mongoose')
const ScreenTransitionTypes = require('../constants/ScreenTransitionTypes')

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'

}


const ScreenPageTransitionSchema = new mongoose.Schema({
  selector: { type: String },
  gotoType: { type: String }, // screen | website | none
  gotoWebsite: { type: String },
  gotoScreen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
  type: { type: String }, //EClick | Hotspot

}, options)

module.exports = ScreenPageTransitionSchema
