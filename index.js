import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

// This line imports the exported router, and names it movieRouter for this file
// Add this line to the top of index.js after importing express
import driversRouter from './drivers.js';
import carsRouter from './cars.js';

dotenv.config();

const app = express();

const PORT = 3389;

app.use(cors({
    origin: 'https://utasbot.dev',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Load SSL certificate and key
const options = {
    key: fs.readFileSync('./key.pem'),    // Your private key file
    cert: fs.readFileSync('./cert.pem')    // Your certificate file
};

//parse JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});

// This line tells Express to use the movie router for all routes beginning with "/movies"
// Add this line to the end of index.js
app.use("/driver", driversRouter);
app.use("/car", carsRouter);

