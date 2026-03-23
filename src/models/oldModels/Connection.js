const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Connection = new mongoose.Schema({
    type: {type: String}, //member-to-channel, member-to-member
    from: {type: String},
    to: {type: String},
    innerId: {type: String}, // <memberSlackId>-<channelSlackId>
    // mentioned: {type: Number},
    mentions: {type: Number},
    messages: {type: Number},
    messageIds:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    interactions: {type: Number},
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
    graphId: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph' }



  }, options
)

module.exports = Connection

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