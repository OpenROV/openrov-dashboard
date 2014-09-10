module.exports = {
  setup: function (express, app, config) {
    app.use(express.static(__dirname + '/../static/'));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(app.router);
    app.set('port', config.port);
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'ejs', { pretty: true });
  }
};
