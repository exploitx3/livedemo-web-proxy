const StoryStatuses = require('../constants/StoryStatuses')
const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}


const Story = new mongoose.Schema({

  name: { type: String },
  // shortId: { type: String,
  //   index: true,
  //   unique: true
  // },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  screens: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Screen'}
  ],
  filePath: {type: String, default: ''},
  status: {type: String, default: StoryStatuses.UPLOADING},

  isPublished: {type: Boolean, default: false},

  capturedEvents: [],
  tabInfo: {},
        windowMeasures: {},
  videoStartMs: { type: mongoose.Schema.Types.Number },
  videoEndMs: { type: mongoose.Schema.Types.Number },
  aspectRatio: { type: mongoose.Schema.Types.String },
        content: {
            contentStatus: {type: String, default: ''}, //updating, ready
            contentId: {type: mongoose.Schema.Types.ObjectId, ref: 'StoryContent'}
        },
  custom: {
    header: {
      isActive: {type: Boolean, default: false},
      imageUrl: {type: String, default: ''},
      personName: {type: String, default: ''},
      text: {type: String, default: ''}
    },
    theme: {
      isActive: {type: Boolean, default: false},
                stepBackgroundColor: {type: String, default: '#1070ff'}, // backgroundColor
                backgroundColor: {type: String, default: '#FFFFFF'}, // backgroundColor
                textColor: {type: String, default: '#FFFFFF'}, // textColor
                buttonBackgroundColor: {type: String, default: '#1070ff'},// buttonColor
                buttonTextColor: {type: String, default: '#FFFFFF'}, // buttonColor
                overlayBackgroundColor: {type: String, default: 'rgba(0,0,0,0)'}, // buttonColor
                watermarkConfig: {
                    imageUrl: {type: String, default: ''},
                    text: {type: String, default: ''},
                    url: {type: String, default: ''},
                    isActive: {type: Boolean, default: false},
                }
    },
    misc: {
      isActive: {type: Boolean, default: false},
      confettiOnLastStep: {type: Boolean, default: true},
                isOmniBarDisabled: {type: Boolean, default: false},
                isLiveDemoWatermarkEnabled: {type: Boolean, default: true},
                isTabsEnabled: {type: Boolean, default: true},
            },
            variables: [
                {
                    name: String,
                    value: String
    }
            ],
        },

        links: [
            {type: String, ref: 'Link'}
        ],
        deletedAt: {type: Date, default: null}
  }, options
)

module.exports = Story
