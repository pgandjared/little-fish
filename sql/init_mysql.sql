CREATE TABLE users(
    `id` BIGINT unsigned PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `create_time` DATETIME(3) DEFAULT NULL ,
    `update_time` DATETIME(3) DEFAULT NULL,
    `delete_time` DATETIME(3) DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL ,
    `password` VARCHAR(255) NOT NULL ,
    KEY `index_del_time`(`delete_time`),
    UNIQUE KEY `index_name`(`name`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';
CREATE TABLE product(
    `id` BIGINT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL ,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `cost` BIGINT unsigned NOT NULL ,
    `create_time` DATETIME(3) DEFAULT NULL,
    `update_time` DATETIME(3) DEFAULT NULL,
    `delete_time` DATETIME(3) DEFAULT NULL,
    KEY `index_del_time`(`delete_time`),
    KEY  `index_userid`(`user_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';