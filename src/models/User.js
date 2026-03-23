const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const options = {
  discriminatorKey: 'userType',
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}


const GoogleProfile = new mongoose.Schema({
  // tokenData: {},
  email: { type: String, default: '' },
  familyName: { type: String, default: '' },
  givenName: { type: String, default: '' },
  id: { type: String, default: '' },
  locale: { type: String, default: '' },
  name: { type: String, default: '' },
  picture: { type: String, default: '' },
  verifiedEmail: { type: Boolean, default: false },
  tokenData: {
    accessToken: { type: String, default: '' },
    expiryDate: { type: Number, default: 0 },
    idToken: { type: String, default: '' },
    scope: { type: String, default: '' },
    tokenType: { type: String, default: '' },
  },
})

// define the User model schema
const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      index: true
    },
    password: String,
    name: { type: String, default: '' },
  // workspaceMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMember' }],
    stripeCustomerId: { type: String },
    defaultCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    deleted: {type: Boolean, default: false},
    timezone: {type: String, default: ''},
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
    subscriptions: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }
    ],
    googleProfile: { type: GoogleProfile },
    featureFlags: {
      freeActivate: { type: Boolean, default: true},
    },
    // transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  }, options
)


/**
 * Compare the passed password with the value in the database. A model method.
 *
 * @param {string} password
 * @returns {object} callback
 */
UserSchema.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback)
}


/**
 * The pre-save hook method.
 */
UserSchema.pre('save', function saveHook(next) {
  const user = this

  // proceed further only if the password is modified or the user is new
  if (!user.isModified('password')) return next()


  return bcrypt.genSalt((saltError, salt) => {
    if (saltError) {
      return next(saltError)
    }

    return bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) {
        return next(hashError)
      }

      // replace a password string with hash value
      user.password = hash

      return next()
    })
  })
})


module.exports = UserSchema
