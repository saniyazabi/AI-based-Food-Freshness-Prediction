require("dotenv").config();

const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

app.get("/", (req, res) => {
    res.send("FreshLens AI Backend is running!");
});
app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Database is working!", result });
    });
});

app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Email already registered"
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "User registered successfully!",
                user_id: result.insertId
            });
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            res.json({
                message: "Login successful!",
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
console.log("PREDICTION ROUTE LOADED");
app.post("/api/predictions", (req, res) => {
    console.log("PREDICTION REQUEST RECEIVED");
    const {
        user_id,
        image_name,
        category,
        condition_result,
        freshness_score,
        prediction_result
    } = req.body;

    if (!image_name || !category) {
        return res.status(400).json({
            message: "Image name and category are required"
        });
    }

    const sql = `
        INSERT INTO predictions
        (user_id, image_name, category, condition_result, freshness_score, prediction_result)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id || null,
            image_name,
            category,
            condition_result || null,
            freshness_score || null,
            prediction_result || null
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Prediction saved successfully!",
                prediction_id: result.insertId
            });
        }
    );
});
app.get("/api/predictions", (req, res) => {
    const sql = "SELECT * FROM predictions ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

app.get("/api/predictions/user/:user_id", (req, res) => {
    const userId = req.params.user_id;

    const sql = `
        SELECT * FROM predictions
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});
app.delete("/api/predictions/:prediction_id", (req, res) => {
    const predictionId = req.params.prediction_id;

    const sql = "DELETE FROM predictions WHERE prediction_id = ?";

    db.query(sql, [predictionId], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Prediction not found"
            });
        }

        res.json({
            message: "Prediction deleted successfully!"
        });
    });
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});