import express from 'express';

import dbconn from './dbconn.js';

const getCars = (req, res) => {
    // SQL query to retrieve all cars with optional driver info
    const query = `
        SELECT cars.id AS car_id, cars.suitability_race, cars.suitability_street, cars.reliability,
               drivers.id AS driver_id, drivers.name AS driver_name
        FROM cars
        LEFT JOIN drivers ON cars.driver_id = drivers.id
    `;

    dbconn.query(query, (err, rows) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        // Process each car row and format the response
        const formattedCars = rows.map(car => {
            // Format the driver object
            const driver = car.driver_id
                ? {
                    name: car.driver_name,
                    uri: `https://lab-d00a6b41-7f81-4587-a3ab-fa25e5f6d9cf.australiaeast.cloudapp.azure.com:7101/driver/${car.driver_id}`
                }
                : null;

            // Return the car information in the specified format
            return {
                id: car.car_id,
                driver: driver,
                suitability: {
                    race: car.suitability_race,
                    street: car.suitability_street
                },
                reliability: car.reliability
            };
        });

        // Send the response with the formatted car data
        res.json({
            code: 200,
            result: formattedCars
        });
    });
};

const getCar = (req, res) => {
    const carId = req.params.id; // Get the car ID from the URL parameter

    // SQL query to retrieve the specific car with optional driver info
    const query = `
        SELECT cars.id AS car_id, cars.suitability_race, cars.suitability_street, cars.reliability,
               drivers.id AS driver_id, drivers.name AS driver_name
        FROM cars
        LEFT JOIN drivers ON cars.driver_id = drivers.id
        WHERE cars.id = ?
    `;

    dbconn.query(query, [carId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        // If no car is found with the specified ID
        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Car not found'
            });
        }

        const car = rows[0]; // Get the single car object from the query result

        // Format the driver object if a driver is assigned
        const driver = car.driver_id
            ? {
                name: car.driver_name,
                uri: `https://lab-d00a6b41-7f81-4587-a3ab-fa25e5f6d9cf.australiaeast.cloudapp.azure.com:7101/driver/${car.driver_id}`
            }
            : null;

        // Format the response for the specific car
        const formattedCar = {
            id: car.car_id.toString(),
            driver: driver,
            suitability: {
                race: car.suitability_race,
                street: car.suitability_street
            },
            reliability: car.reliability
        };

        // Send the response with the formatted car data
        res.json({
            code: 200,
            result: formattedCar
        });
    });
};

const getCarDriver = (req, res) => {
    const carId = req.params.id; // Extract car ID from URL parameter

    // SQL query to retrieve the driver associated with the specified car
    const query = `
        SELECT drivers.id AS driver_id, drivers.name AS driver_name, drivers.number, 
               drivers.shortName, drivers.skill_street, drivers.skill_race
        FROM cars
        LEFT JOIN drivers ON cars.driver_id = drivers.id
        WHERE cars.id = ?
    `;

    dbconn.query(query, [carId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        // If no car is found with the specified ID
        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Car not found'
            });
        }

        const car = rows[0];

        // If no driver is associated with the car (driver_id is NULL)
        if (!car.driver_id) {
            return res.status(404).json({
                code: 404,
                result: 'Driver not found'
            });
        }

        // Format the driver object
        const driverInfo = {
            name: car.driver_name,
            number: car.number,
            shortName: car.shortName,
            skill: {
                street: car.skill_street,
                race: car.skill_race
            }
        };

        // Send the response with the driver data
        res.json({
            code: 200,
            result: driverInfo
        });
    });
};

const deleteCar = (req, res) => {
    const carId = req.params.id; // Get the car ID from the URL parameter

    // SQL query to delete the car with the specified ID
    const query = `DELETE FROM cars WHERE id = ?`;

    dbconn.query(query, [carId], (err, result) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        // If no rows were affected, the car ID does not exist
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Car not found'
            });
        }

        // Success response
        res.status(200).json({
            code: 200,
            result: 'Car deleted successfully'
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
    let result = "";

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

// Define a router for all the routes about Cars
const router = express.Router();
router.get('/', getCars);
// router.post('/', createCar);
router.get('/:id', getCar);
router.get('/:id/driver', getCarDriver);
// router.put('/:id', updateCar);
router.delete('/:id', deleteCar);

// Make the router available to other modules via export/import
export default router;