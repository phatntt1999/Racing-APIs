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
               drivers.id AS driver_id, drivers.name AS driver_name, drivers.number AS driver_number
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
                uri: `https://lab-d00a6b41-7f81-4587-a3ab-fa25e5f6d9cf.australiaeast.cloudapp.azure.com:7101/driver/${car.driver_number}`,
                number: car.driver_number
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

const createCar = (req, res) => {
    const { driver_id, suitability, reliability } = req.body;
    const { race, street } = suitability;

    // Validation
    const isExistParam = isExistParams(race, street, reliability);
    if (!isExistParam.valid) {
        return res.status(400).json({
            code: 400,
            result: isExistParam.message
        });
    }

    const suitabilityValidation = validateSuitability(race, street);

    if (!suitabilityValidation.valid) {
        console.log(suitabilityValidation.message)

        return res.status(400).json({
            code: 400,
            result: suitabilityValidation.message
        });
    }

    // Validate reliability is between 0 and 100
    if (reliability < 0 || reliability > 100) {
        return res.status(400).json({
            code: 400,
            result: 'Reliability must be between 0 and 100'
        });
    }

    const query = `
        INSERT INTO cars (driver_id, suitability_race, suitability_street, reliability)
        VALUES (?, ?, ?, ?)
    `;

    // Insert the new car into the database
    dbconn.query(query, [driver_id || null, race, street, reliability], (err, result) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        res.status(200).json({
            code: 200,
            result: 'Car created',
        });
    });
};

const updateCar = (req, res) => {
    const carId = req.params.id; // Get the car ID from the URL parameter
    const { suitability, reliability } = req.body;
    const { race, street } = suitability;

    // Validation
    const isExistParam = isExistParams(race, street, reliability);
    if (!isExistParam.valid) {
        return res.status(400).json({
            code: 400,
            result: isExistParam.message
        });
    }

    const suitabilityValidation = validateSuitability(race, street);
    if (!suitabilityValidation.valid) {
        console.log(suitabilityValidation.message)

        return res.status(400).json({
            code: 400,
            result: suitabilityValidation.message
        });
    }

    // Validate reliability is between 0 and 100
    if (reliability < 0 || reliability > 100) {
        return res.status(400).json({
            code: 400,
            result: 'Reliability must be between 0 and 100'
        });
    }

    const query = `
        UPDATE cars 
        SET suitability_race = ?, suitability_street = ?, reliability = ? 
        WHERE id = ?
    `;

    dbconn.query(query, [race, street, reliability, carId], (err, result) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error',
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Car not found'
            });
        }

        res.status(200).json({
            code: 200,
            result: 'Car updated'
        });
    });
};

const deleteCar = (req, res) => {
    const carId = req.params.id; // Get the car ID from the URL parameter

    // SQL query to delete the car with the specified ID
    const query = `DELETE FROM cars WHERE id = ?`;

    dbconn.query(query, [carId], (err, result) => {
        if (err) {
            console.log(err)
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

const updateCarDriver = (req, res) => {
    const carId = req.params.id;
    const { number: driver_number } = req.body;

    // Validate that driver_number is provided
    if (!driver_number) {
        return res.status(400).json({
            code: 400,
            result: 'driver_number is required'
        });
    }

    const getDriverQuery = `
        SELECT id FROM drivers WHERE number = ?
    `;

    dbconn.query(getDriverQuery, [driver_number], (err, rows) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error while fetching driver'
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Driver not found'
            });
        }

        const driverId = rows[0].id;

        const updateCarQuery = `
            UPDATE cars 
            SET driver_id = ? 
            WHERE id = ?
        `;

        dbconn.query(updateCarQuery, [driverId, carId], (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    code: 500,
                    result: 'Server error while updating car driver',
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
                result: 'Car driver updated'
            });
        });
    });
};

const deleteCarDriver = (req, res) => {
    const carId = req.params.id;

    const query = `
        UPDATE cars 
        SET driver_id = NULL 
        WHERE id = ?
    `;

    dbconn.query(query, [carId], (err, result) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                result: 'Server error while deleting car driver'
            });
        }

        // If no rows were affected, the car ID does not exist or driver is already NULL
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Car not found or no driver assigned to this car'
            });
        }

        res.status(200).json({
            code: 200,
            result: 'Driver removed from car successfully'
        });
    });
};

const getLapResult = async (req, res) => {
    const carId = req.params.id;
    const { trackType, baseLapTime } = req.query;

    const carQuery = `
        SELECT cars.reliability, cars.suitability_race, cars.suitability_street, drivers.skill_race, drivers.skill_street
        FROM cars
        LEFT JOIN drivers ON cars.driver_id = drivers.id
        WHERE cars.id = ?
    `;

    dbconn.query(carQuery, [carId], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                code: 500,
                result: 'Query data error while fetching car data'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                result: 'Car not found'
            });
        }

        const carData = results[0];
        const { reliability, suitability_race, suitability_street, skill_race, skill_street } = carData;

        const suitability = {
            race: suitability_race,
            street: suitability_street
        };

        const driverSkill = {
            race: skill_race,
            street: skill_street
        };
        console.log(trackType)

        if (suitability[trackType] === undefined || driverSkill[trackType] === undefined) {
            return res.status(400).json({
                code: 400,
                message: `Invalid track type or missing skill/suitability data for track type ${trackType}`
            });
        }

        // Check if the car crashes
        const crashPoint = trackType === 'street' ? reliability + 10 : reliability + 5;
        const crashRandomFactor = Math.random() * crashPoint;

        if (crashRandomFactor > reliability) {
            return res.status(200).json({
                code: 200,
                result: {
                    time: 0,
                    randomness: crashRandomFactor,
                    crashed: true
                }
            });
        }

        // Cal lap time if the car does not crash
        const speed = (suitability[trackType] + driverSkill[trackType] + (100 - reliability)) / 3;
        const lapTime = baseLapTime + (10 * (speed / 100));

        // Add a randomness factor between 0 and 5 seconds
        const randomness = Math.random() * 5;
        const finalLapTime = lapTime + randomness;

        return res.status(200).json({
            code: 200,
            result: {
                time: finalLapTime,
                randomness: randomness,
                crashed: false
            }
        });
    });
};

// Logic check validation
const validateSuitability = (skill_race, skill_street) => {
    const raceSkill = parseInt(skill_race, 10);
    const streetSkill = parseInt(skill_street, 10);

    if (isNaN(raceSkill) || isNaN(streetSkill)) {
        return { valid: false, message: 'Race and street of suitability must be valid numbers' };
    }

    // skill_race + skill_street equals 100
    if (raceSkill + streetSkill !== 100) {
        return { valid: false, message: 'The sum of Race and Street must be 100' };
    }

    return { valid: true, raceSkill, streetSkill };
};

const isExistParams = (race, street, reliability) => {
    let isValid = true;
    let message = "";

    if (!race) {
        isValid = false;
        message = "Race suitability is required."
    } else if (!street) {
        isValid = false;
        message = "Race suitability is required."
    } else if (!reliability) {
        isValid = false;
        message = "Reliability is required."
    }
    
    return {
        valid: isValid,
        message: message
    }
};

// Define a router for all the routes about Cars
const router = express.Router();
router.get('/', getCars);
router.post('/', createCar);
router.get('/:id', getCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);
router.get('/:id/driver', getCarDriver);
router.put('/:id/driver', updateCarDriver);
router.delete('/:id/driver', deleteCarDriver);
router.get('/:id/lap', getLapResult);

// Make the router available to other modules via export/import
export default router;