import mysql from 'mysql';

// MySQL Config
var con = mysql.createConnection({ 
    user: "phat",
    password: "Anhemtoibanxoi12", //and even better use the .env file or read it from a file not on source control ;)
    database: "asm2"
});

// Connect to MySQL
con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL Connected!");
});

// Make the connection available to other modules via export/import
export default con;