# CRTPBA
Controlled Real Time Packet Broadcasting with Authentication

CRTPBA (for lack of a better name), is a small but fast and flexible system for broadcasting commands from one 'control node' to many client/user nodes.

## Commands
What is a command?
A command is an object sent through the web socket that tells the server what kind of broadcast you want to make and the information you want passed along.
NOTE: A command always has a name, type and packet.

### Sending Commands
```js
socket.emit(
  'command',
  {
  name: "test",
  type:"global",
  // group: "game room" // only give a group name if your type is set to group, otherwise it will be disregarded
  packet: { data: "anything you want goes in here" }
  }
);
```

### Command Types
There are 3 command types: global, group and individual.
- Global sends the packet to all connected nodes.
- Group sends the packet to all nodes within the specified group.
- Individual sends the packet to a specific node

