import express from 'express';

import dbconn from './dbconn.js';

const getDrivers = (req, res) => 
{
    dbconn.query('SELECT * FROM drivers', (err, rows) => 
    {
        // Forward on any server-side MySQL errors verbatim 
        // Useful for debugging MySQL syntax errors
        // But bad for security
        if (err) 
        {
            res.status(500).send(err);
            return;
        }
        
        // Return the rows as a JSON object
        res.json(rows);
    });
}

// Define a router for all the routes about Drivers
const router = express.Router();
router.get('/', getDrivers);
// router.get('/:id', getDriver);
// router.post('/', createDriver);
// router.put('/:id', updateDriver);
// router.delete('/:id', deleteDriver);

// Make the router available to other modules via export/import
export default router;