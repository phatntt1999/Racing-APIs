import express from 'express';
// This line imports the exported router, and names it movieRouter for this file
// Add this line to the top of index.js after importing express
import driversRouter from './drivers.js';

const app = express();
const PORT = 3389;

//enable CORS (this lets us make requests from any origin, including localhost)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT, POST,DELETE');
    next();
});

//parse JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//finally, serve it on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// This line tells Express to use the movie router for all routes beginning with "/movies"
// Add this line to the end of index.js
app.use("/driver", driversRouter);
