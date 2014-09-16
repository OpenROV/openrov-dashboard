module.exports = {
  setup: function(app, assets) {
    app.get('/', function (req, res) {

      console.log(assets.scripts);
      res.render('index', {
        assets: assets
      });
    });
  }
};
