const ENV_VARS = require('../envServer')
const mongoose = require('mongoose')
const uri = ENV_VARS.DB_URI
const ScreenTypes = require('../constants/ScreenTypes')
const ScreenTransitionTypes = require('../constants/ScreenTransitionTypes')

const UserSchema = require('./User')
// const AuthTokenSchema = require('./AuthToken')
// const AuthToken_UserSchema = require('./AuthToken_User')
// const AuthToken_DirectInstallSchema = require('./AuthToken_UserDirectInstall')
// const AuthToken_UserChangePassword = require('./AuthToken_UserChangePassword')
const WorkspaceSchema = require('./Workspace')
const SubscriptionSchema = require('./Subscription')
// const EmailSchema = require('./Email')
const CardSchema = require('./Card')
const ChargeSchema = require('./Charge')
const JobSchema = require('./Job')
// const EventSchema = require('./Event')
// const SagaEventSchema = require('./SagaEvent')
const TourSchema = require('./Tour')
const StepSchema = require('./Step')
const ScreenStepSchema = require('./ScreenStep')

// const ScreenNavigationSchema = require('./ScreenTransition')

const ScreenTransitionSchema = require('./ScreenTransition')
const ScreenScreenshotTransitionSchema = require('./ScreenScreenshotTransition')
const ScreenPageTransitionSchema = require('./ScreenPageTransition')

const PublishedLiveDemoSchema = require('./PublishedLiveDemo')
const LiveDemoSchema = require('./LiveDemo')
const RequestSchema = require('./Request')
const ScriptSchema = require('./Script')
// const SubscriberSchema = require('./Subscriber')
const ContentSchema = require('./Content')
const StorySchema = require('./Story')
const ScreenSchema = require('./Screen')
const Screen_PageSchema = require('./Screen_Page')
const Screen_ScreenshotSchema = require('./Screen_Screenshot')
const Screen_VideoSchema  = require('./Screen_Video')
const FormSchema = require('./Form')
const LeadSchema = require('./Lead')

const LinkSchema= require('./Link')


// const ChannelSchema = require('./Channel')
// const InstantMessagesChannelSchema = require('./InstantMessagesChannel')
// const WorkspaceMemberSchema = require('./WorkspaceMember')
// const MessageSchema = require('./Message')
// const InstantMessageSchema = require('./InstantMessage')
// const FileMessageSchema = require('./File')
// const ExportSchema = require('./Export')
// const MessageAnalysisSchema = require('./MessageAnalysis')
// const IMMessageAnalysisSchema = require('./IMMessageAnalysis')
// const WorkspaceEncryptionKeySchema = require('./WorkspaceEncryptionKey')
// const CryptoMessageSchema = require('./CryptoMessage')
// const IMCryptoMessageSchema = require('./IMCryptoMessage')
// const IMCryptoWordSchema = require('./IMCryptoWord')
// const CryptoWordSchema = require('./CryptoWord')
// const ConversationSchema = require('./Conversation')
// const TopicSchema = require('./Topic')
// const GroupTopicSchema = require('./GroupTopic')
// const UserReportSchema = require('./UserReport')
// const WorkspaceReportSchema = require('./WorkspaceReport')
// const ChannelReportSchema = require('./ChannelReport')
// const MentionSchema = require('./Mention')
// const NodeSchema = require('./Node')
// const ConnectionSchema = require('./Connection')
// const GraphSchema = require('./Graph')
// const PairSchema = require('./Pair')
// const AppBotSchema = require('./AppBot')
// const ActivitySchema = require('./Activity')
// const GroupActivitySchema = require('./GroupActivity')

const mongoosePaginate = require('mongoose-paginate')
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')

/**
 * Returns 'conn' - Mongoose Connection Instance
 *
 * @returns {Connection}
 */
module.exports.connect = () => {

  // Because `conn` is in the global scope, Lambda may retain it between
  // function calls thanks to `callbackWaitsForEmptyEventLoop`.
  // This means your Lambda function doesn't have to go through the
  // potentially expensive process of connecting to MongoDB every time.
  let conn = mongoose.createConnection(uri, {
    // Buffering means mongoose will queue up operations if it gets
    // disconnected from MongoDB and send them when it reconnects.
    // With serverless, better to fail fast if not connected.
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0, // and MongoDB driver buffering
    useFindAndModify: false
  })


  return conn

}

module.exports.setupDB = () => {
  return module.exports.connect().then(connResolved => {
    module.exports.initModels(connResolved)

    return connResolved
  })
}

/**
 * Expects conn to be an already open Mongo connection
 *
 * @param conn
 */
module.exports.initModels = (conn) => {
// this will add paginate function.
  mongoosePaginate.paginate.options = {
    limit: 10,
    lean: true
  }

  // MessageSchema.plugin(mongoosePaginate)
  // InstantMessageSchema.plugin(mongoosePaginate)
  // FileMessageSchema.plugin(mongoosePaginate)
  // UserReportSchema.plugin(mongoosePaginate)
  //
  // CryptoWordSchema.plugin(mongooseAggregatePaginate)
  // IMCryptoWordSchema.plugin(mongooseAggregatePaginate)
  //
  // ConversationSchema.plugin(mongooseAggregatePaginate)

  conn.model('Card', CardSchema)
  conn.model('User', UserSchema)

  // init a discriminator for AuthToken different types(functionalities)
  // let authTokenModel = conn.model('AuthToken', AuthTokenSchema)
  // authTokenModel.discriminator('AuthToken_User', AuthToken_UserSchema)
  // authTokenModel.discriminator('AuthToken_UserDirectInstall', AuthToken_DirectInstallSchema)
  // authTokenModel.discriminator('AuthToken_UserChangePassword', AuthToken_UserChangePassword)

  let screenModel = conn.model('Screen', ScreenSchema)
  screenModel.discriminator(ScreenTypes.SCREEN_PAGE, Screen_PageSchema)
  screenModel.discriminator(ScreenTypes.SCREEN_SCREENSHOT, Screen_ScreenshotSchema)
  screenModel.discriminator(ScreenTypes.SCREEN_VIDEO, Screen_VideoSchema)


  // conn.model('Event', EventSchema)
  // conn.model('SagaEvent', SagaEventSchema)
  // conn.model('Channel', ChannelSchema)
  // conn.model('InstantMessagesChannel', InstantMessagesChannelSchema)
  conn.model('Workspace', WorkspaceSchema)
  // conn.model('WorkspaceMember', WorkspaceMemberSchema)
  // conn.model('Message', MessageSchema)
  // conn.model('InstantMessage', InstantMessageSchema)
  // conn.model('File', FileMessageSchema)
  conn.model('Charge', ChargeSchema)
  conn.model('Subscription', SubscriptionSchema)
  conn.model('Job', JobSchema)
  // conn.model('Email', EmailSchema)

  conn.model('Script', ScriptSchema)
  conn.model('Tour', TourSchema)
  conn.model('ScreenStep', ScreenStepSchema)

  // conn.model('ScreenTransition', ScreenTransitionSchema)

  let screenTransition = conn.model('ScreenTransition', ScreenTransitionSchema)
  screenTransition.discriminator(ScreenTransitionTypes.HOTSPOT, ScreenScreenshotTransitionSchema)
  screenTransition.discriminator(ScreenTransitionTypes.ECLICK, ScreenPageTransitionSchema)


  conn.model('Form', FormSchema)
  conn.model('Lead', LeadSchema)
  conn.model('Step', StepSchema)

  conn.model('PublishedLiveDemo', PublishedLiveDemoSchema)
  conn.model('LiveDemo', LiveDemoSchema)
  conn.model('Content', ContentSchema)
  conn.model('Request', RequestSchema)

  conn.model('Story', StorySchema)
  conn.model('Screen', ScreenSchema)
  conn.model('Link', LinkSchema)

  // conn.model('Subscriber', SubscriberSchema)

  // conn.model('Export', ExportSchema)
  // conn.model('MessageAnalysis', MessageAnalysisSchema)
  // conn.model('IMMessageAnalysis', IMMessageAnalysisSchema)
  // conn.model('WorkspaceEncryptionKey', WorkspaceEncryptionKeySchema)
  // conn.model('CryptoMessage', CryptoMessageSchema)
  // conn.model('IMCryptoMessage', IMCryptoMessageSchema)
  // conn.model('CryptoWord', CryptoWordSchema)
  // conn.model('IMCryptoWord', IMCryptoWordSchema)
  // conn.model('Conversation', ConversationSchema)
  // conn.model('UserReport', UserReportSchema)
  // conn.model('WorkspaceReport', WorkspaceReportSchema)
  // conn.model('ChannelReport', ChannelReportSchema)
  // conn.model('Topic', TopicSchema)
  // conn.model('GroupTopic', GroupTopicSchema)
  // conn.model('Mention', MentionSchema)
  // conn.model('Node', NodeSchema)
  // conn.model('Connection', ConnectionSchema)
  // conn.model('Graph', GraphSchema)
  // conn.model('Pair', PairSchema)
  // conn.model('AppBot', AppBotSchema)
  // conn.model('Activity', ActivitySchema)
  // conn.model('GroupActivity', GroupActivitySchema)

}

module.exports.getModels = (conn) => {
  return {
    Card: conn.model('Card'),
    User: conn.model('User'),
    Workspace: conn.model('Workspace'),
    Charge: conn.model('Charge'),
    Subscription: conn.model('Subscription'),
    Job: conn.model('Job'),
    PublishedLiveDemo: conn.model('PublishedLiveDemo'),
    LiveDemo: conn.model('LiveDemo'),
    Request: conn.model('Request'),
    Script: conn.model('Script'),
    Tour: conn.model('Tour'),
    Step: conn.model('Step'),
    ScreenStep: conn.model('ScreenStep'),
    // ScreenNavigation: conn.model('ScreenNavigation'),
    ScreenTransition: conn.model('ScreenTransition'),
    ScreenScreenshotTransition: conn.model(ScreenTransitionTypes.HOTSPOT),
    ScreenPageTransition: conn.model(ScreenTransitionTypes.ECLICK),
    Content: conn.model('Content'),
    Story: conn.model('Story'),
    Screen: conn.model('Screen'),
    Screen_Video: conn.model(ScreenTypes.SCREEN_VIDEO),
    Screen_Screenshot: conn.model(ScreenTypes.SCREEN_SCREENSHOT),
    Screen_Page: conn.model(ScreenTypes.SCREEN_PAGE),
    Form: conn.model('Form'),
    Lead: conn.model('Lead'),
    Link: conn.model('Link'),

    // Channel: conn.model('Channel'),
    // InstantMessagesChannel: conn.model('InstantMessagesChannel'),
    // WorkspaceMember: conn.model('WorkspaceMember'),
    // Message: conn.model('Message'),
    // InstantMessage: conn.model('InstantMessage'),
    // File: conn.model('File'),
    // MessageAnalysis: conn.model('MessageAnalysis'),
    // IMMessageAnalysis: conn.model('IMMessageAnalysis'),
    // WorkspaceEncryptionKey: conn.model('WorkspaceEncryptionKey'),
    // CryptoMessage: conn.model('CryptoMessage'),
    // IMCryptoMessage: conn.model('IMCryptoMessage'),
    // CryptoWord: conn.model('CryptoWord'),
    // IMCryptoWord: conn.model('IMCryptoWord'),
    // Conversation: conn.model('Conversation'),
    // UserReport: conn.model('UserReport'),
    // WorkspaceReport: conn.model('WorkspaceReport'),
    // ChannelReport: conn.model('ChannelReport'),
    // Topic: conn.model('Topic'),
    // GroupTopic: conn.model('GroupTopic'),
    // Mention: conn.model('Mention'),
    // Node: conn.model('Node'),
    // Connection: conn.model('Connection'),
    // Graph: conn.model('Graph'),
    // Pair: conn.model('Pair'),
    // AppBot: conn.model('AppBot'),
    // Activity: conn.model('Activity'),
    // GroupActivity: conn.model('GroupActivity'),

  }
}

// Old implementation

// mongoose.connect(uri)
// // plug in the promise library:
// mongoose.Promise = global.Promise
//
//
// mongoose.connection.on('error', (err) => {
//   console.error(`Mongoose connection error: ${err}`)
//   process.exit(1)
// })

// load models
// require('./AuthToken')
// require('./transaction')
// require('./RunToken')
// require('./User')
// require('./UserSeller')
// require('./UserAdmin')
// require('./product')
// require('./Vm')
// require('./Event')
//
// require('./Run')
