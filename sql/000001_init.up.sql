CREATE TABLE users(
    `id` BIGINT unsigned PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `external_id` varchar(255),
    `name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(512) DEFAULT '',
    UNIQUE KEY (`external_id`),
    UNIQUE KEY `index_name`(`name`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

CREATE TABLE product(
    `id` BIGINT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `user_id` varchar(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `cost` BIGINT unsigned NOT NULL,
    `image` VARCHAR(512) DEFAULT '',
    `create_time` DATETIME(3) DEFAULT NULL,
    `update_time` DATETIME(3) DEFAULT NULL,
    `delete_time` DATETIME(3) DEFAULT NULL,
    KEY `index_del_time`(`delete_time`),
    KEY  `index_userid`(`user_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='商品表';

CREATE TABLE orders(
    `id` BIGINT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `buyer_id` varchar(255) NOT NULL,
    `seller_id` varchar(255) NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `status` INT NOT NULL DEFAULT 0,
    `cost` BIGINT unsigned NOT NULL,
    `create_time` DATETIME(3) DEFAULT NULL,
    `update_time` DATETIME(3) DEFAULT NULL,
    `delete_time` DATETIME(3) DEFAULT NULL,
    KEY `index_buyer`(`buyer_id`),
    KEY `index_seller`(`seller_id`),
    KEY `index_product`(`product_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='订单表';

CREATE TABLE messages(
    `id` BIGINT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `sender_id` varchar(255) NOT NULL,
    `receiver_id` varchar(255) NOT NULL,
    `content` TEXT NOT NULL,
    `create_time` DATETIME(3) DEFAULT NULL,
    KEY `index_sender`(`sender_id`),
    KEY `index_receiver`(`receiver_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='私信表';