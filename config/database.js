if (process.env.NODE_ENV === 'production') {
  module.exports = {
    mongoURI: 'mongodb://benyang:Apr261985@ds239968.mlab.com:39968/vidjot-prod'
  };
} else {
  module.exports = {
    mongoURI: 'mongodb://localhost/vidjot-dev'
  };
}
