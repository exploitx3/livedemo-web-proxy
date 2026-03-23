const WorkspaceMemberRoles = require('../constants/WorkspaceMemberRoles')
const mongoose = require('mongoose')
const options = {
  timestamps: { createdAt: true, updatedAt: true },
  strict: false
}

const ProfileSchema = new mongoose.Schema({
  phone: {
    type: String
  },
  skype: {
    type: String
  },
  realName: {
    type: String
  },
  displayName: {
    type: String
  },
  imageOriginal: {
    type: String,
    default: ''
  },
  image72: {
    type: String
  },
  image192: {
    type: String
  }
})

const WorkspaceMember = new mongoose.Schema({
    slackId: {
      type: String,
    },
    role: { type: String, default: WorkspaceMemberRoles.MEMBER }, // member, admin, owner
    slackIsPrimaryOwner: { type: Boolean },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    teamId: { type: String },
    email: {
      type: String,
      index: true
    },
    name: {
      type: String,
      index: true,
    },
    channelsIn: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'Channel', default: []
    }],
    IMChannelsIn: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'InstantMessagesChannel', default: []
    }],
    profile: { ProfileSchema },
    isBot: { type: Boolean },
    slackAccessTokens: [{
      token: { type: String },
      scopes: []
    }],
    deleted: { type: Boolean, default: false },
    featureFlags: {
      freeActivate: { type: Boolean, default: true},
      channelExports: { type: Boolean, default: false },
      workspaceExports: { type: Boolean, default: false },
      instantUpdates: { type: Boolean, default: false }
    },
    timezone: { type: String, default: '' },
    workingHours: {
      default: {},
      monday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      },
      tuesday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      },
      wednesday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      },
      thursday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      },
      friday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      },
      saturday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      },
      sunday: {
        hours: [
          {
            from: Number, // 0 - 1440 minutes
            to: Number // 0 - 1440 minutes
          }
        ]
      }
    },
    anonymousInfo: {
      name: { type: String },
      avatarNumber: { type: Number }
    }

  }, options
)

module.exports = WorkspaceMember
