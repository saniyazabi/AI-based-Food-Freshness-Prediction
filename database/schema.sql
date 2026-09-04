CREATE DATABASE IF NOT EXISTS food_freshness_db;

USE food_freshness_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_name VARCHAR(255) NOT NULL,
    category ENUM('Food', 'Fruits', 'Vegetables') NOT NULL,
    condition_result ENUM('Vegetarian', 'Non-Vegetarian', 'Fresh', 'Healthy', 'Rotten'),
    freshness_score DECIMAL(5,2),
    prediction_result VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
