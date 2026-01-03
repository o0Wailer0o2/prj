CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ADMIN'),
(2, 'USER');

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `phone_number` VARCHAR(255) DEFAULT NULL,
  `avatar_url` VARCHAR(1000) DEFAULT NULL,
  `birthday` DATE DEFAULT NULL,
  `active` INT DEFAULT 1,
  `role_id` INT DEFAULT NULL,
  `role_name` VARCHAR(255) DEFAULT 'USER',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `avatar_url`, `birthday`, `email`, `full_name`, `password`, `phone_number`, `active`, `role_id`, `role_name`) VALUES
(1, 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png', NULL, 'tuan@g', 'tuan', '$2a$10$nW0MZhdtokFTBLxIPIijXuNUMZzMN67v.eKqq7fH4GnKFlTeOzilS', NULL, 1, 2, 'USER'),
(2, 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png', NULL, 'admin@g', 'admin', '$2a$10$AWLDwKmjsWNO.Ka9hGMMJO6PeSwrCdH48Kmk48Ju5E5JG53bhhElK', NULL, 1, 1, 'ADMIN');

CREATE TABLE `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT NULL,
  `image_url` VARCHAR(1000) DEFAULT NULL,
  `price` DOUBLE DEFAULT 0,
  `average_rating` DOUBLE DEFAULT 0,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `height` DOUBLE DEFAULT NULL,
  `width` DOUBLE DEFAULT NULL,
  `length` DOUBLE DEFAULT NULL,
  `weight` DOUBLE DEFAULT NULL,
  `original_value` DOUBLE DEFAULT NULL,
  `current_price` DOUBLE DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `status` INT DEFAULT 1,
  `type` VARCHAR(255) DEFAULT NULL, -- BOOK / CD / DVD / NEWSPAPER
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `books` (
  `product_id` INT NOT NULL,
  `authors` TEXT,
  `cover_type` VARCHAR(50) DEFAULT NULL,
  `publisher` VARCHAR(255) DEFAULT NULL,
  `publication_date` DATETIME DEFAULT NULL,
  `pages` INT DEFAULT NULL,
  `language` VARCHAR(255) DEFAULT NULL,
  `genre` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cds` (
  `product_id` INT NOT NULL,
  `artists` TEXT,
  `record_label` VARCHAR(255) DEFAULT NULL,
  `genre` VARCHAR(255) DEFAULT NULL,
  `release_date` DATETIME DEFAULT NULL,
  `length_seconds` INT DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `dvds` (
  `product_id` INT NOT NULL,
  `disc_type` VARCHAR(50) DEFAULT NULL,
  `director` VARCHAR(255) DEFAULT NULL,
  `runtime_minutes` INT DEFAULT NULL,
  `studio` VARCHAR(255) DEFAULT NULL,
  `language` VARCHAR(255) DEFAULT NULL,
  `subtitles` VARCHAR(255) DEFAULT NULL,
  `release_date` DATETIME DEFAULT NULL,
  `genre` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `newspapers` (
  `product_id` INT NOT NULL,
  `editor_in_chief` VARCHAR(255) DEFAULT NULL,
  `publisher` VARCHAR(255) DEFAULT NULL,
  `publication_date` DATETIME DEFAULT NULL,
  `issue_number` INT DEFAULT NULL,
  `frequency` VARCHAR(255) DEFAULT NULL,
  `issn` VARCHAR(255) DEFAULT NULL,
  `language` VARCHAR(255) DEFAULT NULL,
  `sections` TEXT,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `product_ratings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(255) DEFAULT NULL,

  `user_id` INT DEFAULT NULL,
  `user_full_name` VARCHAR(255),
  `user_email` VARCHAR(255),
  `user_phone_number` VARCHAR(255),

  `shipping_street` VARCHAR(255),
  `shipping_city` VARCHAR(255),
  `shipping_district` VARCHAR(255),
  `shipping_country` VARCHAR(255),
  `shipping_zip` VARCHAR(50),
  `shipping_number` VARCHAR(50),

  `tax` DOUBLE DEFAULT 0,
  `delivery_fee` DOUBLE DEFAULT 0,
  `discount` DOUBLE DEFAULT 0,
  `total_price` DOUBLE DEFAULT 0,

  `status` VARCHAR(255) DEFAULT 'PENDING', -- PENDING / PROCESSING / SHIPPED / DELIVERED / CANCELLED

  `order_notes` TEXT,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(255),
  `unit_price` DOUBLE DEFAULT NULL,
  `quantity` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `country` VARCHAR(255),
  `street` VARCHAR(255),
  `city` VARCHAR(255),
  `district` VARCHAR(255),
  `number` VARCHAR(50),
  `zip` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,

  -- Generic fields thay vì specific cho từng gateway
  `transaction_id` VARCHAR(255) DEFAULT NULL,        -- ID chính từ payment gateway
  `external_reference` VARCHAR(255) DEFAULT NULL,    -- Reference ID phụ (như payment_intent, charge_id)
  `gateway_response` JSON DEFAULT NULL,              -- Lưu toàn bộ response từ gateway để tra cứu

  `amount` DOUBLE NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',

  `payment_method` VARCHAR(50) DEFAULT 'STRIPE',     -- STRIPE / PAYPAL / MOMO / VNPAY / COD
  `payment_status` VARCHAR(50) DEFAULT 'PENDING',    -- PENDING / COMPLETED / FAILED / REFUNDED / CANCELLED

  `paid_at` TIMESTAMP DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Metadata cho các thông tin mở rộng
  `metadata` JSON DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_payment_method` (`payment_method`),
  KEY `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;