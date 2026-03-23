module.exports = {
  'ENV': process.env.ENV || 'dev',
  'URL': process.env.APIG_URL || 'http://localhost.mine:3000',
  'SERVER_URL': process.env.SERVER_URL || 'http://localhost.mine:5000',
  'DB_URI': process.env.DB_URI || 'mongodb://localhost:27017/livedemo_app',
  'STORIES_API': process.env.STORIES_API || 'http://localhost.mine:3005',
}

