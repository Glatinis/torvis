const tracker = require("./torrent-comm/tracker.js");
const torrentParser = require("./torrent-comm/parser.js");

const torrent = torrentParser.open("example.torrent");

tracker.getInfo(torrent, info => {
    console.log("information: ", info);
});