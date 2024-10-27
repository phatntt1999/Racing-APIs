CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_number INT UNIQUE NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    skill_race INT,
    skill_street INT
);

INSERT INTO drivers (driver_number, short_name, name, skill_race, skill_street)
VALUES 
(3, 'HAM', 'Lewis Hamilton', 80, 20),
(33, 'VER', 'Max Verstappen', 90, 10),
(4, 'NOR', 'Lando Norris', 70, 30),
(16, 'LEC', 'Charles Leclerc', 85, 15),
(55, 'SAI', 'Carlos Sainz', 75, 25);