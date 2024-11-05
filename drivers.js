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
        
        const formattedDrivers = rows.map(driver => ({
            name: driver.name,
            number: driver.number,
            shortName: driver.shortName,
            skill: {
                street: driver.skill_street,
                race: driver.skill_race
            }
        }));

        // Send the response in the correct format
        res.json({
            code: 200,
            result: formattedDrivers
        });
    });
}

const getDriver = (req, res) => {
    const driver_number = req.params.id; // Extract the ID from the request parameters

    dbconn.query('SELECT * FROM drivers WHERE number = ?', [driver_number], (err, rows) => {
        if (err) {
            // Return server error if there's an issue with the database query
            res.status(500).send(err);
            return;
        }

        if (rows.length === 0) {
            // If no driver is found, return a 404 status with a result
            res.status(404).json({
                code: 404,
                result: 'Driver not found'
            });
            return;
        }

        // Format the driver data
        const driver = rows[0]; // Since we're fetching one driver, use rows[0]
        const formattedDriver = {
            name: driver.name,
            number: driver.number,
            shortName: driver.shortName,
            skill: {
                street: driver.skill_street,
                race: driver.skill_race
            }
        };

        // Send the response with the formatted driver
        res.json({
            code: 200,
            result: formattedDriver
        });
    });
};

const createDriver = (req, res) => {
    // Extract data from the request body
    const { number, shortName, name, skill } = req.body;
    const { race: skill_race, street: skill_street } = skill;

    // Validation
    const isExistParam = isExistParams(name, number, shortName, skill_race, skill_street);
    if (!isExistParam.valid) {
        return res.status(400).json({
            code: 400,
            result: isExistParam.message
        });
    }
    
    const skillValidation = validateSkills(skill_race, skill_street);
    if (!skillValidation.valid) {
        return res.status(400).json({
            code: 400,
            result: skillValidation.result
        });
    }

    // Prepare the SQL query to insert a new driver
    const query = `
        INSERT INTO drivers (number, shortName, name, skill_race, skill_street)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Insert the new driver into the database
    dbconn.query(query, [number, shortName, name, skill_race, skill_street], (err, result) => {
        if (err) {
            // Handle unique constraint or other MySQL errors
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    code: 409,
                    result: 'Driver number already exists'
                });
            }

            return res.status(500).json({
                code: 500,
                result: 'Server error'
            });
        }

        res.status(200).json({
            code: 200,
            result: 'Driver created',
        });
    });
};

const updateDriver = (req, res) => {
    console.log(req.params);
    const driver_number = req.params.id;
    const { number, shortName, name, skill } = req.body;
    const { street: skill_street, race: skill_race } = skill;

    

    // Validation
    const isExistParam = isExistParams(name, number, shortName, skill_race, skill_street);
    console.log(isExistParam.message);
    if (!isExistParam.valid) {
        return res.status(400).json({
            code: 400,
            result: isExistParam.message
        });
    }
    
    const skillValidation = validateSkills(skill_race, skill_street);
    if (!skillValidation.valid) {
        return res.status(400).json({
            code: 400,
            result: skillValidation.result
        });
    }
    
    // SQL query to update the driver details
    const query = `
        UPDATE drivers 
        SET number = ?, shortName = ?, name = ?, skill_race = ?, skill_street = ? 
        WHERE number = ?
    `;

    dbconn.query(query, [number, shortName, name, skill_race, skill_street, driver_number], (err, result) => {
        if (err) {
            // Handle unique constraint or other MySQL errors
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    code: 409,
                    result: 'Driver number already exists'
                });
            }

            // General server error
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        // If no rows were affected, the driver ID does not exist
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Driver not found'
            });
        }

        // Success response
        res.status(200).json({
            code: 200,
            result: 'Driver updated successfully'
        });
    });
};

const deleteDriver = (req, res) => {
    const driver_number = req.params.id;

    const query = `DELETE FROM drivers WHERE number = ?`;

    dbconn.query(query, [driver_number], (err, result) => {
        if (err) {
            // Handle server error
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Driver not found'
            });
        }

        res.status(200).json({
            code: 200,
            result: 'Driver deleted successfully'
        });
    });
};

// Logic check validation
const validateSkills = (skill_race, skill_street) => {
    const raceSkill = parseInt(skill_race, 10);
    const streetSkill = parseInt(skill_street, 10);

    if (isNaN(raceSkill) || isNaN(streetSkill)) {
        return { valid: false, result: 'skill_race and skill_street must be valid numbers' };
    }

    // skill_race + skill_street equals 100
    if (raceSkill + streetSkill !== 100) {
        return { valid: false, result: 'The sum of skill_race and skill_street must be 100' };
    }

    return { valid: true, raceSkill, streetSkill };
};

const isExistParams = (name, number, shortName, race, street) => {
    let isValid = true;
    let message = "";

    if (!name) {
        isValid = false;
        message = "Name is required."
    } else if (!shortName) {
        isValid = false;
        message = "Short Name is required."
    } else if (!number) {
        isValid = false;
        message = "Number is required."
    } else if (!race) {
        isValid = false;
        message = "Skill race is required."
    } else if (!street) {
        isValid = false;
        message = "Skill street is required."
    }
    
    return {
        valid: isValid,
        message: message
    }
};

const checkApiKey = (req, res, next) => {
    const apiKey = req.header('x-api-key');

    // Check if API key is present and matches the stored key
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ code: 401, result: 'Unauthorized' });
    }

    next();
};

// Define a router for all the routes about Drivers
const router = express.Router();
router.get('/', getDrivers);
router.get('/:id', getDriver);
router.post('/', checkApiKey, createDriver);
router.put('/:id', checkApiKey, updateDriver);
router.delete('/:id', checkApiKey, deleteDriver);

// Make the router available to other modules via export/import
export default router;