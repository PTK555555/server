const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

const con = require('./db'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------login----------------
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    con.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error');
        }
        if (results.length !== 1) return res.status(401).send('Wrong username');

        bcrypt.compare(password, results[0].password, (err, same) => {
            if (err) return res.status(500).send('Password compare error');
            if (same) {
                // return JSON with id + username
                res.json({ id: results[0].id, username: results[0].username });
            } else {
                res.status(401).send('Wrong password');
            }
        });
    });
});

// ---------------get all expenses----------------
app.get('/expenses', (req, res) => {
    const sql = 'SELECT * FROM expense';
    con.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error!!');
        } 
        res.json(results);
    });
});

// --- Get Today's Expenses ---
app.get('/expenses/today', (req, res) => {
    const sql = "SELECT * FROM expense WHERE DATE(date) = CURDATE()";
    con.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error!!');
        }
        res.json(results);
    });
});	

// --- Search Expenses by item ---
app.get('/expenses/search', (req, res) => {
    const { q } = req.query; 
    if (!q) return res.status(400).send('Please provide a search query');

    const keywords = q.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keywords.length === 0) return res.status(400).send('No valid search terms');

    const conditions = keywords.map(() => 'item LIKE ?').join(' OR ');
    const values = keywords.map(k => `%${k}%`); 

    const sql = `SELECT * FROM expense WHERE ${conditions}`;

    con.query(sql, values, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error!!');
        }
        res.json(results);
    });
});

// --- Add new expense ---
app.post('/expenses', (req, res) => {
    const { user_id, item, paid } = req.body;

    if (!user_id || !item || !paid) {
        return res.status(400).send('user_id, item and paid are required');
    }

    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error!!');
        }
        res.send('Inserted!');
    });
});

// --- Delete an expense ---
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send('Expense id is required');
    }

    const sql = "DELETE FROM expense WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error!!');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('No such expense');
        }
        res.send('Deleted!');
    });
});

app.listen(3000, () => {
  console.log('Server is running');
});
