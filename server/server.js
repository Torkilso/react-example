"use strict";
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//This resource makes it possible to download and start the React client
app.use(express.static(__dirname + "/../client"));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var lastId = 0;

var customers = [
  {"id":++lastId,"name":"Ola","city":"Trondheim"},
  {"id":++lastId,"name":"Kari","city":"Oslo"},
  {"id":++lastId,"name":"Per","city":"Tromsø"}
];

function getIndex(id) {
    for (var i = 0; i < customers.length; i++) {
        if (customers[i].id == id) {
            return i;
        }
    }
    return -1;
}



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
  let name = req.body.name;
  let city = req.body.city;

  let newC = {"id":++lastId, "name":name, "city":city};

  customers.push(newC);
  res.status(200).send(newC);
})

app.delete('/api/del/:id',function (req, res) {

  let index = getIndex(req.params.id);
  if(index >= 0){
    customers.splice(index,1);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
})


app.put('/api/upd/:id',function (req, res) {
  let index = getIndex(req.params.id);
  if(index >= 0){
    customers[index].name = req.body.name;
    customers[index].city = req.body.city;
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
})

//Start the web server
//Open for instance http://localhost:3000 in a web browser
var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
