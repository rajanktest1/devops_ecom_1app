-- ============================================================
-- E-Commerce Database Schema
-- Engine: MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecomm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecomm;

-- -----------------------------------------------------------
-- Products
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description TEXT         NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  emoji       VARCHAR(10)  NOT NULL,
  category    VARCHAR(60)  NOT NULL,
  stock       INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Product Reviews
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id             INT          AUTO_INCREMENT PRIMARY KEY,
  product_id     INT          NOT NULL,
  reviewer_name  VARCHAR(80)  NOT NULL,
  rating         TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT         NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Shopping Cart Items (single shared cart — no auth)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id          INT       AUTO_INCREMENT PRIMARY KEY,
  product_id  INT       NOT NULL,
  quantity    INT       NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uq_cart_product UNIQUE (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
