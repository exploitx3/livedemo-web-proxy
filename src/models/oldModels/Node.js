const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Node = new mongoose.Schema({
    type: { type: String },
    mentions: { type: Number, default: 0 },
    mentioned: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    publicMessages: { type: Number, default: 0 },
    privateMessages: { type: Number, default: 0 },
    uniqueMemberConnections: {type: Number, default: 0},
    image: { type: String },//'https://telltrail-app-prod.s3.us-east-1.amazonaws.com/channel.png',
    name: { type: String },
    analysis: {
      avg: {
        Anger: { type: Number },
        Joy: { type: Number },
        Fear: { type: Number },
        Sadness: { type: Number },
        leadEmotion: { type: String },
        emotion: { type: String }
      },
      totalEmojiProb: { type: Number },
      sentiment: {
        neutrality: { type: Number },
        negativity: { type: Number },
        positivity: { type: Number },
        score: { type: Number },
        leadSentiment: { type: String }
      }
    },
    calculations: {
      bridgeScore: {Number, default: 0},
      influenceScore: {Number, default: 0},
      insiderScore: {Number, default: 0},
    },
    slackId: { type: String },
    graphId: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph' }


  }, options
)

module.exports = Node

/*
db.messages.aggregate([
    {$match: {
        workspaceId: ObjectId('5f769c62881a65ad57d31e14'),
        subtype: {$eq: undefined}
    }},
       {
            $group: {
                _id: {
                    userSlackId: "$userSlackId",
                    channelId: "$channelId"

                },
                docs: { $addToSet: '$$ROOT' },
                userSlackId: {$addToSet: "$userSlackId"},
                channelId: {$addToSet: "$channelId"},
                // mentions: {$push: '$channelMentions'}
            }

        },
      {
            $lookup:
            {
             from: "cryptomessages",
             localField: "cryptoMessageId",
             foreignField: "_id",
             as: "cryptoMessageId"
            }
        }
        ])




        db.messages.aggregate([
    {$match: {
        workspaceId: ObjectId('5f769c62881a65ad57d31e14'),
        subtype: {$ne: 'channel_join'},
        // memberMentions: {$ne: []}
    }},
       {
            $group: {
                _id: {
                    // userSlackId: "$userSlackId",
                    channelId: "$channelId",

                },
                docs: { $addToSet: '$$ROOT' },
                userSlackId: {$addToSet: "$userSlackId"},
                channelId: {$addToSet: "$channelId"},
                // mentions: {$sum: {$size: '$memberMentions'}}
            }

        },
      {
            $lookup:
            {
             from: "cryptomessages",
             localField: "cryptoMessageId",
             foreignField: "_id",
             as: "cryptoMessageId"
            }
        }
        ])
 */