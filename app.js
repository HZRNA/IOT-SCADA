
var express = require("express");
var path = require("path");
var routes = require("./routes")
var app = express();
const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server,{cors:{origin:"*"}})

const mqtt = require("mqtt");
const host = "te05c609-internet-facing-5067ce86e832a587.elb.eu-central-1.amazonaws.com";
const port = "1883";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`; 
// var mqtt = require('mqtt');
// var client = mqtt.connect({port:8083, host: 'te05c609-internet-facing-5067ce86e832a587.elb.eu-central-1.amazonaws.com'});
const connectUrl = `mqtt://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "emqx",
  password: "public",
  reconnectPeriod: 1000,
});
app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//load static assets
app.use('/static',express.static(path.join(__dirname,'public')));

client.subscribe('esp32/Input') //name topic from esp32
client.on('message', function(topic, message){
console.log(message.toString())

    io.emit("IO",message.toString())

})
io.on('connection', function(clients) {  
	//when the server receives clicked message, do this
    clients.on('Write', function(data) {
      console.log(data);
      client.publish('esp32/write', data, { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
      })
    });
});
app.use(routes);
server.listen(app.get("port"),function(){
console.log("Server started on port " + app.get("port"));
});

