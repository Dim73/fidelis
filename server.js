var express = require('express')
var app = express()

app.get('/', function(req, res) {
  res.sendfile(__dirname+'/index.html');
});

app.get('/restful/fortune', function(req, res) {
  res.send('Admin Homepage');
});



app.use(express.static(__dirname + '/public'));

var server = app.listen(process.argv[2] || 3005, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
