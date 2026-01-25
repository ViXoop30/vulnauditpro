CREATE DATABASE IF NOT EXISTS vuln_db;
USE vuln_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    role ENUM('admin', 'pentester') DEFAULT 'pentester',
    status ENUM('active', 'disabled') DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_url VARCHAR(255),
    report_json LONGTEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, role, status) VALUES ('ADMIN_PRO', 'admin', 'active');