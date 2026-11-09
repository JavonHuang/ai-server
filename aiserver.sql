/*
 Navicat Premium Dump SQL

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80031 (8.0.31)
 Source Host           : localhost:3306
 Source Schema         : aiserver

 Target Server Type    : MySQL
 Target Server Version : 80031 (8.0.31)
 File Encoding         : 65001

 Date: 09/11/2026 19:29:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for error_code
-- ----------------------------
DROP TABLE IF EXISTS `error_code`;
CREATE TABLE `error_code` (
  `code` smallint NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_time` datetime(3) NOT NULL,
  UNIQUE KEY `error_code_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of error_code
-- ----------------------------
BEGIN;
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (200, '操作成功', NULL, 1, '2026-07-15 01:09:40.000', '2026-07-15 01:09:43.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1001, '用户登录失败', NULL, 1, '2026-07-15 01:10:11.000', '2026-07-15 01:10:14.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1005, '父节点不存在', NULL, 1, '2026-07-25 22:55:55.000', '2026-07-25 22:55:51.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1006, '菜单创建失败', NULL, 1, '2026-07-25 22:56:16.000', '2026-07-25 22:56:19.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1007, '菜单不存在', NULL, 1, '2026-07-25 22:56:40.000', '2026-07-25 22:56:43.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1008, '不能将菜单设为自身的子节点', NULL, 1, '2026-07-25 22:57:00.000', '2026-07-25 22:57:04.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1009, '不能将菜单移到自身的子节点下', NULL, 1, '2026-07-25 22:57:24.000', '2026-07-25 22:57:27.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1010, '菜单更新失败', NULL, 1, '2026-07-25 22:57:46.000', '2026-07-25 22:57:50.000');
INSERT INTO `error_code` (`code`, `message`, `category`, `status`, `created_time`, `updated_time`) VALUES (1011, '菜单删除失败', NULL, 1, '2026-07-25 22:58:11.000', '2026-07-25 22:58:14.000');
COMMIT;

-- ----------------------------
-- Table structure for menu
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `route` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '_self',
  `status` tinyint NOT NULL DEFAULT '1',
  `visible` tinyint NOT NULL DEFAULT '1',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_time` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_path_idx` (`path`),
  KEY `menu_parent_id_idx` (`parent_id`),
  KEY `menu_sort_order_idx` (`sort_order`),
  CONSTRAINT `menu_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `menu` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of menu
-- ----------------------------
BEGIN;
INSERT INTO `menu` (`id`, `parent_id`, `name`, `icon`, `path`, `sort_order`, `route`, `link`, `target`, `status`, `visible`, `remark`, `created_time`, `updated_time`) VALUES ('24d94dd2-ff57-4141-a618-f25091a5c00c', '2d7f6c94-7f42-4a69-a77f-ec0eec028c9b', '菜单查询', 'https://avatars.githubusercontent.com/u/444103', '@/pages/menu/menu.vue', 42, '/menu/menu', '/menu/menu', '_self', 1, 1, 'tempor occaecat non Lorem', '2026-07-25 15:47:02.390', '2026-07-25 15:47:02.405');
INSERT INTO `menu` (`id`, `parent_id`, `name`, `icon`, `path`, `sort_order`, `route`, `link`, `target`, `status`, `visible`, `remark`, `created_time`, `updated_time`) VALUES ('2d7f6c94-7f42-4a69-a77f-ec0eec028c9b', NULL, '根目录', 'https://avatars.githubusercontent.com/u/89354162', '/2d7f6c94-7f42-4a69-a77f-ec0eec028c9b/', 1, '/', 'https://willing-comparison.net/', '_self', 1, 1, 'aliquip culpa dolore sit officia', '2026-07-25 15:46:02.424', '2026-07-25 15:46:02.439');
COMMIT;

-- ----------------------------
-- Table structure for user_account
-- ----------------------------
DROP TABLE IF EXISTS `user_account`;
CREATE TABLE `user_account` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_account` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_time` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_account_user_account_key` (`user_account`),
  UNIQUE KEY `user_account_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of user_account
-- ----------------------------
BEGIN;
INSERT INTO `user_account` (`id`, `user_name`, `user_account`, `password`, `email`, `phone`, `avatar`, `status`, `created_time`, `updated_time`) VALUES ('8738f6e6-be4a-4066-8ff7-37ab0e54bac0', '来玉梅', 'Lorem incididunt et nulla mollit', 'eXKrEO1fGeADOaS', 'k4ti7b50@163.com', '097 5874 7949', 'https://avatars.githubusercontent.com/u/70181047', 1, '2026-07-15 07:45:57.577', '2026-07-15 07:45:57.577');
INSERT INTO `user_account` (`id`, `user_name`, `user_account`, `password`, `email`, `phone`, `avatar`, `status`, `created_time`, `updated_time`) VALUES ('96668a5d-511c-4bde-9d7c-ab5d522d1557', '泣雪', 'Lorem ad ut', '', 'k18to3.gkk@sina.com', '15135561223', 'https://avatars.githubusercontent.com/u/22401437', 1, '2026-07-15 07:45:50.520', '2026-07-15 07:46:44.681');
INSERT INTO `user_account` (`id`, `user_name`, `user_account`, `password`, `email`, `phone`, `avatar`, `status`, `created_time`, `updated_time`) VALUES ('98483484500290', 'Javon', '1', '1', NULL, NULL, NULL, 1, '2026-07-15 00:37:58.000', '2026-07-15 00:37:54.000');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
