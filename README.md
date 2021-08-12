# Fortnite 2D

Fortnite 2D is a top-down shooter that works similar to the popular
Fortnite video game. It has a variety of weapons, a loot drop
system, and a host of other fun features.

It is split up into two parts, with the client-side code located in this directory,
and the server-side code in [ServerCode](./ServerCode/). There are bash scripts
for both parts to set things up quickly. The only change you need to make,
is to set the `_serverHost` variable in [static_files/lib/controller.js](static_files/lib/controller.js)
to wherever you run the game server.

To start the server, run `ServerCode/setup.bash` on your game server.

To start the client, run `setup.bash` on your client server.