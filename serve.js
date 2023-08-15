const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");

const app = express();

app.use(
    cors({
        origin: "*",
    })
);
app.use(express.static("."));

app.get("/", (req, res) => {
    res.sendFile("static/index.html", { root: __dirname });
});

// serve the API with signed certificate on 443 (SSL/HTTPS) port
const httpsServer = https.createServer(
    {
        key: fs.readFileSync("certs/localhost/localhost.decrypted.key"),
        cert: fs.readFileSync("certs/localhost/localhost.crt"),
    },
    app
);

const httpServer = http.createServer(app);
const port = 1024;
httpServer.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
});
/*
httpsServer.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});
*/
