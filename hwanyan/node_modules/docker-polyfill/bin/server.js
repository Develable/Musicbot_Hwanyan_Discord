#!/usr/local/bin/node

const Server = require(__dirname + "/../src/server.js");

Server.runServer(process.argv[2]);
