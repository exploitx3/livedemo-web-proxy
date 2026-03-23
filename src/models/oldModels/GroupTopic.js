const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const GroupTopic = new mongoose.Schema({

    conversationIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
    channelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },

    analysis: {
      avg: {
        Anger: { type: Number },
        Joy: { type: Number },
        Fear: { type: Number },
        Sadness: { type: Number },
        leadEmotion: {type: String},
        emotion: {type: String}
      },
      totalEmojiProb: { type: Number },
      sentiment: {
        neutrality: { type: Number },
        negativity: { type: Number },
        positivity: { type: Number },
        score: { type: Number },
        leadSentiment: {type: String}
      }
    },
    rank: { type: Number },
    count: { type: Number },
    text: { type: String },
    chunks: [{ type: String }],
    userSlackIds: [{ type: String }],
    messageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    topicIds: [{type:mongoose.Schema.Types.ObjectId, ref: 'Topic'}]

  }, options
)

module.exports = GroupTopic

/*

    {
      "rank": 0.21650635094610965,
      "count": 1,
      "text": "zip file",
      "chunks": [
        "zip file"
      ],
      "analysis": {
        "avg": {
          "Anger": 23.590002843967227,
          "Fear": 29.986915642514667,
          "Joy": 19.844220550768902,
          "Sadness": 26.57886096274919
        },
        "sentiment": {
          "neutrality": 27.863987696698572,
          "negativity": 16.6821243417309,
          "positivity": 55.45388796157054,
          "score": 70.34
        },
        "messageIds": [
          "5f68efadf2e28e64292435dc"
        ],
        "userSlackIds": [
          "UJ6U4B5SP"
        ],
        "totalEmojiProb": 0.19646693021059036
      }
    }
 */