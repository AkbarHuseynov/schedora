-- SCHEDORA Database Schema
-- Run this file once to set up the database

CREATE DATABASE IF NOT EXISTS schedora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE schedora;

-- ─────────────────────────────────────────
-- USERS  (clients, owners, admins)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role        ENUM('client','owner','admin') NOT NULL DEFAULT 'client',
    phone       VARCHAR(20),
    avatar      VARCHAR(255),
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- SHOPS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    owner_id      INT           NOT NULL,
    name          VARCHAR(150)  NOT NULL,
    description   TEXT,
    category      ENUM('barber','beauty','spa','laser','other') NOT NULL DEFAULT 'other',
    address       VARCHAR(255),
    phone         VARCHAR(20),
    cover_image   VARCHAR(255),
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    wallet_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    shop_id      INT           NOT NULL,
    name         VARCHAR(150)  NOT NULL,
    description  TEXT,
    price        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duration_min INT           NOT NULL DEFAULT 30,
    is_active    TINYINT(1)   NOT NULL DEFAULT 1,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- SERVICE PHOTOS  (multiple per service)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_photos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    service_id  INT          NOT NULL,
    filename    VARCHAR(255) NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    client_id    INT           NOT NULL,
    service_id   INT           NOT NULL,
    shop_id      INT           NOT NULL,
    booking_date DATE          NOT NULL,
    booking_time TIME          NOT NULL,
    status       ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
    notes        TEXT,
    total_price  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id)  REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id)    REFERENCES shops(id)    ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- WALLET TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    shop_id     INT           NOT NULL,
    booking_id  INT,
    type        ENUM('credit','debit','adjustment') NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    note        VARCHAR(255),
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)    REFERENCES shops(id)    ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
-- DEFAULT ADMIN SEED
-- ─────────────────────────────────────────
-- Password: Admin@1234  (bcrypt hash pre-generated)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@schedora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- NOTE: replace the hash above after running: node -e "const b=require('bcryptjs');console.log(b.hashSync('Admin@1234',10))"
