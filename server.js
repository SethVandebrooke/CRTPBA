// Include dependencies
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Only serve the files in the public directory
app.use(express.static('public'));

// Changable log function
function log(msg) {
  console.log(msg);
}

// See if a variable has been defined and matches a specified type
// This is to support DRY code
var matchesType = (variable, type) =>
  variable && type === typeof variable;

// Changable authentication function
// This function can be set to any desired method for authentication,
// as long as it returns a boolean (true if successfully authenticated)
var authenticate = (username,password) =>
  username == "admin" && password == "29fgsk57";

// When a client connects
io.on('connection', function(socket){
  console.log('client connected');

  // A local variable only visible inside this scope and unique to each socket:
  let authenticated = false;

  socket.on("auth", function (creds,callback) {
    log("Attempting authentication");
    if (matchesType(creds,"object")) {
      if (matchesType(creds.username,"string")) {
        if (matchesType(creds.password,"string")) {
          // Use the authenticate function to authenticate the client
          authenticated = authenticate(creds.username,creds.password);
          log("Authenticated: "+authenticated);
          // Respond with whether or not it was successfull (true or false)
          callback(authenticated);
        }
      }
    }
  });

  socket.on('checkAuth', function (callback){
    callback(authenticated);
  });

  socket.on('command', function(command) {
    if (matchesType(command,"object")) { // Ensure 'command' is an object
      if (authenticated) { // Only let authenticated clients broadcast commands
        if (matchesType(command.name,"string")) { // check name
          if (matchesType(command.packet,"object")) { // check packet
            if (matchesType(command.type,"string")) { // check type
              switch (command.type) { // Support multiple command types
                case "global": // Send to everyone
                  socket.broadcast.emit(command.name, command.packet);
                  break;
                case "group": // Send to a specific group
                  if (matchesType(command.group,"string")) {
                    socket.to(command.group).emit(command.name, command.packet);
                  } else {
                    log("'Command.group' was not defined, or isn't a string");
                  }
                  break;
                case "individual": // Send to a specific socket
                  if (matchesType(command.id,"string")) {
                    io.to(command.id).emit(command.name, command.packet);
                  } else {
                    log("'Command.id' was not defined, or isn't a string");
                  }
                  break;
                default:
                  log(command.type + " is not a supported command type");
              }
            } else {
              log("'Command.type' must be both defined and a string.");
            }
          } else {
            log("'Command.packet' must be both defined and an object.");
          }
        } else {
          log("'Command.name' must be both defined and a string.");
        }
      } else {
        log("Client is not authorized for sending commands.");
      }
    } else {
      log("'Command' must be defined and must be an object.");
    }
  });

  // Allow a client to request their socket ID
  socket.on('getId', function (callback){
    callback(socket.id);
  });

  // When a client disconnects
  socket.on('disconnect', function(){
    console.log('client disconnected');
  });
});
var port = 8080;
http.listen(port, function(){
  console.log('listening on port ' + port);
});
