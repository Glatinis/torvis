const express = require("express");
const fileUpload = require('express-fileupload');
const tracker = require("./torrent-comm/tracker.js");
const torrentParser = require("./torrent-comm/parser.js");

const app = express();
app.use(fileUpload());
app.use(express.static("public"));
const port = 8555;

app.post("/upload", function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.torrentfile;
    let torrent = torrentParser.decode(file.data);
    tracker.getInfo(torrent, (info) => {
        res.status(200).json(info);
    })    
});

app.listen(port, () => console.log(`Listening on port ${port}`))