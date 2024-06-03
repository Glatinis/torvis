import fs from "fs";
import bencode from "bencode";


const txtDecoder = new TextDecoder();
const rawTorrent = fs.readFileSync("example.torrent");
const torrent = bencode.decode(rawTorrent);
const announceUrl = txtDecoder.decode(torrent.announce);
