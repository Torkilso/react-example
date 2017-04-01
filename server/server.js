var express = require('express');

var app = express();

//This resource makes it possible to download and start the React client
app.use(express.static(__dirname + "/../client"));

var lastId = 0;

var customers = [
  {"id":++lastId,"name":"Ola","city":"Trondheim"},
  {"id":++lastId,"name":"Kari","city":"Oslo"},
  {"id":++lastId,"name":"Per","city":"Tromsø"}
];

app.get('/api/customers',function (req, res) {
  res.send(customers);
})

app.get('/api/customers/:id',function (req, res) {
  let id = req.params.id;
  for(var i = 0; i < customers.length; i++){
    if(customers[i].id == id){
      res.send(customers[i]);
      return;
    }
  }
})

app.post('/api/add',function (req, res) {

})

app.delete('/api/del',function (req, res) {

})

console.log(customers);
//Start the web server
//Open for instance http://localhost:3000 in a web browser
var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
