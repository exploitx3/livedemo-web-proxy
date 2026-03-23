const mongoose = require('mongoose')
const short = require('short-uuid')

const options = {
    strict: true,
    timestamps: {createdAt: true, updatedAt: true},
}


const Link = new mongoose.Schema({
        _id: {
            type: String,
            default: () => short.generate()
        },
        name: {type: String},
        workspaceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'},
        storyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Story'},

        variables: [
            {
                name: String,
                value: String
            }
        ],
    }, options
)

module.exports = Link
