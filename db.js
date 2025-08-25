const mysql = require('mysql2');
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expenses'
});

con.connect((err) => {
    if(err) console.error("Database connection failed:", err);
    else console.log("Connected to database");
});
module.exports = con;