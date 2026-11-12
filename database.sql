
CREATE DATABASE IF NOT EXISTS commonly_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE commonly_db;

-- =========================================
-- 1. USER ACCOUNTS
-- =========================================

CREATE TABLE IF NOT EXISTS user_account (
    user_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pass VARCHAR(255) NOT NULL,
    sessionId VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_user_email (email),
    UNIQUE KEY uq_user_session (sessionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- 2. USER PROFILES
-- =========================================

CREATE TABLE IF NOT EXISTS user_profile (
    profile_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    bio TEXT DEFAULT NULL,
    location VARCHAR(150) DEFAULT NULL,
    avatar_url VARCHAR(2048) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (profile_id),
    UNIQUE KEY uq_profile_user (user_id),

    CONSTRAINT fk_profile_user
        FOREIGN KEY (user_id)
        REFERENCES user_account(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- 3. COMMUNITY POSTS
-- =========================================

CREATE TABLE IF NOT EXISTS posts (
    post_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('offer', 'request') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(150) DEFAULT NULL,
    image_url VARCHAR(2048) DEFAULT NULL,
    expires_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (post_id),
    KEY idx_posts_user (user_id),
    KEY idx_posts_created (created_at),
    KEY idx_posts_type_created (type, created_at),
    KEY idx_posts_category (category),

    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES user_account(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- 4. COMMONLY MEMBERSHIPS
-- =========================================

CREATE TABLE IF NOT EXISTS commonly_memberships (
    user_id BIGINT NOT NULL,
    plan VARCHAR(12) NOT NULL DEFAULT 'FREE',
    expires_at DATETIME DEFAULT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- 5. COMMONLY PAYMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS commonly_payments (
    payment_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    paypal_order_id VARCHAR(80) NOT NULL,
    paypal_capture_id VARCHAR(100) DEFAULT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    membership_granted_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    captured_at DATETIME DEFAULT NULL,

    PRIMARY KEY (payment_id),
    UNIQUE KEY uq_commonly_paypal_order (paypal_order_id),
    KEY idx_commonly_payment_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- 6. COMMONLY AI USAGE
-- =========================================

CREATE TABLE IF NOT EXISTS commonly_ai_usage (
    user_id BIGINT NOT NULL,
    usage_date DATE NOT NULL,
    request_count INT NOT NULL DEFAULT 0,

    PRIMARY KEY (user_id, usage_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
