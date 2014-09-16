var morgan = require('morgan');
var bodyParser = require('body-parser');

module.exports = {
  setup: function (express, app, config) {
    app.use(express.static(__dirname + '/../static/'));
    app.use(morgan('dev'));
    app.use(bodyParser.json());

    //socket.io cross domain access
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
      next();
    });

    app.set('port', config.port);
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'ejs', { pretty: true });
  }
};
