"use strict";

const express = require("express");
const app = express();

const FILE = "./data.json";

const fs = require("fs").promises;

/**
 * Gets the data stored in json
 */
app.get('/get', async function(req, res) {
  try {
    let data = await fs.readFile(FILE, 'utf8');
    data = JSON.parse(data);
    res.json(data);
  } catch (err) {
    res.status(500).type('text');
    if (err.code === 'ENOENT') {
      res.send("File does not exist");
    } else {
      res.send("Something went wrong on the server");
    }
  }
});

// serve the main page under public
app.use(express.static('public'));

const PORT = 8000;
app.listen(PORT);