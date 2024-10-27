import express from 'express';

// Import the MySQL connection from the previous step
//    and name it dbconn
import dbconn from './dbconn.js';

// Define a function for getting all movies
const getMovies = (req, res) => 
{
    dbconn.query('SELECT * FROM movie', (err, rows) => 
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

const getMovie = (req, res) => 
{
  dbconn.query('SELECT * FROM movie WHERE id = ?', [req.params.id], (err, rows) => 
  {
    // Forward on the SQL errors      
    if(err) 
    {
      res.status(500).send(err);
    }
    
    // Return 404 if no match found
    if (rows.length == 0) 
    {
      res.status(404).json({message: 'Movie Not found'});
      return;
    }
    
    // Otherwise output the one result
    res.json(rows[0]);
  });
}

const createMovie = (req, res) => 
{
    const { name, year, director } = req.body;

    // Basic validation for required fields
    if (!name || !year || !director) {
        return res.status(400).json({ error: 'Please provide name, year, and director.', name: req.body });
    }

    var sql = "INSERT INTO movie (name, year, director) VALUES (?, ?, ?)";

    dbconn.query(sql, [name, year, director], (err, rows) => 
    {
        // Forward on the SQL errors      
        if(err) 
        {
            res.status(500).send(err);
        }
        
        console.log("1 record inserted");
        res.status(200).json({ message: 'Movie created successfully' });
    });
}

const updateMovie = (req, res) => {
    const movie_id = req.params.id;
    const { name, year, director } = req.body;

    // Basic validation for required fields
    if (!name || !year || !director) {
        return res.status(400).json({ error: 'Please provide name, year, and director.' });
    }

    const sql = "UPDATE movie SET name = ?, year = ?, director = ? WHERE id = ?";

    dbconn.query(sql, [name, year, director, movie_id], (err, result) => {
        if (err) {
            // Forward on the SQL errors
            console.error('Database error:', err);
            return res.status(500).send(err);
        }

        // Check if any rows were affected (i.e., the movie ID existed)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        console.log(`Movie with ID ${movie_id} updated`);
        res.status(200).json({ message: 'Movie updated successfully' });
    });
};

const deleteMovie = (req, res) => {
    const movieId = req.params.id;

    const sql = "DELETE FROM movie WHERE id = ?";

    dbconn.query(sql, [movieId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        console.log(`Movie with ID ${movieId} deleted`);
        res.status(200).json({ message: 'Movie deleted successfully' });
    });
};

// Define a router for all the routes about movies
const router = express.Router();
router.get('/', getMovies);
router.get('/:id', getMovie);
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

// Make the router available to other modules via export/import
export default router;