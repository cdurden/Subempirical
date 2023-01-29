const express = require("express");
const cors = require("cors");
const https = require("https");
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
        key: fs.readFileSync("certs/cert.pem"),
        cert: fs.readFileSync("certs/cert.crt"),
    },
    app
);

const port = 1024;
httpsServer.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});
