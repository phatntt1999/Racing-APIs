CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT UNIQUE NOT NULL,
    shortName VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    skill_race INT,
    skill_street INT
);

INSERT INTO drivers (number, shortName, name, skill_race, skill_street)
VALUES 
(3, 'HAM', 'Lewis Hamilton', 80, 20),
(33, 'VER', 'Max Verstappen', 90, 10),
(4, 'NOR', 'Lando Norris', 70, 30),
(16, 'LEC', 'Charles Leclerc', 85, 15),
(55, 'SAI', 'Carlos Sainz', 75, 25);

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT,
    suitability_race INT NOT NULL,
    suitability_street INT NOT NULL,
    reliability INT NOT NULL,
    CONSTRAINT fk_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
        ON DELETE SET NULL -- If the driver is deleted, the driver_id is set to NULL
);

INSERT INTO cars (driver_id, suitability_race, suitability_street, reliability)
VALUES 
    (1, 60, 40, 85),  -- Car with driver ID 1, suited more for race tracks, high reliability
    (2, 40, 60, 75),  -- Car with driver ID 2, suited more for street circuits, moderate reliability
    (NULL, 50, 50, 90), -- Car with no driver, balanced suitability, high reliability
    (3, 70, 30, 65),  -- Car with driver ID 3, strong for race tracks, moderate reliability
    (NULL, 30, 70, 55)