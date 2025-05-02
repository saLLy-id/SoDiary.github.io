const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database('grades.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        // Create grades table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            grade TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API endpoints
app.get('/api/grades', (req, res) => {
    db.all('SELECT * FROM grades', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/grades', (req, res) => {
    const { subject, grade } = req.body;
    if (!subject || !grade) {
        res.status(400).json({ error: 'Subject and grade are required' });
        return;
    }

    db.run('INSERT INTO grades (subject, grade) VALUES (?, ?)', [subject, grade], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, subject, grade });
    });
});

app.delete('/api/grades/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM grades WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Grade deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 