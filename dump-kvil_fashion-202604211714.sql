SET SESSION sql_require_primary_key = 0;
-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: kvil_fashion
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CartItems`
--

DROP TABLE IF EXISTS `CartItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CartItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cartId` int DEFAULT NULL,
  `variantId` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CartItems`
--

LOCK TABLES `CartItems` WRITE;
/*!40000 ALTER TABLE `CartItems` DISABLE KEYS */;
INSERT INTO `CartItems` VALUES (2,1,16,2,'2026-04-21 08:30:45','2026-04-21 09:19:06');
/*!40000 ALTER TABLE `CartItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Carts`
--

DROP TABLE IF EXISTS `Carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Carts`
--

LOCK TABLES `Carts` WRITE;
/*!40000 ALTER TABLE `Carts` DISABLE KEYS */;
INSERT INTO `Carts` VALUES (1,2,'2026-03-05 14:41:34','2026-03-05 14:41:34');
/*!40000 ALTER TABLE `Carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES (1,'Áo dài nữ','ao-dai-nu','2026-03-04 10:35:21','2026-03-04 10:35:21'),(3,'Áo Vest Nữ','ao-vest-nu','2026-03-04 10:37:09','2026-03-04 10:37:09'),(4,'Áo Măng Tô','ao-mang-to','2026-03-04 10:37:47','2026-03-04 10:37:47'),(5,'Áo Khoác','ao-khoac','2026-03-04 10:38:00','2026-03-04 10:38:00'),(6,'Chân Váy','chan-vay','2026-03-04 10:38:18','2026-03-04 10:38:18'),(7,'Quần','quan','2026-03-04 10:38:32','2026-03-04 10:38:32'),(8,'Đầm','dam','2026-03-04 10:38:40','2026-03-04 10:38:40'),(9,'Senora','senora','2026-03-04 10:38:53','2026-03-04 10:38:53'),(10,'Jumpsuit','jumpsuit','2026-03-04 10:39:08','2026-03-04 10:39:08'),(14,'Áo sơ mi','ao-so-mi','2026-04-17 10:53:06','2026-04-17 10:53:06'),(15,'Áo kiểu','ao-kieu','2026-04-18 16:26:43','2026-04-18 16:26:43');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChatLogs`
--

DROP TABLE IF EXISTS `ChatLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChatLogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `sessionId` varchar(255) DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `message` text,
  `metadata` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=307 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChatLogs`
--

LOCK TABLES `ChatLogs` WRITE;
/*!40000 ALTER TABLE `ChatLogs` DISABLE KEYS */;
INSERT INTO `ChatLogs` VALUES (95,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','bestseller của shop là sản phẩm nào ?',NULL,'2026-03-18 13:18:02','2026-03-18 14:13:56'),(96,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là những sản phẩm bán chạy nhất của nhà Kvil mình ạ. Đảm bảo sẽ không làm Bạn thất vọng đâu ạ!','[1,11]','2026-03-18 13:18:05','2026-03-18 14:13:56'),(97,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','bestseller của shop là sản phẩm nào ?',NULL,'2026-03-18 13:20:27','2026-03-18 14:13:56'),(98,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là những sản phẩm bán chạy nhất của nhà Kvil mình ạ. Đảm bảo sẽ không làm Bạn thất vọng đâu ạ!','[1,7,11]','2026-03-18 13:20:29','2026-03-18 14:13:56'),(99,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size S còn hàng không ?',NULL,'2026-03-18 13:48:52','2026-03-18 14:13:56'),(100,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, Bạn cho mình xin mã sản phẩm hoặc hình ảnh quần đùi Bạn muốn tìm để mình kiểm tra size S còn hàng không nha. Shop mình có nhiều mẫu quần đùi xinh lắm ạ, Bạn có thể tham khảo một vài mẫu như quần đùi jean, quần đùi vải, quần đùi thể thao nhé.','[11]','2026-03-18 13:48:57','2026-03-18 14:13:56'),(101,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size S còn hàng không ?',NULL,'2026-03-18 13:54:06','2026-03-18 14:13:56'),(102,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ còn hàng size S ạ!',NULL,'2026-03-18 13:54:21','2026-03-18 14:13:56'),(103,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size M còn hàng không ?',NULL,'2026-03-18 13:54:34','2026-03-18 14:13:56'),(104,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.',NULL,'2026-03-18 13:54:37','2026-03-18 14:13:56'),(105,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần giá dưới 300000',NULL,'2026-03-18 14:11:45','2026-03-18 14:13:56'),(106,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'quần\' dưới 300.000đ ạ!','[11]','2026-03-18 14:11:48','2026-03-18 14:13:56'),(107,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần giá dưới 300000',NULL,'2026-03-18 14:14:28','2026-03-20 14:18:27'),(108,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'quần\' dưới 300.000đ ạ!','[11]','2026-03-18 14:14:31','2026-03-20 14:18:27'),(109,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần giá tầm khoảng 300000 đến 500000',NULL,'2026-03-18 14:14:53','2026-03-20 14:18:27'),(110,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'quần\' dưới 500.000đ ạ!','[11]','2026-03-18 14:14:56','2026-03-20 14:18:27'),(111,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Cho tôi xem bestseller của shop bạn',NULL,'2026-03-20 13:58:28','2026-03-20 13:58:28'),(112,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 13:58:31','2026-03-20 13:58:31'),(113,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Cho tôi xem mặt hàng bán chạy nhất của shop bạn',NULL,'2026-03-20 14:08:29','2026-03-20 14:08:29'),(114,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:08:31','2026-03-20 14:08:31'),(115,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Lấy danh sách sản phẩm bán chạy nhất',NULL,'2026-03-20 14:11:52','2026-03-20 14:11:52'),(116,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:11:54','2026-03-20 14:11:54'),(117,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:12:29','2026-03-20 14:18:27'),(118,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là những sản phẩm bán chạy nhất của Kvil mình nè bạn ơi! Đảm bảo không làm bạn thất vọng đâu ạ!','[1,7,11]','2026-03-20 14:12:33','2026-03-20 14:18:27'),(119,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Lấy danh sách áo dài size L',NULL,'2026-03-20 14:17:20','2026-03-20 14:17:20'),(120,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ tiếc quá, hiện tại bên mình đang tạm hết hoặc chưa có mẫu \'áo dài size L\' rồi ạ. Bạn có muốn tham khảo đồ khác không?',NULL,'2026-03-20 14:17:22','2026-03-20 14:17:22'),(121,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:17:55','2026-03-20 14:18:27'),(122,2,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:18:00','2026-03-20 14:18:27'),(123,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Lấy danh sách sản phẩm phần trăm giảm giá cao nhất',NULL,'2026-03-20 14:18:12','2026-03-20 14:18:12'),(124,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ đây là những sản phẩm đang có ưu đãi tốt nhất tại Kvil ạ. Mời bạn tham khảo nha!','[3,15,1,5,4]','2026-03-20 14:18:15','2026-03-20 14:18:15'),(125,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:18:50','2026-03-20 14:18:50'),(126,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:18:53','2026-03-20 14:18:53'),(127,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop còn áo dài không',NULL,'2026-03-20 14:19:15','2026-03-20 14:19:15'),(128,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.',NULL,'2026-03-20 14:19:17','2026-03-20 14:19:17'),(129,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:21:35','2026-03-20 14:21:35'),(130,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:21:38','2026-03-20 14:21:38'),(131,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop còn quần đùi không',NULL,'2026-03-20 14:22:24','2026-03-20 14:22:24'),(132,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ còn hàng ạ!',NULL,'2026-03-20 14:22:27','2026-03-20 14:22:27'),(133,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:24:27','2026-03-20 14:24:27'),(134,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:24:31','2026-03-20 14:24:31'),(135,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:25:04','2026-03-20 14:25:04'),(136,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:25:07','2026-03-20 14:25:07'),(137,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem mặt hàng bán chạy nhất của shop',NULL,'2026-03-20 14:26:03','2026-03-20 14:26:03'),(138,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:26:06','2026-03-20 14:26:06'),(139,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size M còn hàng không',NULL,'2026-03-20 14:30:20','2026-03-20 14:30:20'),(140,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.',NULL,'2026-03-20 14:30:23','2026-03-20 14:30:23'),(141,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm có giảm giá sâu nhất',NULL,'2026-03-20 14:33:43','2026-03-20 14:33:43'),(142,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ đây là các sản phẩm đang có ưu đãi tốt nhất tại shop mình ạ. Bạn xem thử nha!','[3,15,1,5,4]','2026-03-20 14:33:46','2026-03-20 14:33:46'),(143,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần có mức giá dưới 300000',NULL,'2026-03-20 14:34:32','2026-03-20 14:34:32'),(144,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'quần\' dưới 300.000đ ạ!','[11]','2026-03-20 14:34:35','2026-03-20 14:34:35'),(145,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop còn hàng nào trên 500k  không',NULL,'2026-03-20 14:35:05','2026-03-20 14:35:05'),(146,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ, đây là các sản phẩm phù hợp ạ!','[1,7]','2026-03-20 14:35:07','2026-03-20 14:35:07'),(147,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần có mức giá dưới 300000',NULL,'2026-03-20 14:37:48','2026-03-20 14:37:48'),(148,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'quần\' dưới 300.000đ ạ!','[11]','2026-03-20 14:37:52','2026-03-20 14:37:52'),(149,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','bestseller của quán là',NULL,'2026-03-20 14:38:10','2026-03-20 14:38:10'),(150,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:38:13','2026-03-20 14:38:13'),(151,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','bestseller của quán là',NULL,'2026-03-20 14:41:59','2026-03-20 14:41:59'),(152,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-03-20 14:42:02','2026-03-20 14:42:02'),(153,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của quán là',NULL,'2026-03-20 14:42:17','2026-03-20 14:42:17'),(154,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của quán là',NULL,'2026-03-20 14:43:10','2026-03-20 14:43:10'),(155,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của quán là',NULL,'2026-03-20 14:44:43','2026-03-20 14:44:43'),(156,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của quán là',NULL,'2026-03-20 14:45:02','2026-03-20 14:45:02'),(157,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của quán là',NULL,'2026-03-20 14:47:48','2026-03-20 14:47:48'),(158,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của quán là',NULL,'2026-03-20 14:50:47','2026-03-20 14:50:47'),(159,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 14:51:42','2026-03-20 14:51:42'),(160,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 14:55:37','2026-03-20 14:55:37'),(161,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop còn hàng nào trên 500k  không',NULL,'2026-03-20 14:56:16','2026-03-20 14:56:16'),(162,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','BOT','Dạ, đây là các sản phẩm phù hợp ạ!','[1,7]','2026-03-20 14:56:18','2026-03-20 14:56:18'),(163,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 14:57:06','2026-03-20 14:57:06'),(164,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, mình đã tìm được những mẫu quần đùi bán chạy nhất của shop đây ạ! Bạn tham khảo nhé. Bạn muốn mình kiểm tra xem mẫu nào dưới 300.000 VNĐ không ạ?','[11]','2026-03-20 14:57:15','2026-03-20 14:57:15'),(165,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','bestseller của quán',NULL,'2026-03-20 14:57:36','2026-03-20 14:57:36'),(166,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của shop',NULL,'2026-03-20 15:00:38','2026-03-20 15:00:38'),(167,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 15:00:52','2026-03-20 15:00:52'),(168,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tư vấn quần',NULL,'2026-03-20 15:01:51','2026-03-20 15:01:51'),(169,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop có bán váy gucci không',NULL,'2026-03-20 15:05:43','2026-03-20 15:05:43'),(170,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop có bán váy gucci không',NULL,'2026-03-20 15:06:54','2026-03-20 15:06:54'),(171,NULL,'bc3b8d5d-1a3b-43d7-8d8e-c32ebdb6f7b1','USER','Shop có áo dài không',NULL,'2026-03-20 15:07:07','2026-03-20 15:07:07'),(172,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có áo da không',NULL,'2026-03-20 15:31:37','2026-03-20 15:31:37'),(173,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','BOT','Dạ có ạ. Bạn tìm áo da cho nam hay nữ ạ?',NULL,'2026-03-20 15:31:40','2026-03-20 15:31:40'),(174,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Cho nam',NULL,'2026-03-20 15:33:10','2026-03-20 15:33:10'),(175,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','BOT','Dạ tiếc quá, hiện tại bên mình đang tạm hết hoặc chưa có mẫu \'áo da nam\' rồi ạ. Bạn có muốn tham khảo đồ khác không?',NULL,'2026-03-20 15:33:12','2026-03-20 15:33:12'),(176,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có hàng trên 500k không',NULL,'2026-03-20 15:33:38','2026-03-20 15:33:38'),(177,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','BOT','Dạ có ạ. Bạn muốn tìm sản phẩm thuộc nhóm nào ạ? Hoặc bạn có thể cho mình biết khoảng giá cụ thể hơn để mình tìm kiếm dễ hơn ạ.',NULL,'2026-03-20 15:33:40','2026-03-20 15:33:40'),(178,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Quần đùi',NULL,'2026-03-20 15:34:17','2026-03-20 15:34:17'),(179,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','BOT','Dạ shop có quần đùi. Bạn muốn tìm quần đùi nam hay nữ ạ?','[11]','2026-03-20 15:34:19','2026-03-20 15:34:19'),(180,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 15:36:52','2026-03-20 15:36:52'),(181,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hệ thống đang bận, bạn thử lại giúp mình nhé!',NULL,'2026-03-20 15:36:54','2026-03-20 15:36:54'),(182,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có áo dài không',NULL,'2026-03-20 15:38:50','2026-03-20 15:38:50'),(183,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','BOT','Dạ tiếc quá, hiện tại bên mình đang tạm hết hoặc chưa có mẫu \'áo dài\' rồi ạ. Bạn có muốn tham khảo đồ khác không?',NULL,'2026-03-20 15:38:54','2026-03-20 15:38:54'),(184,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có váy màu đen không',NULL,'2026-03-20 15:41:50','2026-03-20 15:41:50'),(185,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','BOT','Dạ tiếc quá, hiện tại bên mình đang tạm hết hoặc chưa có mẫu \'váy màu đen\' rồi ạ. Bạn có muốn tham khảo đồ khác không?',NULL,'2026-03-20 15:41:53','2026-03-20 15:41:53'),(186,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có bán đầm không',NULL,'2026-03-20 15:45:17','2026-03-20 15:45:17'),(187,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 15:55:35','2026-03-20 15:55:35'),(188,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hệ thống đang bận, bạn thử lại giúp mình nhé!',NULL,'2026-03-20 15:55:37','2026-03-20 15:55:37'),(189,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 15:56:38','2026-03-20 15:56:38'),(190,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hệ thống đang bận, bạn thử lại giúp mình nhé!',NULL,'2026-03-20 15:56:41','2026-03-20 15:56:41'),(191,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-20 15:57:40','2026-03-20 15:57:40'),(192,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1,7,11]','2026-03-20 15:57:45','2026-03-20 15:57:45'),(193,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của shop',NULL,'2026-03-20 15:58:25','2026-03-20 15:58:25'),(194,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1,7,11]','2026-03-20 15:58:28','2026-03-20 15:58:28'),(195,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size M còn không ?',NULL,'2026-03-20 15:58:50','2026-03-20 15:58:50'),(196,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.',NULL,'2026-03-20 15:58:54','2026-03-20 15:58:54'),(197,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size XL còn không ?',NULL,'2026-03-20 16:00:52','2026-03-20 16:00:52'),(198,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ còn hàng size XL ạ!',NULL,'2026-03-20 16:00:55','2026-03-20 16:00:55'),(199,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','bestseller của quán là gì ?',NULL,'2026-03-20 16:06:12','2026-03-20 16:06:12'),(200,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1]','2026-03-20 16:06:16','2026-03-20 16:06:16'),(201,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của shop',NULL,'2026-03-20 16:06:36','2026-03-20 16:06:36'),(202,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1,7,11]','2026-03-20 16:06:39','2026-03-20 16:06:39'),(203,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có bán đầm không',NULL,'2026-03-20 16:40:07','2026-03-20 16:40:07'),(204,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có bán đầm không',NULL,'2026-03-20 16:42:19','2026-03-20 16:42:19'),(205,NULL,'4303f429-306d-4aac-9c36-df1e9b60dcdd','USER','Shop có bán đầm không',NULL,'2026-03-20 16:42:25','2026-03-20 16:42:25'),(206,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm bán chạy nhất của shop',NULL,'2026-03-23 17:27:40','2026-03-23 17:27:40'),(207,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1,7,11]','2026-03-23 17:27:45','2026-03-23 17:27:45'),(208,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tôi muốn tư vấn sản phẩm quần',NULL,'2026-03-23 17:28:43','2026-03-23 17:28:43'),(209,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, hoạt động tư vấn sản phẩm quần của chúng tôi thì produits best seller của chúng tôi là quần đùi size XL! ðŸ˜Š',NULL,'2026-03-23 17:28:45','2026-03-23 17:28:45'),(210,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm quần',NULL,'2026-03-23 17:29:46','2026-03-23 17:29:46'),(211,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Sản phẩm quần best seller','[1]','2026-03-23 17:29:50','2026-03-23 17:29:50'),(212,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','sản phẩm quần',NULL,'2026-03-23 17:35:00','2026-03-23 17:35:00'),(213,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1,7,11]','2026-03-23 17:35:04','2026-03-23 17:35:04'),(214,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem các sản phẩm áo của shop',NULL,'2026-03-23 17:35:40','2026-03-23 17:35:40'),(215,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, shop đang có các bộ sưu tập sau:\n\n- Bộ sưu tập Dạ Hội\n- Bộ Sưu Tập Áo Dài 2026\n\nBạn thích bộ nào để mình gửi chi tiết nhé ạ!',NULL,'2026-03-23 17:35:43','2026-03-23 17:35:43'),(216,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần dưới 300000',NULL,'2026-03-23 17:36:18','2026-03-23 17:36:18'),(217,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dưới 300000đ','[1,7,11]','2026-03-23 17:36:22','2026-03-23 17:36:22'),(218,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi dưới 300000',NULL,'2026-03-23 17:36:52','2026-03-23 17:36:52'),(219,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[11]','2026-03-23 17:36:56','2026-03-23 17:36:56'),(220,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','xin chào',NULL,'2026-03-23 17:43:32','2026-03-23 17:43:32'),(221,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Xin chào! Mình là tư vấn shop thời trang. Mình có thể giúp bạn tìm thấy sản phẩm ưng ý nhất nhé!',NULL,'2026-03-23 17:43:36','2026-03-23 17:43:36'),(222,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem các sản phẩm áo của shop',NULL,'2026-03-23 17:45:04','2026-03-23 17:45:04'),(223,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, mình tìm thấy một số mẫu \'áo\' phù hợp với bạn đây ạ!','[14,8,7,6,5]','2026-03-23 17:45:07','2026-03-23 17:45:07'),(224,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem các sản phẩm quần của shop',NULL,'2026-03-23 17:47:10','2026-03-23 17:47:10'),(225,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, mình tìm thấy một số mẫu \'quần\' phù hợp với bạn đây ạ!','[15,14,13,12,11]','2026-03-23 17:47:13','2026-03-23 17:47:13'),(226,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','chào bạn',NULL,'2026-03-23 17:48:04','2026-03-23 17:48:04'),(227,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Xin chào! Mình là tư vấn shop thời trang. Mình có thể giúp bạn tìm thấy sản phẩm ưng ý nhất nhé!',NULL,'2026-03-23 17:48:07','2026-03-23 17:48:07'),(228,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','shop tên là gì',NULL,'2026-03-23 17:49:37','2026-03-23 17:49:37'),(229,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Shop của chúng tôi tên là \"Fashion Paradise\". Mình hy vọng bạn sẽ tìm thấy các sản phẩm thời trang hay nhất tại Shop của chúng tôi!',NULL,'2026-03-23 17:49:43','2026-03-23 17:49:43'),(230,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size XL còn không ?',NULL,'2026-03-23 17:52:34','2026-03-23 17:52:34'),(231,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.',NULL,'2026-03-23 17:52:37','2026-03-23 17:52:37'),(232,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần đùi size S còn không ?',NULL,'2026-03-23 17:52:44','2026-03-23 17:52:44'),(233,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ còn hàng size S ạ!',NULL,'2026-03-23 17:52:46','2026-03-23 17:52:46'),(234,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','áo dưới 500k?',NULL,'2026-03-23 17:56:45','2026-03-23 17:56:45'),(235,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ chưa có sản phẩm phù hợp ạ.',NULL,'2026-03-23 17:56:52','2026-03-23 17:56:52'),(236,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','áo dưới 800k?',NULL,'2026-03-23 17:57:23','2026-03-23 17:57:23'),(237,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'áo\' phù hợp với bạn ạ!','[1,7]','2026-03-23 17:57:26','2026-03-23 17:57:26'),(238,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','Tìm cho mình mấy cái áo dưới 300k với',NULL,'2026-03-23 18:09:47','2026-03-23 18:09:47'),(239,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ chưa có sản phẩm phù hợp ạ.',NULL,'2026-03-23 18:09:52','2026-03-23 18:09:52'),(240,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','Tìm cho mình mấy cái áo dưới 1000k với',NULL,'2026-03-23 18:10:37','2026-03-23 18:10:37'),(241,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm phù hợp ạ!','[11]','2026-03-23 18:10:39','2026-03-23 18:10:39'),(242,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','Tìm cho mình mấy cái áo dưới 1000000 với',NULL,'2026-03-23 18:10:59','2026-03-23 18:10:59'),(243,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm \'áo\' phù hợp với bạn ạ!','[1,7]','2026-03-23 18:11:02','2026-03-23 18:11:02'),(244,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','Tìm cho mình mấy cái áo dưới 1 triệu đồng với',NULL,'2026-03-23 18:11:18','2026-03-23 18:11:18'),(245,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ chưa có sản phẩm phù hợp ạ.',NULL,'2026-03-23 18:11:21','2026-03-23 18:11:21'),(246,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','TShop có quần jean nào tầm 500k đến 1 triệu không',NULL,'2026-03-23 18:11:34','2026-03-23 18:11:34'),(247,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ chưa có sản phẩm phù hợp ạ.',NULL,'2026-03-23 18:11:37','2026-03-23 18:11:37'),(248,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','TShop có quần nào tầm 500k đến 1 triệu không',NULL,'2026-03-23 18:11:46','2026-03-23 18:11:46'),(249,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là một số sản phẩm quần jean tầm 500k đến 1 triệu đồng của Shop:\n\n\n\n\n',NULL,'2026-03-23 18:11:49','2026-03-23 18:11:49'),(250,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','Dạo này cái gì đang hot nhất shop mình vậy',NULL,'2026-03-23 18:12:03','2026-03-23 18:12:03'),(251,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm bán chạy nhất ạ!','[1,7,11]','2026-03-23 18:12:06','2026-03-23 18:12:06'),(252,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi các sản phẩm đang sale mạnh',NULL,'2026-03-23 18:12:42','2026-03-23 18:12:42'),(253,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm đang giảm giá mạnh ạ!','[3,15,1,5,4]','2026-03-23 18:12:44','2026-03-23 18:12:44'),(254,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 1000000 với',NULL,'2026-03-23 18:14:14','2026-03-23 18:14:14'),(255,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm phù hợp ạ!','[11]','2026-03-23 18:14:18','2026-03-23 18:14:18'),(256,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 1000000 với',NULL,'2026-03-23 18:17:23','2026-03-23 18:17:23'),(257,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 1000000 với',NULL,'2026-03-23 18:18:52','2026-03-23 18:18:52'),(258,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dưới 1 triệu','[15,14,13,12,11]','2026-03-23 18:18:56','2026-03-23 18:18:56'),(259,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 700k với',NULL,'2026-03-23 18:19:36','2026-03-23 18:19:36'),(260,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ chưa có sản phẩm phù hợp ạ.',NULL,'2026-03-23 18:19:41','2026-03-23 18:19:41'),(261,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 700 nghìn với',NULL,'2026-03-23 18:20:15','2026-03-23 18:20:15'),(262,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, đây là các sản phẩm đang giảm giá mạnh ạ!','[3,15,1,4,5,6,7,8,13,9]','2026-03-23 18:20:18','2026-03-23 18:20:18'),(263,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem các váy giá rẻ',NULL,'2026-03-23 18:26:47','2026-03-23 18:26:47'),(264,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện tại shop chưa có sản phẩm nào phù hợp với khoảng giá này rồi ạ. Bạn có muốn xem mẫu khác không?',NULL,'2026-03-23 18:26:51','2026-03-23 18:26:51'),(265,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem các váy giá rẻ',NULL,'2026-03-23 18:34:07','2026-03-23 18:34:07'),(266,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dưới 1 triệu','[9]','2026-03-23 18:34:11','2026-03-23 18:34:11'),(267,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','cho tôi xem các váy giá rẻ',NULL,'2026-03-23 18:39:42','2026-03-23 18:39:42'),(268,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, mình tìm thấy một số mẫu \'váy\' phù hợp với bạn đây ạ!','[9]','2026-03-23 18:39:46','2026-03-23 18:39:46'),(269,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 700k với',NULL,'2026-03-24 02:52:54','2026-03-24 02:52:54'),(270,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ hiện tại shop chưa có sản phẩm nào phù hợp với khoảng giá này rồi ạ. Bạn có muốn xem mẫu khác không?',NULL,'2026-03-24 02:52:59','2026-03-24 02:52:59'),(271,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 700000 với',NULL,'2026-03-24 02:53:18','2026-03-24 02:53:18'),(272,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','!function_call,{\"call\":\"filterProductsAdvanced\",\"arguments\":{\"keyword\":\"quần\",\"minPrice\":700000,\"limit\":5}}',NULL,'2026-03-24 02:53:20','2026-03-24 02:53:20'),(273,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','xin chào',NULL,'2026-03-24 02:53:37','2026-03-24 02:53:37'),(274,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Xin chào! 😊.Comment samilar\nBạn có thểories about something? I\'m here to help you with anything related to fashion! 😊',NULL,'2026-03-24 02:53:39','2026-03-24 02:53:39'),(275,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','xin chào',NULL,'2026-03-24 02:55:49','2026-03-24 02:55:49'),(276,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','😊 Xin chào! Bạn lại chào tôi rồi! 😊 How can I help you today? Do you have any questions about a specific product or category?',NULL,'2026-03-24 02:55:53','2026-03-24 02:55:53'),(277,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','tìm cho tôi mấy cái quần dưới 700 nghìn với',NULL,'2026-03-24 02:57:13','2026-03-24 02:57:13'),(278,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','!function_call,{\"call\":\"filterProductsAdvanced\",\"arguments\":{\"keyword\":\"quần\",\"minPrice\":700000,\"limit\":5}}',NULL,'2026-03-24 02:57:16','2026-03-24 02:57:16'),(279,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','áo khoác',NULL,'2026-03-24 02:57:40','2026-03-24 02:57:40'),(280,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','!function_call,{\"call\":\"searchProducts\",\"arguments\":{\"keyword\":\"áo khoác\",\"sort\":\"price_asc\",\"limit\":5}}',NULL,'2026-03-24 02:57:42','2026-03-24 02:57:42'),(281,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','xin chào',NULL,'2026-03-24 02:58:27','2026-03-24 02:58:27'),(282,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','😊 Xin chào! Bạn đang cần tìm sản phẩm gì hôm nay? Tôi sẵn sàng giúp đỡ bạn!',NULL,'2026-03-24 02:58:32','2026-03-24 02:58:32'),(283,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','USER','quần',NULL,'2026-03-24 02:58:40','2026-03-24 02:58:40'),(284,NULL,'72470d0a-c211-4fbd-960c-6eba48b5803e','BOT','Dạ, gửi bạn danh sách sản phẩm bên mình nhé!','[15,14,13,12,11]','2026-03-24 02:58:42','2026-03-24 02:58:42'),(285,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Shop có áo dài không',NULL,'2026-03-27 15:58:20','2026-03-27 15:58:20'),(286,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ tiếc quá, hiện tại bên mình chưa có mẫu \'áo dài\' rồi ạ. Bạn muốn mình gợi ý mẫu khác không?',NULL,'2026-03-27 15:58:24','2026-03-27 15:58:24'),(287,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Vậy à',NULL,'2026-03-27 15:58:42','2026-03-27 15:58:42'),(288,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Haha! Looks like the conversation has just started! 😊 Instead of \"Vậy à\" which means \"So?\" or \"Yeah?\", I\'d like to ask you what you\'re looking for. Are you interested in searching for a specific type of product, such as áo dài? Or maybe you\'d like to check out our best-selling products? Let me know and I\'d be happy to help! 😊',NULL,'2026-03-27 15:58:45','2026-03-27 15:58:45'),(289,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Xin chào',NULL,'2026-03-27 15:59:24','2026-03-27 15:59:24'),(290,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','👋 Chào bạn! 😊 Looks like we\'re starting off with some enthusiastic \"Xin chào\"s! 💪 What can I help you with today? Are you looking for some fashion advice or perhaps some insights into our products? Let me know, and I\'ll do my best to assist you! 😊',NULL,'2026-03-27 15:59:27','2026-03-27 15:59:27'),(291,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Bạn không nói tiếng việt được à',NULL,'2026-03-27 16:00:30','2026-03-27 16:00:30'),(292,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','😊 Tôi xin lỗi, bạn đúng! Tôi nhớ là tôi phải nói tiếng Việt! Let me try again.\n\nTạm biệt, bạn có nhu cầu gì hôm nay? Bạn tìm kiếm sản phẩm gì hay cần được tư vấn về thời trang?veral',NULL,'2026-03-27 16:00:33','2026-03-27 16:00:33'),(293,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Shop có bán đầm không',NULL,'2026-03-27 16:01:12','2026-03-27 16:01:12'),(294,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ, mình tìm thấy một số mẫu \'đầm\' phù hợp với bạn đây ạ!','[10,3]','2026-03-27 16:01:16','2026-03-27 16:01:16'),(295,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Có loại màu đỏ không',NULL,'2026-03-27 16:02:17','2026-03-27 16:02:17'),(296,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ, mình tìm thấy một số mẫu \'đầm\' phù hợp với bạn đây ạ!','[10,3]','2026-03-27 16:02:20','2026-03-27 16:02:20'),(297,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Nó có màu đỏ thật không',NULL,'2026-03-27 16:03:14','2026-03-27 16:03:14'),(298,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ, mình tìm thấy một số mẫu \'đầm\' phù hợp với bạn đây ạ!','[10,3]','2026-03-27 16:03:16','2026-03-27 16:03:16'),(299,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Màu đen thì sao',NULL,'2026-03-27 16:03:42','2026-03-27 16:03:42'),(300,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ, mình tìm thấy một số mẫu \'đầm\' phù hợp với bạn đây ạ!','[10,3]','2026-03-27 16:03:45','2026-03-27 16:03:45'),(301,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Shop có bán quần đùi không',NULL,'2026-03-27 16:16:55','2026-03-27 16:16:55'),(302,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ, mình tìm thấy một số mẫu \'quần đùi\' phù hợp với bạn đây ạ!','[11]','2026-03-27 16:16:58','2026-03-27 16:16:58'),(303,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','USER','Có màu đen không',NULL,'2026-03-27 16:17:41','2026-03-27 16:17:41'),(304,NULL,'c280fc22-d2e4-4446-ab69-55995194b0b0','BOT','Dạ còn hàng màu đen ạ!',NULL,'2026-03-27 16:17:44','2026-03-27 16:17:44'),(305,NULL,'72b62a4c-6e75-44be-aa73-a67a9d2be20d','USER','Cho tôi biết các món best seller của shop',NULL,'2026-04-02 13:28:52','2026-04-02 13:28:52'),(306,NULL,'72b62a4c-6e75-44be-aa73-a67a9d2be20d','BOT','Dạ hiện chưa có dữ liệu bán chạy ạ.',NULL,'2026-04-02 13:29:00','2026-04-02 13:29:00');
/*!40000 ALTER TABLE `ChatLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CollectionProducts`
--

DROP TABLE IF EXISTS `CollectionProducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CollectionProducts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collectionId` int DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CollectionProducts`
--

LOCK TABLES `CollectionProducts` WRITE;
/*!40000 ALTER TABLE `CollectionProducts` DISABLE KEYS */;
INSERT INTO `CollectionProducts` VALUES (10,1,48,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(11,1,49,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(12,1,50,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(13,1,51,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(14,1,52,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(15,1,53,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(16,1,54,'2026-04-18 15:58:01','2026-04-18 15:58:01'),(17,3,44,'2026-04-18 16:00:39','2026-04-18 16:00:39'),(18,3,45,'2026-04-18 16:00:39','2026-04-18 16:00:39'),(19,3,43,'2026-04-18 16:00:39','2026-04-18 16:00:39'),(20,3,42,'2026-04-18 16:00:39','2026-04-18 16:00:39'),(21,3,41,'2026-04-18 16:00:39','2026-04-18 16:00:39'),(22,3,40,'2026-04-18 16:00:39','2026-04-18 16:00:39'),(23,4,72,'2026-04-18 16:06:40','2026-04-18 16:06:40'),(24,4,71,'2026-04-18 16:06:40','2026-04-18 16:06:40'),(25,4,68,'2026-04-18 16:08:27','2026-04-18 16:08:27'),(26,4,76,'2026-04-18 16:14:20','2026-04-18 16:14:20'),(27,4,75,'2026-04-18 16:14:20','2026-04-18 16:14:20'),(28,4,74,'2026-04-18 16:14:20','2026-04-18 16:14:20'),(29,5,82,'2026-04-18 16:33:46','2026-04-18 16:33:46'),(30,5,83,'2026-04-18 16:33:46','2026-04-18 16:33:46'),(31,5,84,'2026-04-18 16:33:46','2026-04-18 16:33:46'),(32,5,85,'2026-04-18 16:33:46','2026-04-18 16:33:46'),(33,5,86,'2026-04-18 16:33:46','2026-04-18 16:33:46'),(34,5,87,'2026-04-18 16:33:46','2026-04-18 16:33:46'),(35,6,85,'2026-04-18 16:40:45','2026-04-18 16:40:45'),(36,6,86,'2026-04-18 16:40:45','2026-04-18 16:40:45'),(37,6,87,'2026-04-18 16:40:45','2026-04-18 16:40:45'),(38,6,84,'2026-04-18 16:40:45','2026-04-18 16:40:45'),(39,6,45,'2026-04-18 16:40:45','2026-04-18 16:40:45'),(40,6,44,'2026-04-18 16:40:45','2026-04-18 16:40:45'),(41,7,91,'2026-04-18 16:55:18','2026-04-18 16:55:18'),(42,7,90,'2026-04-18 16:55:18','2026-04-18 16:55:18'),(43,7,89,'2026-04-18 16:55:18','2026-04-18 16:55:18'),(44,7,88,'2026-04-18 16:55:18','2026-04-18 16:55:18');
/*!40000 ALTER TABLE `CollectionProducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Collections`
--

DROP TABLE IF EXISTS `Collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Collections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `bannerUrl` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Collections`
--

LOCK TABLES `Collections` WRITE;
/*!40000 ALTER TABLE `Collections` DISABLE KEYS */;
INSERT INTO `Collections` VALUES (1,'Bộ Sưu Tập Áo Dài 2026','Bộ sưu tập áo dài nổi nhất năm 2026.','https://res.cloudinary.com/dnj77wstm/image/upload/v1772781431/kvil_ecommerce/uevujzjwc7lwls1ge1yy.jpg','bo-suu-tap-ao-dai-2026',1,'2026-03-06 06:30:30','2026-03-06 09:37:11'),(2,'Bộ sưu tập Dạ Hội','Bộ sưu tập danh cho các chị em chuyên tham gia các buổi party đêm.','https://res.cloudinary.com/dnj77wstm/image/upload/v1772778925/kvil_ecommerce/bzwjxbzvzvytqusjoqp2.jpg','bo-suu-tap-da-hoi',1,'2026-03-06 06:35:19','2026-03-06 06:35:19'),(3,'Hello Summer','Những chiếc đầm xinh xắn cho mùa hè rực rỡ . Chỉ có tại KOISAN.','https://res.cloudinary.com/dnj77wstm/image/upload/v1776528014/kvil_ecommerce/kgp9qiqoadzr0ckwtld1.jpg','hello-summer',1,'2026-04-18 16:00:15','2026-04-18 16:08:53'),(4,'Luxury Lady','Những bộ áo dạ cực kỳ sang trọng chỉ có tại KOISAN.','https://res.cloudinary.com/dnj77wstm/image/upload/v1776528388/kvil_ecommerce/q8qj6jndjlmqrvvwqazu.jpg','luxury-lady',1,'2026-04-18 16:06:29','2026-04-18 16:15:51'),(5,'Sản phẩm Sale','Những sản phẩm được giảm giá cực sốc chỉ có ở KOISAN!','https://res.cloudinary.com/dnj77wstm/image/upload/v1776529016/kvil_ecommerce/s07uopecwf7xcnyeo8k9.jpg','san-pham-sale',1,'2026-04-18 16:16:00','2026-04-18 16:16:57'),(6,'Sweet Lady','Những sản phẩm dành cho những cô gái ngọt ngào chỉ có tại KOISAN','https://res.cloudinary.com/dnj77wstm/image/upload/v1776530414/kvil_ecommerce/zdplsqac6z6lrrnkuium.jpg','sweet-lady',1,'2026-04-18 16:39:58','2026-04-18 16:40:15'),(7,'Our own personal','Những sản phẩm độc đáo của KOISAN','https://res.cloudinary.com/dnj77wstm/image/upload/v1776531309/kvil_ecommerce/fdnafmzz8elcbhdvndhz.jpg','our-own-personal',1,'2026-04-18 16:55:10','2026-04-18 16:55:10');
/*!40000 ALTER TABLE `Collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Coupons`
--

DROP TABLE IF EXISTS `Coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `discountType` varchar(255) DEFAULT NULL,
  `discountValue` decimal(10,0) DEFAULT NULL,
  `minOrderValue` decimal(10,0) DEFAULT NULL,
  `maxDiscountAmount` decimal(10,0) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `usageLimit` int DEFAULT NULL,
  `usedCount` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Coupons`
--

LOCK TABLES `Coupons` WRITE;
/*!40000 ALTER TABLE `Coupons` DISABLE KEYS */;
INSERT INTO `Coupons` VALUES (1,'GIAM50K','fixed',50000,200000,NULL,'2026-03-08 00:00:00','2026-03-30 23:59:59',500,0,1,'2026-03-07 10:39:19','2026-03-07 11:02:17',NULL),(2,'SALE10PT','percent',10,100000,30000,'2026-03-08 00:00:00','2026-03-30 23:59:59',50,0,1,'2026-03-07 10:39:36','2026-03-07 10:39:36',NULL),(3,'TIEP50K','fixed',50000,200000,NULL,'2026-04-16 17:00:00','2026-04-29 17:00:00',10,0,1,'2026-04-17 16:07:54','2026-04-17 16:10:26',NULL);
/*!40000 ALTER TABLE `Coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `InventoryLogs`
--

DROP TABLE IF EXISTS `InventoryLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `InventoryLogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variantId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `note` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `idx_inventory_logs_type` (`type`),
  KEY `idx_inventory_logs_variant` (`variantId`),
  KEY `idx_inventory_logs_created_at` (`createdAt`),
  CONSTRAINT `InventoryLogs_ibfk_1` FOREIGN KEY (`variantId`) REFERENCES `ProductVariants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `InventoryLogs_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `InventoryLogs`
--

LOCK TABLES `InventoryLogs` WRITE;
/*!40000 ALTER TABLE `InventoryLogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `InventoryLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OrderItems`
--

DROP TABLE IF EXISTS `OrderItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrderItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int DEFAULT NULL,
  `variantId` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrderItems`
--

LOCK TABLES `OrderItems` WRITE;
/*!40000 ALTER TABLE `OrderItems` DISABLE KEYS */;
INSERT INTO `OrderItems` VALUES (1,1,1,2,1110000,'2026-03-06 15:18:10','2026-03-06 15:18:10'),(2,2,1,2,1110000,'2026-03-07 06:45:46','2026-03-07 06:45:46'),(3,3,2,2,150000,'2026-03-18 13:17:03','2026-03-18 13:17:03'),(4,4,3,2,30000000,'2026-03-18 13:20:15','2026-03-18 13:20:15');
/*!40000 ALTER TABLE `OrderItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `couponId` int DEFAULT NULL,
  `totalBeforeDiscount` decimal(10,0) DEFAULT NULL,
  `discountAmount` decimal(10,0) DEFAULT NULL,
  `finalAmount` decimal(10,0) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `paymentStatus` tinyint(1) DEFAULT NULL,
  `shippingAddress` text,
  `status` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `shippingFee` decimal(10,0) DEFAULT NULL,
  `deliveryMethod` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
INSERT INTO `Orders` VALUES (1,2,NULL,2220000,0,2220000,'BANK_TRANSFER',0,'123 Lạch Tray, Ngô Quyền, Hải Phòng','cancelled','2026-03-06 15:18:10','2026-04-17 15:31:59',0,'home_delivery'),(2,2,NULL,2220000,0,2220000,'COD',0,'Lạng Công, Kiến Minh, Hải Phòng','pending','2026-03-07 06:45:46','2026-04-17 15:27:59',0,'home_delivery'),(3,2,NULL,300000,0,330000,'COD',0,'Lạng Công, Kiến Minh, Hải Phòng','pending','2026-03-18 13:17:03','2026-03-18 13:17:03',30000,'home_delivery'),(4,2,NULL,60000000,0,60000000,'COD',0,'Lạng Công, Kiến Minh, Hải Phòng','cancelled','2026-03-18 13:20:15','2026-04-19 05:51:54',0,'home_delivery');
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PaymentTransactions`
--

DROP TABLE IF EXISTS `PaymentTransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PaymentTransactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `amount` decimal(10,0) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payment_transactions_status` (`status`),
  KEY `idx_payment_transactions_provider` (`provider`),
  KEY `idx_payment_transactions_order` (`orderId`),
  KEY `idx_payment_transactions_created_at` (`createdAt`),
  CONSTRAINT `PaymentTransactions_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PaymentTransactions`
--

LOCK TABLES `PaymentTransactions` WRITE;
/*!40000 ALTER TABLE `PaymentTransactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `PaymentTransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Permissions`
--

DROP TABLE IF EXISTS `Permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `module` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Permissions`
--

LOCK TABLES `Permissions` WRITE;
/*!40000 ALTER TABLE `Permissions` DISABLE KEYS */;
INSERT INTO `Permissions` VALUES (1,'products.read','Products','Xem danh sách sản phẩm','2026-04-21 02:27:21','2026-04-21 02:27:21'),(2,'products.create','Products','Thêm mới sản phẩm','2026-04-21 02:27:21','2026-04-21 02:27:21'),(3,'products.update','Products','Cập nhật sản phẩm','2026-04-21 02:27:21','2026-04-21 02:27:21'),(4,'products.delete','Products','Xóa sản phẩm','2026-04-21 02:27:21','2026-04-21 02:27:21'),(5,'orders.read','Orders','Xem danh sách đơn hàng','2026-04-21 02:27:21','2026-04-21 02:27:21'),(6,'orders.update','Orders','Cập nhật trạng thái đơn hàng','2026-04-21 02:27:21','2026-04-21 02:27:21'),(7,'chatbot.read','Chatbot','Xem lịch sử chat','2026-04-21 02:27:21','2026-04-21 02:27:21'),(8,'chatbot.manage','Chatbot','Quản lý cấu hình chatbot','2026-04-21 02:27:21','2026-04-21 02:27:21'),(9,'coupons.manage','Coupons','Quản lý mã giảm giá','2026-04-21 02:27:21','2026-04-21 02:27:21'),(10,'users.manage','System','Quản lý người dùng và phân quyền','2026-04-21 02:27:21','2026-04-21 02:27:21'),(11,'dashboard.read','System','Xem thống kê báo cáo doanh thu','2026-04-21 05:35:37','2026-04-21 05:35:37'),(12,'inventory.read','Products','Xem lịch sử nhập xuất kho','2026-04-21 05:35:37','2026-04-21 05:35:37'),(13,'payments.read','Orders','Xem các giao dịch thanh toán','2026-04-21 05:35:37','2026-04-21 05:35:37'),(14,'categories.manage','Products','Quản trị danh mục sản phẩm','2026-04-21 05:35:37','2026-04-21 05:35:37'),(15,'collections.manage','Products','Quản trị các bộ sưu tập','2026-04-21 05:35:37','2026-04-21 05:35:37');
/*!40000 ALTER TABLE `Permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductImages`
--

DROP TABLE IF EXISTS `ProductImages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductImages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `publicId` varchar(255) DEFAULT NULL,
  `isMain` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductImages`
--

LOCK TABLES `ProductImages` WRITE;
/*!40000 ALTER TABLE `ProductImages` DISABLE KEYS */;
INSERT INTO `ProductImages` VALUES (1,1,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772690992/kvil_ecommerce/wbfjzdqb6a80r48icinq.jpg',NULL,1,'2026-03-05 06:09:47','2026-03-05 06:46:39'),(2,1,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772691012/kvil_ecommerce/g4ojnyxrlnfb5w8jrh6v.jpg',NULL,0,'2026-03-05 06:10:07','2026-03-05 06:46:39'),(3,1,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772691023/kvil_ecommerce/faelmaoeisyrvr0bwvzt.jpg',NULL,0,'2026-03-05 06:10:18','2026-03-05 06:46:39'),(4,2,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772691723/kvil_ecommerce/zjszktbb70eagacz4rqb.jpg',NULL,1,'2026-03-05 06:22:01','2026-03-05 06:22:01'),(5,2,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772691724/kvil_ecommerce/qiub7xr5pl63ln3lvnw1.jpg',NULL,0,'2026-03-05 06:22:01','2026-03-05 06:22:01'),(6,2,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772691726/kvil_ecommerce/jfk7da504solatqpftnp.jpg',NULL,0,'2026-03-05 06:22:01','2026-03-05 06:22:01'),(7,2,'https://res.cloudinary.com/dnj77wstm/image/upload/v1772691724/kvil_ecommerce/gthmhrme0cvnlgx5mdna.jpg',NULL,0,'2026-03-05 06:22:01','2026-03-05 06:22:01'),(9,18,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776420946/kvil_ecommerce/tt1faftxxeo0esvy3dwe.jpg','kvil_ecommerce/tt1faftxxeo0esvy3dwe',0,'2026-04-17 10:15:28','2026-04-17 10:17:47'),(11,17,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776421724/kvil_ecommerce/bzxzuo99lsbx5mbbubko.jpg','kvil_ecommerce/bzxzuo99lsbx5mbbubko',1,'2026-04-17 10:28:45','2026-04-17 10:28:45'),(12,20,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422018/kvil_ecommerce/wpgig5ayze7pebfixljb.jpg','kvil_ecommerce/wpgig5ayze7pebfixljb',1,'2026-04-17 10:33:39','2026-04-17 10:33:39'),(13,20,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422018/kvil_ecommerce/ojhy4ikmpva4czjabbad.jpg','kvil_ecommerce/ojhy4ikmpva4czjabbad',0,'2026-04-17 10:33:39','2026-04-17 10:33:39'),(14,20,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422018/kvil_ecommerce/pa8wnopo5hbdkiu2mo2b.jpg','kvil_ecommerce/pa8wnopo5hbdkiu2mo2b',0,'2026-04-17 10:33:39','2026-04-17 10:33:39'),(15,21,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422088/kvil_ecommerce/fodym907324wtpevrqf3.jpg','kvil_ecommerce/fodym907324wtpevrqf3',1,'2026-04-17 10:34:48','2026-04-17 10:34:48'),(16,22,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422149/kvil_ecommerce/q3qf3gd98zjmxxp3qjnh.jpg','kvil_ecommerce/q3qf3gd98zjmxxp3qjnh',1,'2026-04-17 10:35:50','2026-04-17 10:35:50'),(17,23,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422258/kvil_ecommerce/p9ydesnlanpj5ecrurpr.jpg','kvil_ecommerce/p9ydesnlanpj5ecrurpr',1,'2026-04-17 10:37:40','2026-04-17 10:37:40'),(18,23,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422259/kvil_ecommerce/xjliiicuywla746mbpds.jpg','kvil_ecommerce/xjliiicuywla746mbpds',0,'2026-04-17 10:37:40','2026-04-17 10:37:40'),(19,23,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422258/kvil_ecommerce/xdsrmap5klxh59mneavt.jpg','kvil_ecommerce/xdsrmap5klxh59mneavt',0,'2026-04-17 10:37:40','2026-04-17 10:37:40'),(20,24,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422365/kvil_ecommerce/ern8i5ttkcbenvjjc6sr.jpg','kvil_ecommerce/ern8i5ttkcbenvjjc6sr',1,'2026-04-17 10:39:26','2026-04-17 10:39:26'),(21,26,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422508/kvil_ecommerce/dq4vwft3v3bcypyd9ulp.jpg','kvil_ecommerce/dq4vwft3v3bcypyd9ulp',1,'2026-04-17 10:41:49','2026-04-17 10:41:49'),(22,25,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422541/kvil_ecommerce/kxmrgor1eagz6sb7eftn.jpg','kvil_ecommerce/kxmrgor1eagz6sb7eftn',1,'2026-04-17 10:42:22','2026-04-17 10:42:22'),(23,25,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422541/kvil_ecommerce/kjseo0a0jynpqzcx9jxp.jpg','kvil_ecommerce/kjseo0a0jynpqzcx9jxp',0,'2026-04-17 10:42:22','2026-04-17 10:42:22'),(24,25,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422541/kvil_ecommerce/o2j6udm5zik7cfq0lhtf.jpg','kvil_ecommerce/o2j6udm5zik7cfq0lhtf',0,'2026-04-17 10:42:22','2026-04-17 10:42:22'),(25,27,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422632/kvil_ecommerce/mfpzumrvpbqwlyolkzd8.jpg','kvil_ecommerce/mfpzumrvpbqwlyolkzd8',1,'2026-04-17 10:43:54','2026-04-17 10:43:54'),(26,27,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422632/kvil_ecommerce/ybulvca83zxheniegjzv.jpg','kvil_ecommerce/ybulvca83zxheniegjzv',0,'2026-04-17 10:43:54','2026-04-17 10:43:54'),(27,27,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422633/kvil_ecommerce/vrfhuvzp1axblbqkcn21.jpg','kvil_ecommerce/vrfhuvzp1axblbqkcn21',0,'2026-04-17 10:43:54','2026-04-17 10:43:54'),(28,28,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422847/kvil_ecommerce/lcqldzcfx0o0vwcvuxb2.jpg','kvil_ecommerce/lcqldzcfx0o0vwcvuxb2',1,'2026-04-17 10:47:28','2026-04-17 10:47:28'),(29,28,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422847/kvil_ecommerce/gpqnugkoamuxfhxnrrsz.jpg','kvil_ecommerce/gpqnugkoamuxfhxnrrsz',0,'2026-04-17 10:47:28','2026-04-17 10:47:28'),(30,29,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422917/kvil_ecommerce/y0wa2oudvc2yi7iczilc.jpg','kvil_ecommerce/y0wa2oudvc2yi7iczilc',1,'2026-04-17 10:48:37','2026-04-17 10:48:37'),(31,29,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422917/kvil_ecommerce/j8lpqzhrbix283fhxbn0.jpg','kvil_ecommerce/j8lpqzhrbix283fhxbn0',0,'2026-04-17 10:48:37','2026-04-17 10:48:37'),(32,30,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422967/kvil_ecommerce/mtxmt1fu2extchqvogwq.jpg','kvil_ecommerce/mtxmt1fu2extchqvogwq',1,'2026-04-17 10:49:28','2026-04-17 10:49:28'),(33,30,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776422967/kvil_ecommerce/vxn3apxch3jahpaofphn.jpg','kvil_ecommerce/vxn3apxch3jahpaofphn',0,'2026-04-17 10:49:28','2026-04-17 10:49:28'),(34,31,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423018/kvil_ecommerce/zyc3zynp8wohhv2joymm.jpg','kvil_ecommerce/zyc3zynp8wohhv2joymm',1,'2026-04-17 10:50:19','2026-04-17 10:50:19'),(35,31,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423018/kvil_ecommerce/rkolihtgveoceo0a7p8b.jpg','kvil_ecommerce/rkolihtgveoceo0a7p8b',0,'2026-04-17 10:50:19','2026-04-17 10:50:19'),(36,31,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423018/kvil_ecommerce/oe1c4bscynmc1jc9ijm4.jpg','kvil_ecommerce/oe1c4bscynmc1jc9ijm4',0,'2026-04-17 10:50:19','2026-04-17 10:50:19'),(37,32,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423076/kvil_ecommerce/sj8ywshrohogyazptshq.jpg','kvil_ecommerce/sj8ywshrohogyazptshq',1,'2026-04-17 10:51:17','2026-04-17 10:51:17'),(38,33,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423132/kvil_ecommerce/aa4oe22ulwpgw7k8vgpl.jpg','kvil_ecommerce/aa4oe22ulwpgw7k8vgpl',1,'2026-04-17 10:52:13','2026-04-17 10:52:13'),(39,33,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423132/kvil_ecommerce/bunxaillcoiiev6abvjl.jpg','kvil_ecommerce/bunxaillcoiiev6abvjl',0,'2026-04-17 10:52:13','2026-04-17 10:52:13'),(40,34,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423272/kvil_ecommerce/loy1lnlcfeeuryemjzkx.jpg','kvil_ecommerce/loy1lnlcfeeuryemjzkx',1,'2026-04-17 10:54:35','2026-04-17 10:54:35'),(41,34,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423273/kvil_ecommerce/aarnnqdkhtvck7mebl5b.jpg','kvil_ecommerce/aarnnqdkhtvck7mebl5b',0,'2026-04-17 10:54:35','2026-04-17 10:54:35'),(42,34,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423274/kvil_ecommerce/epmfaxtszkqevu3esdys.jpg','kvil_ecommerce/epmfaxtszkqevu3esdys',0,'2026-04-17 10:54:35','2026-04-17 10:54:35'),(43,35,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423346/kvil_ecommerce/ch2d5jhmt9mqwcmagfx2.jpg','kvil_ecommerce/ch2d5jhmt9mqwcmagfx2',1,'2026-04-17 10:55:49','2026-04-17 10:55:49'),(44,35,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423347/kvil_ecommerce/wckbatjtyocjugdujair.jpg','kvil_ecommerce/wckbatjtyocjugdujair',0,'2026-04-17 10:55:49','2026-04-17 10:55:49'),(45,35,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423348/kvil_ecommerce/lnovjfpb6ylnmtakou1l.jpg','kvil_ecommerce/lnovjfpb6ylnmtakou1l',0,'2026-04-17 10:55:49','2026-04-17 10:55:49'),(46,36,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423407/kvil_ecommerce/ytrrovnul6htcrmklrby.jpg','kvil_ecommerce/ytrrovnul6htcrmklrby',1,'2026-04-17 10:56:48','2026-04-17 10:56:48'),(47,36,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423407/kvil_ecommerce/kffmd38c6rfb80eiorvu.jpg','kvil_ecommerce/kffmd38c6rfb80eiorvu',0,'2026-04-17 10:56:48','2026-04-17 10:56:48'),(48,36,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423407/kvil_ecommerce/qi3opf5biusd3ids0akz.jpg','kvil_ecommerce/qi3opf5biusd3ids0akz',0,'2026-04-17 10:56:48','2026-04-17 10:56:48'),(49,37,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423495/kvil_ecommerce/biad3kg65azz1jdi1vew.jpg','kvil_ecommerce/biad3kg65azz1jdi1vew',1,'2026-04-17 10:58:16','2026-04-17 10:58:16'),(50,37,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423495/kvil_ecommerce/fq4vmfc89qow7nn36w0l.jpg','kvil_ecommerce/fq4vmfc89qow7nn36w0l',0,'2026-04-17 10:58:16','2026-04-17 10:58:16'),(51,37,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423494/kvil_ecommerce/ewq6jjfendu7wfcyuraf.jpg','kvil_ecommerce/ewq6jjfendu7wfcyuraf',0,'2026-04-17 10:58:16','2026-04-17 10:58:16'),(52,38,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423613/kvil_ecommerce/fy2uxfywmiymbhgdxfuj.jpg','kvil_ecommerce/fy2uxfywmiymbhgdxfuj',1,'2026-04-17 11:00:14','2026-04-17 11:00:14'),(53,38,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423613/kvil_ecommerce/j05fn66lvcgu15q3rbsp.jpg','kvil_ecommerce/j05fn66lvcgu15q3rbsp',0,'2026-04-17 11:00:14','2026-04-17 11:00:14'),(54,39,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423688/kvil_ecommerce/efbfg6x476ygvhqtv4k0.jpg','kvil_ecommerce/efbfg6x476ygvhqtv4k0',1,'2026-04-17 11:01:30','2026-04-17 11:01:30'),(55,39,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776423689/kvil_ecommerce/ug82gr6ormhyjwpu7y7y.jpg','kvil_ecommerce/ug82gr6ormhyjwpu7y7y',0,'2026-04-17 11:01:30','2026-04-17 11:01:30'),(56,40,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429676/kvil_ecommerce/naxqnqok9dlyhms5jhpa.jpg','kvil_ecommerce/naxqnqok9dlyhms5jhpa',1,'2026-04-17 12:41:17','2026-04-17 12:41:17'),(57,40,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429676/kvil_ecommerce/pftvxua8m4hqj9l2cvt4.jpg','kvil_ecommerce/pftvxua8m4hqj9l2cvt4',0,'2026-04-17 12:41:17','2026-04-17 12:41:17'),(58,41,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429752/kvil_ecommerce/wn7zwvwrjmlwm8gtrmil.jpg','kvil_ecommerce/wn7zwvwrjmlwm8gtrmil',1,'2026-04-17 12:42:34','2026-04-17 12:42:34'),(59,41,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429752/kvil_ecommerce/fkii3exi7onpbpv8zrxq.jpg','kvil_ecommerce/fkii3exi7onpbpv8zrxq',0,'2026-04-17 12:42:34','2026-04-17 12:42:34'),(60,41,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429752/kvil_ecommerce/p5ghlawtv9edjw07hzcn.jpg','kvil_ecommerce/p5ghlawtv9edjw07hzcn',0,'2026-04-17 12:42:34','2026-04-17 12:42:34'),(61,42,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429851/kvil_ecommerce/en0887gauufjmlatck4g.jpg','kvil_ecommerce/en0887gauufjmlatck4g',1,'2026-04-17 12:44:13','2026-04-17 12:44:13'),(62,42,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429851/kvil_ecommerce/duwlzmdkp5fdazqyapnt.jpg','kvil_ecommerce/duwlzmdkp5fdazqyapnt',0,'2026-04-17 12:44:13','2026-04-17 12:44:13'),(63,42,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429851/kvil_ecommerce/msavw0lykzpcddqdvgek.jpg','kvil_ecommerce/msavw0lykzpcddqdvgek',0,'2026-04-17 12:44:13','2026-04-17 12:44:13'),(64,43,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429912/kvil_ecommerce/jh65rkibdg6glmmeqyqp.jpg','kvil_ecommerce/jh65rkibdg6glmmeqyqp',1,'2026-04-17 12:45:13','2026-04-17 12:45:13'),(65,43,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429912/kvil_ecommerce/loh3zowmoa9rez5igbv0.jpg','kvil_ecommerce/loh3zowmoa9rez5igbv0',0,'2026-04-17 12:45:13','2026-04-17 12:45:13'),(66,44,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429994/kvil_ecommerce/qxilyt5457y5k8fkkj7n.jpg','kvil_ecommerce/qxilyt5457y5k8fkkj7n',1,'2026-04-17 12:46:37','2026-04-17 12:46:37'),(67,44,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429994/kvil_ecommerce/gv7tclizivtwsbhhsa51.jpg','kvil_ecommerce/gv7tclizivtwsbhhsa51',0,'2026-04-17 12:46:37','2026-04-17 12:46:37'),(68,44,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776429996/kvil_ecommerce/jb9ff7qggknargbz2r4r.jpg','kvil_ecommerce/jb9ff7qggknargbz2r4r',0,'2026-04-17 12:46:37','2026-04-17 12:46:37'),(69,45,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430060/kvil_ecommerce/ewpan6zi6jkuzlvhvkrs.jpg','kvil_ecommerce/ewpan6zi6jkuzlvhvkrs',1,'2026-04-17 12:47:42','2026-04-17 12:47:42'),(70,45,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430060/kvil_ecommerce/d8pae66dwjecksfpopei.jpg','kvil_ecommerce/d8pae66dwjecksfpopei',0,'2026-04-17 12:47:42','2026-04-17 12:47:42'),(71,45,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430061/kvil_ecommerce/oapc5e7rqaay3gtptgtk.jpg','kvil_ecommerce/oapc5e7rqaay3gtptgtk',0,'2026-04-17 12:47:42','2026-04-17 12:47:42'),(72,46,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430133/kvil_ecommerce/envcqenq5lum8sljide0.jpg','kvil_ecommerce/envcqenq5lum8sljide0',1,'2026-04-17 12:48:54','2026-04-17 12:48:54'),(73,47,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430181/kvil_ecommerce/qggiqneces2pymoytmta.jpg','kvil_ecommerce/qggiqneces2pymoytmta',1,'2026-04-17 12:49:43','2026-04-17 12:49:43'),(74,47,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430181/kvil_ecommerce/o8yhsymu6o6fscv25mae.jpg','kvil_ecommerce/o8yhsymu6o6fscv25mae',0,'2026-04-17 12:49:43','2026-04-17 12:49:43'),(75,47,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430182/kvil_ecommerce/oaiuqhkgpypajlmh022b.jpg','kvil_ecommerce/oaiuqhkgpypajlmh022b',0,'2026-04-17 12:49:43','2026-04-17 12:49:43'),(76,48,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430249/kvil_ecommerce/bg7qbbasq7jpajghdhnn.jpg','kvil_ecommerce/bg7qbbasq7jpajghdhnn',1,'2026-04-17 12:50:52','2026-04-17 12:50:52'),(77,48,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430250/kvil_ecommerce/jcd0x81em71xj5qgzrh6.jpg','kvil_ecommerce/jcd0x81em71xj5qgzrh6',0,'2026-04-17 12:50:52','2026-04-17 12:50:52'),(78,48,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430251/kvil_ecommerce/agwipzmquuvxpfkynoez.jpg','kvil_ecommerce/agwipzmquuvxpfkynoez',0,'2026-04-17 12:50:52','2026-04-17 12:50:52'),(79,49,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430303/kvil_ecommerce/bgt69zxgrt8v4w5vdwnw.jpg','kvil_ecommerce/bgt69zxgrt8v4w5vdwnw',1,'2026-04-17 12:51:45','2026-04-17 12:51:45'),(80,49,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430303/kvil_ecommerce/rqhvi8stmefvuq5oxfwm.jpg','kvil_ecommerce/rqhvi8stmefvuq5oxfwm',0,'2026-04-17 12:51:45','2026-04-17 12:51:45'),(81,49,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430304/kvil_ecommerce/b9hkh9aqzhsvo2qaa3qz.jpg','kvil_ecommerce/b9hkh9aqzhsvo2qaa3qz',0,'2026-04-17 12:51:45','2026-04-17 12:51:45'),(85,50,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430380/kvil_ecommerce/kpupurwwrbfkojngh5pt.jpg','kvil_ecommerce/kpupurwwrbfkojngh5pt',1,'2026-04-17 12:53:02','2026-04-17 12:53:02'),(86,50,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430381/kvil_ecommerce/zkvgwg7aquvh5brqbl0n.jpg','kvil_ecommerce/zkvgwg7aquvh5brqbl0n',0,'2026-04-17 12:53:02','2026-04-17 12:53:02'),(87,51,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430429/kvil_ecommerce/tkmwjno4pk1xgdn2iumx.jpg','kvil_ecommerce/tkmwjno4pk1xgdn2iumx',1,'2026-04-17 12:53:50','2026-04-17 12:53:50'),(88,51,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430430/kvil_ecommerce/ssx2p9fhsfl7kvw6hztd.jpg','kvil_ecommerce/ssx2p9fhsfl7kvw6hztd',0,'2026-04-17 12:53:50','2026-04-17 12:53:50'),(89,52,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430481/kvil_ecommerce/lqyocdkxdb31raud2cdb.jpg','kvil_ecommerce/lqyocdkxdb31raud2cdb',1,'2026-04-17 12:54:42','2026-04-17 12:54:42'),(90,52,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430481/kvil_ecommerce/naf2lfblnlkowzmq0ymu.jpg','kvil_ecommerce/naf2lfblnlkowzmq0ymu',0,'2026-04-17 12:54:42','2026-04-17 12:54:42'),(91,53,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430561/kvil_ecommerce/ab0s2b4ax5jw3fpddhng.jpg','kvil_ecommerce/ab0s2b4ax5jw3fpddhng',1,'2026-04-17 12:56:02','2026-04-17 12:56:02'),(92,53,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430561/kvil_ecommerce/f3sgijdkhl7b550ueawj.jpg','kvil_ecommerce/f3sgijdkhl7b550ueawj',0,'2026-04-17 12:56:02','2026-04-17 12:56:02'),(93,54,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430623/kvil_ecommerce/c89fklwmst88qtmpnswf.jpg','kvil_ecommerce/c89fklwmst88qtmpnswf',1,'2026-04-17 12:57:04','2026-04-17 12:57:04'),(94,54,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430623/kvil_ecommerce/rvzbevpbd54bhhbzvoho.jpg','kvil_ecommerce/rvzbevpbd54bhhbzvoho',0,'2026-04-17 12:57:04','2026-04-17 12:57:04'),(95,54,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430623/kvil_ecommerce/pfrfibvfzuefzemsc8bg.jpg','kvil_ecommerce/pfrfibvfzuefzemsc8bg',0,'2026-04-17 12:57:04','2026-04-17 12:57:04'),(96,55,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430726/kvil_ecommerce/n7gnrsujizxdy5y4xwgw.jpg','kvil_ecommerce/n7gnrsujizxdy5y4xwgw',1,'2026-04-17 12:58:50','2026-04-17 12:58:50'),(97,55,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430725/kvil_ecommerce/fu9j5mt3vdsvhg0rolmh.jpg','kvil_ecommerce/fu9j5mt3vdsvhg0rolmh',0,'2026-04-17 12:58:50','2026-04-17 12:58:50'),(98,55,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430726/kvil_ecommerce/vzmvoj29si4fmewavcx9.jpg','kvil_ecommerce/vzmvoj29si4fmewavcx9',0,'2026-04-17 12:58:50','2026-04-17 12:58:50'),(99,56,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430764/kvil_ecommerce/yhgbmpmnpwxbacgyvlch.jpg','kvil_ecommerce/yhgbmpmnpwxbacgyvlch',1,'2026-04-17 12:59:25','2026-04-17 12:59:25'),(100,56,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430764/kvil_ecommerce/bz1kyijevlf0u0of1g1q.jpg','kvil_ecommerce/bz1kyijevlf0u0of1g1q',0,'2026-04-17 12:59:25','2026-04-17 12:59:25'),(101,57,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430809/kvil_ecommerce/eyy5kpqoobcjm27x4ihz.jpg','kvil_ecommerce/eyy5kpqoobcjm27x4ihz',1,'2026-04-17 13:00:10','2026-04-17 13:00:10'),(102,57,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430810/kvil_ecommerce/tenadmplxlkieojcxqqc.jpg','kvil_ecommerce/tenadmplxlkieojcxqqc',0,'2026-04-17 13:00:10','2026-04-17 13:00:10'),(103,58,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430914/kvil_ecommerce/nbneeqey8pqc2xqjlzys.jpg','kvil_ecommerce/nbneeqey8pqc2xqjlzys',1,'2026-04-17 13:01:55','2026-04-17 13:01:55'),(104,58,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430914/kvil_ecommerce/xzm3wucmifykneb7nuc5.jpg','kvil_ecommerce/xzm3wucmifykneb7nuc5',0,'2026-04-17 13:01:55','2026-04-17 13:01:55'),(105,59,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430996/kvil_ecommerce/da5mas8d8icjyx0kp15q.jpg','kvil_ecommerce/da5mas8d8icjyx0kp15q',1,'2026-04-17 13:03:18','2026-04-17 13:03:18'),(106,59,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776430997/kvil_ecommerce/wbovcyhjsjd9n8axguzy.jpg','kvil_ecommerce/wbovcyhjsjd9n8axguzy',0,'2026-04-17 13:03:18','2026-04-17 13:03:18'),(107,60,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431033/kvil_ecommerce/oegw8jcv80o54pipxg4a.jpg','kvil_ecommerce/oegw8jcv80o54pipxg4a',1,'2026-04-17 13:03:54','2026-04-17 13:03:54'),(108,60,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431033/kvil_ecommerce/tg3mimnqkdi4ofsbwgvp.jpg','kvil_ecommerce/tg3mimnqkdi4ofsbwgvp',0,'2026-04-17 13:03:54','2026-04-17 13:03:54'),(109,61,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431076/kvil_ecommerce/zb6ua9dqeiwsirfiruwy.jpg','kvil_ecommerce/zb6ua9dqeiwsirfiruwy',1,'2026-04-17 13:04:37','2026-04-17 13:04:37'),(110,61,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431076/kvil_ecommerce/oerpucoklzujifmvdv9e.jpg','kvil_ecommerce/oerpucoklzujifmvdv9e',0,'2026-04-17 13:04:37','2026-04-17 13:04:37'),(111,62,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431133/kvil_ecommerce/nmbaj27nwqylrvjipqmn.jpg','kvil_ecommerce/nmbaj27nwqylrvjipqmn',1,'2026-04-17 13:05:34','2026-04-17 13:05:34'),(112,62,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431133/kvil_ecommerce/z6ztvewcbf9sneqcy3tg.jpg','kvil_ecommerce/z6ztvewcbf9sneqcy3tg',0,'2026-04-17 13:05:34','2026-04-17 13:05:34'),(113,63,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431187/kvil_ecommerce/uzsazf1pndinewhgkata.jpg','kvil_ecommerce/uzsazf1pndinewhgkata',1,'2026-04-17 13:06:30','2026-04-17 13:06:30'),(114,63,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431188/kvil_ecommerce/vxjypvbfyjx6enae2kwo.jpg','kvil_ecommerce/vxjypvbfyjx6enae2kwo',0,'2026-04-17 13:06:30','2026-04-17 13:06:30'),(115,63,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431189/kvil_ecommerce/hcomjmikso7mvfoubxxu.jpg','kvil_ecommerce/hcomjmikso7mvfoubxxu',0,'2026-04-17 13:06:30','2026-04-17 13:06:30'),(116,64,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431234/kvil_ecommerce/ybgbvkrqwknryxvoxmaf.jpg','kvil_ecommerce/ybgbvkrqwknryxvoxmaf',1,'2026-04-17 13:07:16','2026-04-17 13:07:16'),(117,64,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431234/kvil_ecommerce/p60kkhn9ymykath6v96g.jpg','kvil_ecommerce/p60kkhn9ymykath6v96g',0,'2026-04-17 13:07:16','2026-04-17 13:07:16'),(118,64,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431234/kvil_ecommerce/hqjxa4m3g8u5lcvqpsgi.jpg','kvil_ecommerce/hqjxa4m3g8u5lcvqpsgi',0,'2026-04-17 13:07:16','2026-04-17 13:07:16'),(119,65,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431284/kvil_ecommerce/pbcnuzjz9eja6p7blihl.jpg','kvil_ecommerce/pbcnuzjz9eja6p7blihl',1,'2026-04-17 13:08:04','2026-04-17 13:08:04'),(120,66,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431332/kvil_ecommerce/ytx1kbzylts2bzoh3ejs.jpg','kvil_ecommerce/ytx1kbzylts2bzoh3ejs',1,'2026-04-17 13:08:53','2026-04-17 13:08:53'),(121,66,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431332/kvil_ecommerce/q9tbukloazjkgkenjswp.jpg','kvil_ecommerce/q9tbukloazjkgkenjswp',0,'2026-04-17 13:08:53','2026-04-17 13:08:53'),(122,66,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431332/kvil_ecommerce/ythfil0jmenitobo1lrl.jpg','kvil_ecommerce/ythfil0jmenitobo1lrl',0,'2026-04-17 13:08:53','2026-04-17 13:08:53'),(123,67,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431402/kvil_ecommerce/loudqiggewisfszk0ilv.jpg','kvil_ecommerce/loudqiggewisfszk0ilv',1,'2026-04-17 13:10:03','2026-04-17 13:10:03'),(124,67,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431402/kvil_ecommerce/hdkk6mdyrocargtpdvx4.jpg','kvil_ecommerce/hdkk6mdyrocargtpdvx4',0,'2026-04-17 13:10:03','2026-04-17 13:10:03'),(125,67,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431402/kvil_ecommerce/qulkmespwb627bapluvy.jpg','kvil_ecommerce/qulkmespwb627bapluvy',0,'2026-04-17 13:10:03','2026-04-17 13:10:03'),(126,68,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431459/kvil_ecommerce/drt35jmataszv0hbdqs4.jpg','kvil_ecommerce/drt35jmataszv0hbdqs4',1,'2026-04-17 13:11:00','2026-04-17 13:11:00'),(127,68,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431459/kvil_ecommerce/svagvbfmvn15cqtghehh.jpg','kvil_ecommerce/svagvbfmvn15cqtghehh',0,'2026-04-17 13:11:00','2026-04-17 13:11:00'),(128,68,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431459/kvil_ecommerce/a7hzzz0eyqcws8bzzakl.jpg','kvil_ecommerce/a7hzzz0eyqcws8bzzakl',0,'2026-04-17 13:11:00','2026-04-17 13:11:00'),(129,69,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431522/kvil_ecommerce/qyu3kzmx0pl3kaauhy5i.jpg','kvil_ecommerce/qyu3kzmx0pl3kaauhy5i',1,'2026-04-17 13:12:03','2026-04-17 13:12:03'),(130,69,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431522/kvil_ecommerce/b8tivjigdx9ei0fb3gge.jpg','kvil_ecommerce/b8tivjigdx9ei0fb3gge',0,'2026-04-17 13:12:03','2026-04-17 13:12:03'),(131,69,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431522/kvil_ecommerce/g93lwjf9t4utah5ukzew.jpg','kvil_ecommerce/g93lwjf9t4utah5ukzew',0,'2026-04-17 13:12:03','2026-04-17 13:12:03'),(132,70,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431574/kvil_ecommerce/d5v61379jzjcrrkax3lj.jpg','kvil_ecommerce/d5v61379jzjcrrkax3lj',1,'2026-04-17 13:12:56','2026-04-17 13:12:56'),(133,70,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776431575/kvil_ecommerce/cvo4kgraummvroxexdhs.jpg','kvil_ecommerce/cvo4kgraummvroxexdhs',0,'2026-04-17 13:12:56','2026-04-17 13:12:56'),(134,71,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528224/kvil_ecommerce/krzs2umrucsej9qmqylk.jpg','kvil_ecommerce/krzs2umrucsej9qmqylk',1,'2026-04-18 16:03:45','2026-04-18 16:03:45'),(135,71,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528224/kvil_ecommerce/mjg08olkvn5jnjzcfwmp.jpg','kvil_ecommerce/mjg08olkvn5jnjzcfwmp',0,'2026-04-18 16:03:45','2026-04-18 16:03:45'),(136,72,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528360/kvil_ecommerce/dr2lw4vyyjsmoz7oytfx.jpg','kvil_ecommerce/dr2lw4vyyjsmoz7oytfx',1,'2026-04-18 16:06:02','2026-04-18 16:06:02'),(137,72,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528360/kvil_ecommerce/uzrbzwaced0jkd086ky6.jpg','kvil_ecommerce/uzrbzwaced0jkd086ky6',0,'2026-04-18 16:06:02','2026-04-18 16:06:02'),(138,72,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528360/kvil_ecommerce/sghd3zbtbi5qmhmg4ba2.jpg','kvil_ecommerce/sghd3zbtbi5qmhmg4ba2',0,'2026-04-18 16:06:02','2026-04-18 16:06:02'),(139,72,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528361/kvil_ecommerce/mtonzduj3elwz77qk72q.jpg','kvil_ecommerce/mtonzduj3elwz77qk72q',0,'2026-04-18 16:06:02','2026-04-18 16:06:02'),(140,73,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528653/kvil_ecommerce/ikzzau7pvtv6tsmsaqef.jpg','kvil_ecommerce/ikzzau7pvtv6tsmsaqef',1,'2026-04-18 16:10:54','2026-04-18 16:10:54'),(141,73,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528654/kvil_ecommerce/fdv5g7rf5eveqefzg6a1.jpg','kvil_ecommerce/fdv5g7rf5eveqefzg6a1',0,'2026-04-18 16:10:54','2026-04-18 16:10:54'),(142,73,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528654/kvil_ecommerce/e9jn9j3jchh45ata43sh.jpg','kvil_ecommerce/e9jn9j3jchh45ata43sh',0,'2026-04-18 16:10:54','2026-04-18 16:10:54'),(143,74,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528721/kvil_ecommerce/dlpzvhjieeksouqpcqrl.jpg','kvil_ecommerce/dlpzvhjieeksouqpcqrl',1,'2026-04-18 16:12:03','2026-04-18 16:12:03'),(144,74,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528721/kvil_ecommerce/vzin1wgaiklfmdgihmqb.jpg','kvil_ecommerce/vzin1wgaiklfmdgihmqb',0,'2026-04-18 16:12:03','2026-04-18 16:12:03'),(145,74,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528722/kvil_ecommerce/lqsbm5bzyadexmx9pfwp.jpg','kvil_ecommerce/lqsbm5bzyadexmx9pfwp',0,'2026-04-18 16:12:03','2026-04-18 16:12:03'),(146,75,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528779/kvil_ecommerce/qygzbimq7wf4lfp3y425.jpg','kvil_ecommerce/qygzbimq7wf4lfp3y425',1,'2026-04-18 16:13:02','2026-04-18 16:13:02'),(147,75,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528780/kvil_ecommerce/dnlavdiwbdmszypes1nb.jpg','kvil_ecommerce/dnlavdiwbdmszypes1nb',0,'2026-04-18 16:13:02','2026-04-18 16:13:02'),(148,75,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528781/kvil_ecommerce/botsmcwvtk7dlasxizxo.jpg','kvil_ecommerce/botsmcwvtk7dlasxizxo',0,'2026-04-18 16:13:02','2026-04-18 16:13:02'),(149,76,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528843/kvil_ecommerce/sricvipmknnybixixf9a.jpg','kvil_ecommerce/sricvipmknnybixixf9a',1,'2026-04-18 16:14:04','2026-04-18 16:14:04'),(150,76,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776528843/kvil_ecommerce/tal54ll6gwkcxehp5uay.jpg','kvil_ecommerce/tal54ll6gwkcxehp5uay',0,'2026-04-18 16:14:04','2026-04-18 16:14:04'),(151,77,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529168/kvil_ecommerce/ainb1kad25qnkuosfffy.jpg','kvil_ecommerce/ainb1kad25qnkuosfffy',1,'2026-04-18 16:19:30','2026-04-18 16:19:30'),(152,77,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529169/kvil_ecommerce/ub1njnmpwzkmedvgqpo8.jpg','kvil_ecommerce/ub1njnmpwzkmedvgqpo8',0,'2026-04-18 16:19:30','2026-04-18 16:19:30'),(153,77,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529169/kvil_ecommerce/jdqzckejueh2vxq6mb10.jpg','kvil_ecommerce/jdqzckejueh2vxq6mb10',0,'2026-04-18 16:19:30','2026-04-18 16:19:30'),(154,78,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529292/kvil_ecommerce/tq8jz0osacp091wzayr7.jpg','kvil_ecommerce/tq8jz0osacp091wzayr7',1,'2026-04-18 16:21:33','2026-04-18 16:21:33'),(155,78,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529292/kvil_ecommerce/appev9ja2oqfa3ylfk3s.jpg','kvil_ecommerce/appev9ja2oqfa3ylfk3s',0,'2026-04-18 16:21:33','2026-04-18 16:21:33'),(156,79,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529356/kvil_ecommerce/jirgsypksi73ryeke0rf.jpg','kvil_ecommerce/jirgsypksi73ryeke0rf',1,'2026-04-18 16:22:37','2026-04-18 16:22:37'),(157,79,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529356/kvil_ecommerce/myhcf923pcdpjebguzox.jpg','kvil_ecommerce/myhcf923pcdpjebguzox',0,'2026-04-18 16:22:37','2026-04-18 16:22:37'),(158,80,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529427/kvil_ecommerce/ad5fdsrnfffxruxchbgt.jpg','kvil_ecommerce/ad5fdsrnfffxruxchbgt',1,'2026-04-18 16:23:48','2026-04-18 16:23:48'),(159,80,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529427/kvil_ecommerce/s6ktrpf0sdwj32qgn3jd.jpg','kvil_ecommerce/s6ktrpf0sdwj32qgn3jd',0,'2026-04-18 16:23:48','2026-04-18 16:23:48'),(160,81,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529478/kvil_ecommerce/rbhkze1tjemav6hvlcfl.jpg','kvil_ecommerce/rbhkze1tjemav6hvlcfl',1,'2026-04-18 16:24:40','2026-04-18 16:24:40'),(161,81,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529479/kvil_ecommerce/m5ixssoouxeupqvp3zzj.jpg','kvil_ecommerce/m5ixssoouxeupqvp3zzj',0,'2026-04-18 16:24:40','2026-04-18 16:24:40'),(162,81,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529479/kvil_ecommerce/ma7jv0wqossya6xu2w1v.jpg','kvil_ecommerce/ma7jv0wqossya6xu2w1v',0,'2026-04-18 16:24:40','2026-04-18 16:24:40'),(163,82,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529747/kvil_ecommerce/zgztzua41xkgcqevjbsm.jpg','kvil_ecommerce/zgztzua41xkgcqevjbsm',1,'2026-04-18 16:29:08','2026-04-18 16:29:08'),(164,82,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529747/kvil_ecommerce/yh9oxozet59vv6x3mroe.jpg','kvil_ecommerce/yh9oxozet59vv6x3mroe',0,'2026-04-18 16:29:08','2026-04-18 16:29:08'),(165,83,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529804/kvil_ecommerce/jvul7tgfrunpopdjx0jw.jpg','kvil_ecommerce/jvul7tgfrunpopdjx0jw',1,'2026-04-18 16:30:05','2026-04-18 16:30:05'),(166,83,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529804/kvil_ecommerce/bgnomvowd5cwqzdd2i2v.jpg','kvil_ecommerce/bgnomvowd5cwqzdd2i2v',0,'2026-04-18 16:30:05','2026-04-18 16:30:05'),(167,84,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529856/kvil_ecommerce/yd8aopy4d0ixafkpypt9.jpg','kvil_ecommerce/yd8aopy4d0ixafkpypt9',1,'2026-04-18 16:30:58','2026-04-18 16:30:58'),(168,84,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529857/kvil_ecommerce/tq3tugjvmopjerxbbcgb.jpg','kvil_ecommerce/tq3tugjvmopjerxbbcgb',0,'2026-04-18 16:30:58','2026-04-18 16:30:58'),(169,84,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529858/kvil_ecommerce/hq9ra4ajz36jpdv3cipu.jpg','kvil_ecommerce/hq9ra4ajz36jpdv3cipu',0,'2026-04-18 16:30:58','2026-04-18 16:30:58'),(170,85,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529899/kvil_ecommerce/c7ct0x7ggxwxrdlirwxx.jpg','kvil_ecommerce/c7ct0x7ggxwxrdlirwxx',1,'2026-04-18 16:31:40','2026-04-18 16:31:40'),(171,85,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529899/kvil_ecommerce/lnermnzcsxmybp6jgicb.jpg','kvil_ecommerce/lnermnzcsxmybp6jgicb',0,'2026-04-18 16:31:40','2026-04-18 16:31:40'),(172,86,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529956/kvil_ecommerce/qipeo1sxzopszsudsker.jpg','kvil_ecommerce/qipeo1sxzopszsudsker',1,'2026-04-18 16:32:38','2026-04-18 16:32:38'),(173,86,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776529957/kvil_ecommerce/uokb36cjor2d7v56wsos.jpg','kvil_ecommerce/uokb36cjor2d7v56wsos',0,'2026-04-18 16:32:38','2026-04-18 16:32:38'),(174,87,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776530010/kvil_ecommerce/usyx9ydrnlsckln9gduo.jpg','kvil_ecommerce/usyx9ydrnlsckln9gduo',1,'2026-04-18 16:33:33','2026-04-18 16:33:33'),(175,87,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776530011/kvil_ecommerce/arcown3ldn514zavwoh3.jpg','kvil_ecommerce/arcown3ldn514zavwoh3',0,'2026-04-18 16:33:33','2026-04-18 16:33:33'),(176,87,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776530012/kvil_ecommerce/lujeizkvr8k6blvug4uu.jpg','kvil_ecommerce/lujeizkvr8k6blvug4uu',0,'2026-04-18 16:33:33','2026-04-18 16:33:33'),(177,88,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776530950/kvil_ecommerce/am9kpivedb3q1aiwtffb.jpg','kvil_ecommerce/am9kpivedb3q1aiwtffb',1,'2026-04-18 16:49:12','2026-04-18 16:49:12'),(178,88,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776530951/kvil_ecommerce/tayermi6fv2j46rxgrhm.jpg','kvil_ecommerce/tayermi6fv2j46rxgrhm',0,'2026-04-18 16:49:12','2026-04-18 16:49:12'),(179,89,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776531014/kvil_ecommerce/ykejoz18jfpgoewhsyzy.jpg','kvil_ecommerce/ykejoz18jfpgoewhsyzy',1,'2026-04-18 16:50:14','2026-04-18 16:50:14'),(180,89,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776531014/kvil_ecommerce/coexhzklhj6c8ftbvjpd.jpg','kvil_ecommerce/coexhzklhj6c8ftbvjpd',0,'2026-04-18 16:50:14','2026-04-18 16:50:14'),(181,90,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776531126/kvil_ecommerce/dsv7hnbhysb1uc3kvhj8.jpg','kvil_ecommerce/dsv7hnbhysb1uc3kvhj8',1,'2026-04-18 16:52:07','2026-04-18 16:52:07'),(182,91,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776531179/kvil_ecommerce/ir5lop8tgygwwj5hs8iy.jpg','kvil_ecommerce/ir5lop8tgygwwj5hs8iy',1,'2026-04-18 16:53:01','2026-04-18 16:53:01'),(183,91,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776531180/kvil_ecommerce/zhxuymoqbwpdxhy1soq3.jpg','kvil_ecommerce/zhxuymoqbwpdxhy1soq3',0,'2026-04-18 16:53:01','2026-04-18 16:53:01'),(184,16,'https://res.cloudinary.com/dnj77wstm/image/upload/v1776653327/kvil_ecommerce/ciqkeajrjlexowlzybt3.jpg','kvil_ecommerce/ciqkeajrjlexowlzybt3',1,'2026-04-20 02:48:48','2026-04-20 02:48:48');
/*!40000 ALTER TABLE `ProductImages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductVariants`
--

DROP TABLE IF EXISTS `ProductVariants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductVariants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductVariants`
--

LOCK TABLES `ProductVariants` WRITE;
/*!40000 ALTER TABLE `ProductVariants` DISABLE KEYS */;
INSERT INTO `ProductVariants` VALUES (1,1,'S','Đen',18,1110000,'2026-03-04 16:22:51','2026-03-07 06:45:46','1-1'),(2,11,'S','Đen',198,150000,'2026-03-18 13:15:43','2026-03-18 13:17:03','11-1'),(3,7,'S','Đen',200,30000000,'2026-03-18 13:19:30','2026-04-19 05:51:54','7-1'),(4,11,'XL','Trắng',200,350000,'2026-03-18 14:14:13','2026-03-18 14:14:13','11-2'),(5,19,'S','Đỏ',100,1024000,'2026-04-17 10:20:23','2026-04-17 10:20:23','19-1'),(6,1,'M','Đen',19,1110000,'2026-04-20 02:47:42','2026-04-20 02:47:42','SKU: 3310076A'),(7,1,'L','Đen',10,1110000,'2026-04-20 02:48:03','2026-04-20 02:48:03','SKU: 3310076A'),(8,16,'S','Xám',19,500000,'2026-04-20 02:49:38','2026-04-20 02:49:38','SKU: 5500413 -4-1'),(9,16,'M','Xám',10,500000,'2026-04-20 02:49:58','2026-04-20 02:49:58','SKU: 5500413 -4-2'),(10,16,'L','Xám',30,500000,'2026-04-20 02:50:13','2026-04-20 02:50:13','SKU: 5500413 -4-3'),(11,17,'S','Trắng',11,500000,'2026-04-20 02:51:39','2026-04-20 02:51:39','SKU: 5500413 -3-1'),(12,17,'M','Trắng',17,500000,'2026-04-20 02:52:05','2026-04-20 02:52:05','SKU: 5500413 -3-2'),(13,17,'L','Trắng',31,500000,'2026-04-20 02:52:30','2026-04-20 02:52:30','SKU: 5500413 -3-3'),(14,18,'S','ghi',11,500000,'2026-04-20 02:53:36','2026-04-20 02:53:36','SKU: 5500413 -2-1'),(15,18,'M','ghi',14,500000,'2026-04-20 02:53:55','2026-04-20 02:53:55','SKU: 5500413 -2-2'),(16,18,'L','ghi',19,500000,'2026-04-20 02:54:09','2026-04-20 02:54:09','SKU: 5500413 -2-3'),(17,20,'S','Hồng sọc trắng',10,1050000,'2026-04-20 02:56:35','2026-04-20 02:56:35','SKU: 3430128'),(18,20,'M','Hồng sọc trắng',13,1050000,'2026-04-20 02:56:47','2026-04-20 02:56:47','SKU: 3430128'),(19,20,'L','Hồng sọc trắng',40,1050000,'2026-04-20 02:57:04','2026-04-20 02:57:04','SKU: 3430128');
/*!40000 ALTER TABLE `ProductVariants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `basePrice` decimal(10,0) DEFAULT NULL,
  `discountPercent` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,5,'Áo khoác ngắn 3310076A','Áo khoác dáng ngắn vải tweed kết hợp cùng chân váy ôm cùng chất tạo nét quyến rũ và nữ tính cho các quý cô công sở khi gió mùa về. Sản phẩm được thiết kế độc quyền bởi thương hiệu KO-ISAN.',1110000,56,'2026-03-04 15:47:19','2026-03-04 15:47:19',NULL),(2,1,'Áo dài','Áo khoác dáng ngắn vải tweed kết hợp cùng chân váy ôm cùng chất tạo nét quyến rũ và nữ tính cho các quý cô công sở khi gió mùa về. Sản phẩm được thiết kế độc quyền bởi thương hiệu KO-ISAN.',1110000,56,'2026-03-04 15:50:52','2026-03-05 09:51:33','2026-03-05 09:51:33'),(3,8,'Đầm 2 dây trễ vai','- Chất liệu: Voan\n- Kiểu dáng: Đầm 2 dây trễ vai\n- Màu sắc: \" in họa tiết hoa hồng',705000,60,'2026-03-05 06:19:24','2026-04-17 13:02:27','2026-04-17 13:02:27'),(4,4,'áo khoác da nam ','- Chất liệu: Voan\n- Kiểu dáng: Đầm 2 dây trễ vai\n- Màu sắc: \" in họa tiết hoa hồng',600000,30,'2026-03-16 13:08:20','2026-04-17 10:44:12','2026-04-17 10:44:12'),(5,4,'áo da disquared  ','- Chất liệu: da \n- Kiểu dáng: nam người cao\n- Màu sắc: \" in họa tiết đại bàng',1000000,30,'2026-03-16 13:20:43','2026-04-17 10:44:21','2026-04-17 10:44:21'),(6,4,'áo da louisvulton  ','- Chất liệu: da \n- Kiểu dáng: nam người cao\n- Màu sắc: \" in họa tiết đại bàng',1500000,15,'2026-03-16 13:21:15','2026-04-17 10:44:14','2026-04-17 10:44:14'),(7,4,'áo da owen','- Chất liệu: da \n- Kiểu dáng: nam người cao\n- Màu sắc: \" in họa tiết phi cầm',30000000,15,'2026-03-16 13:21:55','2026-04-17 10:44:19','2026-04-17 10:44:19'),(8,4,'áo da cá sấu','- Chất liệu: da \n- Kiểu dáng: nam người cao\n- Màu sắc: đen',3000000,15,'2026-03-16 13:23:50','2026-04-17 10:44:17','2026-04-17 10:44:17'),(9,5,'váy dạ hội','- Chất liệu: vải mỏng \n- Kiểu dáng: nữ trung bình\n- Màu sắc: trắng',300000,10,'2026-03-16 13:24:42','2026-04-17 12:57:16','2026-04-17 12:57:16'),(10,8,'đầm kiêu sa','- Chất liệu: vải mỏng \n- Kiểu dáng: nữ trung bình\n- Màu sắc: trắng',300000,10,'2026-03-16 13:26:58','2026-04-17 13:02:25','2026-04-17 13:02:25'),(11,7,'quần đùi ','- Chất liệu: vải \n- Kiểu dáng: nam\n- Màu sắc: đen',150000,5,'2026-03-16 13:27:38','2026-04-18 15:12:06','2026-04-18 15:12:06'),(12,7,'quần kaki','- Chất liệu: vải \n- Kiểu dáng: nam\n- Màu sắc: đen',500000,10,'2026-03-16 13:28:02','2026-04-18 15:12:11','2026-04-18 15:12:11'),(13,7,'quần short','- Chất liệu: vải \n- Kiểu dáng: nam\n- Màu sắc: đen',400000,15,'2026-03-16 13:28:18','2026-04-18 15:12:16','2026-04-18 15:12:16'),(14,7,'quần short cao cấp','- Chất liệu: vải \n- Kiểu dáng: nam\n- Màu sắc: đen',800000,10,'2026-03-16 13:28:35','2026-04-18 15:12:20','2026-04-18 15:12:20'),(15,7,'quần short secondhand','- Chất liệu: vải \n- Kiểu dáng: nam\n- Màu sắc: đen',500000,60,'2026-03-16 13:28:54','2026-04-18 15:12:51','2026-04-18 15:12:51'),(16,7,'Quần :5500413 -4','- Chất liệu: Tech\n- Kiểu dáng: quần short\n- Màu sắc: ghi xám',500000,50,'2026-04-17 09:28:44','2026-04-17 09:28:44',NULL),(17,7,'Quần :5500413 -3','- Chất liệu: Tech\n- Kiểu dáng: quần short\n- Màu sắc: ghi sáng',500000,50,'2026-04-17 09:31:34','2026-04-17 09:31:34',NULL),(18,7,'Quần :5500413 -2','- Chất liệu: Tech\n- Kiểu dáng: quần short\n- Màu sắc: ghi xám',500000,50,'2026-04-17 10:10:55','2026-04-17 10:10:55',NULL),(19,8,'Đầm ôm dài 20057201-1',' Chất liệu: Umi\n- Kiểu dáng: đầm ôm\n- Màu sắc: hồng',1024000,65,'2026-04-17 10:18:31','2026-04-17 13:02:30','2026-04-17 13:02:30'),(20,3,'Bolero 3430128','Blazer kiểu phối 2 màu trắng hồng, dáng suông mang đến cho các quý cô nét khác biệt về phong cách.',1050000,65,'2026-04-17 10:33:21','2026-04-17 10:33:21',NULL),(21,3,'ÁO VEST ĐỎ HAI HÀNG CÚC 3160037','Áo vest đỏ hai hàng cúc, cổ bẻ ve, túi chéo, dài tay. Dáng áo cổ điển, nữ tính.',1180000,0,'2026-04-17 10:34:31','2026-04-17 10:34:31',NULL),(22,3,'Áo vest dài tay 3430177','',1200000,60,'2026-04-17 10:35:24','2026-04-17 10:35:24',NULL),(23,3,'Áo blazer 320018-5','- Chất liệu: Tuytsi\n- Kiểu dáng: Áo khoác blazer\n- Màu sắc: đen navy',1300000,72,'2026-04-17 10:37:14','2026-04-17 10:37:14',NULL),(24,3,'Áo vest dài tay 3410064','Mỗi kiểu dáng #áo vest đều mang nét thanh lịch chuẩn công sở, tuy nhiên chúng cũng tạo cho người mặc những phong cách hoàn toàn khác nhau. Với bạn gái sành thời trang luôn biết chọn cho mình những set đồ ăn ý và cách kết hợp đúng gu. \n\n𝐁𝐞 𝐚𝐭𝐭𝐫𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐢𝐤𝐞 𝐚 𝐐𝐮𝐞𝐞𝐧\nMột thiết kế chứa đựng cả sự mềm mại lẫn nét tự tin hấp dẫn của người phụ nữ trưởng thành thật sự không cần phải tìm kiếm khi bạn đã khoác trên mình một trong những sản phẩm best seller được yêu thích nhất tại KO ISAN\n\nDễ dàng kết hợp tùy tình huống mà vẫn có tính thời trang cao, đây sẽ là một must have item của bạn trong năm nay.',1280000,0,'2026-04-17 10:39:11','2026-04-17 10:39:11',NULL),(25,3,'Áo vest xanh coban 310223-1','Áo vest xanh coban',1000000,60,'2026-04-17 10:40:14','2026-04-17 10:40:14',NULL),(26,3,'Áo vest không cúc 3410242-2','ÁO VEST ĐỎ',1200000,60,'2026-04-17 10:40:54','2026-04-17 10:41:33',NULL),(27,3,'Áo khoác 3500371-2',' Chất liệu: tweed\n- Kiểu dáng: áo ôm eo\n- Màu sắc: ghi đá',1110000,41,'2026-04-17 10:43:43','2026-04-17 10:43:43',NULL),(28,4,'Áo khoác dạ 3300665-5','- Chất liệu: vải dạ\n- Kiểu dáng: Áo khoác dạ dáng dài\n- Màu sắc: ghi sáng',1610000,57,'2026-04-17 10:47:10','2026-04-17 10:47:10',NULL),(29,4,'Áo khoác dạ 3300663-3','- Chất liệu: Dạ\n- Kiểu dáng: Áo khoác dạ dáng dài\n- Màu sắc: xám',1610000,57,'2026-04-17 10:48:26','2026-04-17 10:48:26',NULL),(30,4,'Áo khoác dạ 3300328-3',' Chất liệu: Dạ\n- Kiểu dáng: Áo khoác dạ dáng dài\n- Màu sắc: ghi sáng',1610000,57,'2026-04-17 10:49:20','2026-04-17 10:49:20',NULL),(31,4,'Áo khoác dạ 3300663-4','- Chất liệu: Dạ\n- Kiểu dáng: Áo khoác dạ dáng dài\n- Màu sắc: đen',1610000,57,'2026-04-17 10:50:09','2026-04-17 10:50:09',NULL),(32,4,' Áo dạ dài 330058','Áo dạ dáng dài',1610000,63,'2026-04-17 10:50:59','2026-04-17 10:50:59',NULL),(33,4,'ÁO KHOÁC DÀI DÁNG DÀI','Áo khoác dạ dáng dài cài 1 cúc màu hồng đất sành điệu giúp tôn dáng cho người mặc. Phần cổ cách điệu không ve tạo sự mới mẻ trẻ trung cho sản phẩm. Phù hợp với thời trang dạo phố đây là sản phẩm thiết kế độc quyền bởi thương hiệu KO-ISAN.',2050000,27,'2026-04-17 10:51:51','2026-04-17 10:51:51',NULL),(34,14,'Áo sơ mi 20081004 - Chân váy 21054108','Chất liệu: Thô\n Kiểu dáng: Áo\n Màu sắc: Trắng\n',515000,60,'2026-04-17 10:54:05','2026-04-17 10:54:05',NULL),(35,14,'Áo sơ mi 60439 - quần suông 2 ly 21055307','- Chất liệu: Lụa\n- Kiểu dáng: áo sơ mi\n- Màu sắc: trắng',515000,60,'2026-04-17 10:55:01','2026-04-17 10:55:01',NULL),(36,14,'Áo sơ mi : 220017-3','- Chất liệu: áo sơ mi : lụa\n- Kiểu dáng: Áo sơ mi dáng suông\n- Màu sắc: Hồng',565000,58,'2026-04-17 10:56:16','2026-04-17 10:56:16',NULL),(37,14,'Áo sơ mi : 220017-2','- Chất liệu: áo sơ mi : lụa\n- Kiểu dáng: Áo sơ mi dáng suông\n- Màu sắc: Xanh',565000,58,'2026-04-17 10:57:23','2026-04-17 10:57:32',NULL),(38,14,'Áo sơ mi 2500360 Quần 520046-6','- Chất liệu: Áo sơ mi thô kẻ + Quần Tuytsi\n- Kiểu dáng: Áo sơ mi suông phối màu + Quần\n- Màu sắc: Áo kẻ đen trắng + Quần ghi',565000,58,'2026-04-17 10:59:45','2026-04-17 10:59:45',NULL),(39,14,'Áo chinfon kiểu 2450022-1','Áo sơ mi họa tiết hoa xanh, tay lỡ bèo, cổ đức viền màu phối trẻ trung. Dáng áo xuông. ',505000,83,'2026-04-17 11:01:10','2026-04-17 11:01:10',NULL),(40,9,'Đầm ôm dài 20057201-3','- Chất liệu: Umi\n- Kiểu dáng: đầm ôm\n- Màu sắc: ghi',1024000,65,'2026-04-17 12:39:56','2026-04-17 12:39:56',NULL),(41,9,'Đầm suông dài 620031-1','- Chất liệu: gấm\n- Kiểu dáng: suông\n- Màu sắc: hồng pastel',715000,50,'2026-04-17 12:42:04','2026-04-17 12:42:04',NULL),(42,9,'Đầm xòe cổ vuông tay bồng 20056601-4','- Chất liệu: Gấm\n- Kiểu dáng: đầm xòe\n- Màu sắc: Đen phối nude',1210000,70,'2026-04-17 12:43:33','2026-04-17 12:43:33',NULL),(43,9,'Đầm dạ hội nhung 21057208','- Chất liệu: Nhung\n- Kiểu dáng: đầm xòe\n- Màu sắc: đỏ đô',1200000,74,'2026-04-17 12:44:48','2026-04-17 12:44:48',NULL),(44,9,'Đầm gấm hai dây',' Chất liệu: vải gấm\n- Kiểu dáng: Váy hai dây, chiết eo và chân váy xòe A. Điểm nhấn phần ngực cong hình trăng khuyết\n- Màu sắc: Nude\n\n',549000,49,'2026-04-17 12:45:46','2026-04-17 12:45:46',NULL),(45,9,'Đầm tay bồng đính ngọc trai 6660390','- Chất liệu: vải gấm\n- Kiểu dáng: Tay ngắn bồng, Váy ngắn trên gối\n- Màu sắc: Tím\n\n',479000,38,'2026-04-17 12:47:08','2026-04-17 12:47:08',NULL),(46,10,'Bộ Jum đen','',575000,43,'2026-04-17 12:48:38','2026-04-17 12:48:38',NULL),(47,10,'Peplum xanh','',503000,30,'2026-04-17 12:49:10','2026-04-17 12:49:10',NULL),(48,1,'Áo dài cách tân 21052001-1','- Chất liệu: Chiffon\n- Kiểu dáng: Áo Dài\n- Màu sắc: \" hoa nền trắng',1120000,68,'2026-04-17 12:50:24','2026-04-17 12:50:24',NULL),(49,1,'Áo dài cách tân 21052002-2','- Chất liệu: Chiffon\n- Kiểu dáng: Áo Dài\n- Màu sắc: \" hoa hồng',1120000,68,'2026-04-17 12:51:22','2026-04-17 12:51:22',NULL),(50,1,'Áo dài 21051020-2','- Chất liệu: Lụa\n- Kiểu dáng: áo dài\n- Màu sắc: Xanh',1120000,68,'2026-04-17 12:52:19','2026-04-17 12:52:19',NULL),(51,1,'Áo dài cách tân 20021007','- Chất liệu: lụa hoa chân\n- Kiểu dáng: áo dài\n- Màu sắc: đỏ',772000,56,'2026-04-17 12:53:39','2026-04-17 12:53:39',NULL),(52,1,'Áo dài cách tân 20021018 - 2','- Chất liệu: nhung\n- Kiểu dáng: áo dài cách tân\n- Màu sắc: Xanh',707000,55,'2026-04-17 12:54:17','2026-04-17 12:54:17',NULL),(53,1,'Áo dài cách tân 20021019-2','- Chất liệu: nhung\n- Kiểu dáng: áo dài cách tân\n- Màu sắc: đỏ đô',707000,55,'2026-04-17 12:55:17','2026-04-17 12:55:17',NULL),(54,1,'Áo dài cách tân 20021008-1','',722000,50,'2026-04-17 12:56:34','2026-04-17 12:56:34',NULL),(55,5,'Áo khoác tweed 3500371-1','- Chất liệu: Dạ Tweed\n- Kiểu dáng: Áo khoác Tweed suông dáng ngắn\n- Màu sắc: Tweed hồng',1110000,50,'2026-04-17 12:58:25','2026-04-17 12:58:25',NULL),(56,5,'Áo khoác 3500355-1','- Chất liệu: Da lộn\n- Kiểu dáng: Áo Khoác tay lỡ\n- Màu sắc: cam',1310000,50,'2026-04-17 12:59:06','2026-04-17 12:59:06',NULL),(57,5,'Áo khoác ngắn','Sét bộ vest vải tweed màu sắc, dài tay cổ tròn. Chân váy A trẻ trung .',1350000,64,'2026-04-17 12:59:51','2026-04-17 12:59:51',NULL),(58,5,'Áo dạ 3610025','Áo khoác lửng có đai, điểm nhấn túi ốp 2 bên tạo sự trẻ trung. Áo phù hợp với thời trang công sở hoặc dạo phố. Sản phẩm được thiết kế độc quyền bởi thương hiệu KO-ISAN.',1050000,44,'2026-04-17 13:01:28','2026-04-17 13:01:28',NULL),(59,8,'Đầm maxi đi biển dây vai đan chéo xếp 4 tầng bèo','Đầm maxi đi biển dây vai đan chéo xếp 4 tầng bèo S2382022',612000,36,'2026-04-17 13:02:57','2026-04-17 13:02:57',NULL),(60,8,'Đầm yếm vạt chéo đuôi cá KOISAN S2382009','',612000,40,'2026-04-17 13:03:36','2026-04-17 13:03:36',NULL),(61,8,'Đầm maxi đi biển trễ vai S2382008','Đầm maxi trễ vai lớp bèo mềm mại tinh tế tạo nét quyến rũ. Phần gấu đầm tạo kiểu đuôi cá tinh tế tôn dáng người mặc. Họa tiết hoa vàng nhẹ nhàng, xinh xắn. Chất liệu tơ mềm, rủ phù hợp khi đi dạo biển .',612000,40,'2026-04-17 13:04:16','2026-04-17 13:04:16',NULL),(62,8,'Đầm yếm đắp hoa nổi 3D S2382021 \"','Đầm yếm xòe nhẹ dài qua bắp chân tôn dáng Chất liệu lưới đắp hoa nổi 3D cao cấp cùng với tone màu kem nhẹ nhàng phù hợp cho bữa tiệc nhẹ trên biển.',612000,40,'2026-04-17 13:05:11','2026-04-17 13:05:11',NULL),(63,8,'Đầm maxi đi biển 2 dây','Đầm maxi cổ lục lăng tinh tế, phần ngực xếp 2 lớp bèo tạo kiểu mềm mại quyễn rũ. Chất liệu voan mềm in họa tiết hoa nhí xinh xắn phù hợp đi dạo biển.',612000,40,'2026-04-17 13:06:06','2026-04-17 13:06:06',NULL),(64,8,'Đầm xòe nữ tay loa S2382019','Đầm xòe tay loa nữ tính. Chi tiết điểm nhấn cúp ngực tinh tế. Phần mép cụp kẹp bản bèo xếp ly nhỏ xinh. Chất liệu tơ nến tạo phom tôn dáng kết hợp sắc vàng mơ lãng mạn.',612000,40,'2026-04-17 13:06:49','2026-04-17 13:06:49',NULL),(65,8,'ĐẦM BODY - 610279','- Chất liệu: Tuytsi\n- Kiểu dáng:Đầm body\n- Màu sắc: Cam cháy',499000,40,'2026-04-17 13:07:52','2026-04-17 13:07:52',NULL),(66,8,'  Đầm maxi - 21056507','- Chất liệu: Chiffon\n- Kiểu dáng: Đầm 2 dây\n- Màu sắc: Trắng',705000,63,'2026-04-17 13:08:30','2026-04-17 13:08:30',NULL),(67,6,'Chân váy - 4690108','- Chất liệu: Tuytsi\n- Kiểu dáng: Chân váy\n- Màu sắc:  Ghi sáng, Kẻ đen trắng\n\n',450000,44,'2026-04-17 13:09:53','2026-04-17 13:09:53',NULL),(68,6,'  Chân váy Midi - 20024402 ','- Chất liệu: Chiffon\n- Kiểu dáng: Chân váy\n- Màu sắc: Đen,Xanh navy, Xanh crom,Lam sẫm, Đỏ',600000,63,'2026-04-17 13:10:36','2026-04-17 13:10:36',NULL),(69,6,'Áo sơ mi 2500345-2 Chân váy 430693','- Chất liệu: Áo ( lụa ) CV (da lộn)\n- Kiểu dáng: Áo sơ mi - Chân váy xòe\n- Màu sắc: Nude - Nâu',515000,45,'2026-04-17 13:11:42','2026-04-17 13:11:42',NULL),(70,6,'Áo sơ mi 220044-2 - Chân váy 420067-2','- Chất liệu: áo sơ mi (lụa) Chân váy ( da lộn )\n- Kiểu dáng: áo sơ mi dáng suông - Chân váy ôm\n- Màu sắc: hồng - cam',515000,54,'2026-04-17 13:12:33','2026-04-17 13:12:33',NULL),(71,5,'Áo dạ dài 330328-2','- Chất liệu: Dạ\n- Kiểu dáng: Áo Mangto suông dài\n- Màu sắc: Xám lông chuột',1610000,57,'2026-04-18 16:03:14','2026-04-18 16:03:14',NULL),(72,5,'Áo dạ dài 330352-2','- Chất liệu: Dạ kẻ\n- Kiểu dáng: Áo Măngto suông dài\n- Màu sắc: Kẻ',1610000,57,'2026-04-18 16:05:16','2026-04-18 16:05:25',NULL),(73,5,'Áo dạ dài 330663-1','- Chất liệu: Dạ\n- Kiểu dáng: Áo khoác dạ mỏng dáng suông, tay lỡ\n- Màu sắc: Đen',1610000,57,'2026-04-18 16:10:35','2026-04-18 16:10:35',NULL),(74,5,'Áo khoác Da Lộn 3500355-3','- Chất liệu: Da lộn\n- Kiểu dáng: Áo Khoác tay lỡ\n- Màu sắc: Be',1310000,50,'2026-04-18 16:11:34','2026-04-18 16:11:34',NULL),(75,8,'Đầm cổ đá 620031-1','- Chất liệu: Gấm\n- Kiểu dáng: đầm suông\n- Màu sắc: Hồng\n\n',715000,50,'2026-04-18 16:12:32','2026-04-18 16:12:32',NULL),(76,8,'Đầm dạ hội nhung 21057207','- Chất liệu: Nhung\n- Kiểu dáng: đầm xòe\n- Màu sắc: đỏ đô',1200000,77,'2026-04-18 16:13:45','2026-04-18 16:13:45',NULL),(77,8,'Đầm dạ hội nhung 21056005','- Chất liệu: Nhung\n- Kiểu dáng: đầm ôm\n- Màu sắc: đen',1200000,74,'2026-04-18 16:18:52','2026-04-18 16:19:01',NULL),(78,8,'Đầm dạ hội nhung 21056618','- Chất liệu: Nhung\n- Kiểu dáng: Đầm xòe\n- Màu sắc: đen',1200000,74,'2026-04-18 16:21:13','2026-04-18 16:21:13',NULL),(79,8,'Đầm xòe 630630-2','- Chất liệu: lụa\n- Kiểu dáng: đầm xòe\n- Màu sắc: kẻ navy',695000,50,'2026-04-18 16:22:19','2026-04-18 16:22:19',NULL),(80,8,'Đầm ôm tay lửng 660475-1','- Chất liệu: tuytsi\n- Kiểu dáng: Đầm ôm tay lửng\n- Màu sắc: đỏ',695000,58,'2026-04-18 16:23:28','2026-04-18 16:23:28',NULL),(81,8,'Đầm suông 660456','- Chất liệu: umi\n- Kiểu dáng: đầm ôm\n- Màu sắc: đầm đen lé trắng',695000,50,'2026-04-18 16:24:15','2026-04-18 16:24:15',NULL),(82,7,'Quần thô co giãn nhẹ 30608','- Quần đỏ cam lửng ống sớ\n\n- Chất liệu:  Vải thô ',459000,24,'2026-04-18 16:28:23','2026-04-18 16:28:23',NULL),(83,15,'Áo cát mỏng A : 10269','- Kiểu dáng: Áo trắng hai dây cổ vắt chéo V\n\n- Chất liệu: Vải cát',309000,23,'2026-04-18 16:29:56','2026-04-18 16:29:56',NULL),(84,8,'Đầm xòe hai dây 500211','- Kiểu dáng: Đầm hai dây xòe qua gối, vạt lệch\n\n- Màu sắc: Nhiều đường nhiều màu sắc thiên hồng\n\n',569000,18,'2026-04-18 16:30:38','2026-04-18 16:30:38',NULL),(85,8,'Đầm hai dây trắng','- Kiểu dáng: Đầm hai dây trắng ngang gối. Điểm nhấn phần ngực nhún bèo\n\n- Màu sắc: Trắng\n\n- Vải Tuytsi',549000,18,'2026-04-18 16:31:19','2026-04-18 16:31:19',NULL),(86,8,'Đầm maxi hồng 500214','- Kiểu dáng: Đầm maxi cổ vắt chéo chữ V. Điểm nhấn hàng cúc chạy dài từ cổ đến chân váy\n\n- Màu sắc: Vân hồng\n\n- Vải chiffon',679000,40,'2026-04-18 16:32:14','2026-04-18 16:32:14',NULL),(87,8,'Đầm khoét nách chấm họa tiết tim 500286-1','- Kiểu dáng: Đầm maxi chiết eo đuôi cá xếp tầng. Cổ tàu tròn khoét nách. Điểm nhấn nơ hông.\n\n- Màu sắc: trắng chấm họa tiết tim đỏ\n\n- vải chiffon',699000,39,'2026-04-18 16:33:09','2026-04-18 16:33:09',NULL),(88,15,'Áo Blazer 3330650-1','- Chất liệu: Tuytsi\n- Kiểu dáng: Blazer dáng eo+ Quần côn ôm\n- Màu sắc: Ghi',1350000,33,'2026-04-18 16:48:55','2026-04-18 16:48:55',NULL),(89,15,'Bộ Áo Blazer 3330650-3','- Chất liệu: Tuytsi\n- Kiểu dáng: Blazer dáng suông+ Quần côn ôm\n- Màu sắc: Trắng kẻ',1350000,30,'2026-04-18 16:50:05','2026-04-18 16:50:05',NULL),(90,15,'Bộ Jile 33500341-4','- Chất liệu: Tuytsi\n- Kiểu dáng: Áo Gilê eo nhẹ + Quần short dáng rộng\n- Màu sắc: Đen',900000,49,'2026-04-18 16:51:16','2026-04-18 16:51:16',NULL),(91,15,'Set bộ Blazer eo, tay lỡ','- Chất liệu: Tuytsi (blazer+ quần)+ tuyết mưa mỏng (áo 2 dây)\n- Kiểu dáng: Blazer dáng suông+ quần baggies\n- Màu sắc: Hồng nhạt',1300000,53,'2026-04-18 16:52:37','2026-04-18 16:52:37',NULL);
/*!40000 ALTER TABLE `Products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ReturnRequests`
--

DROP TABLE IF EXISTS `ReturnRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ReturnRequests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `reason` text,
  `status` varchar(255) DEFAULT NULL,
  `images` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `userId` (`userId`),
  CONSTRAINT `ReturnRequests_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReturnRequests_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ReturnRequests`
--

LOCK TABLES `ReturnRequests` WRITE;
/*!40000 ALTER TABLE `ReturnRequests` DISABLE KEYS */;
/*!40000 ALTER TABLE `ReturnRequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RolePermissions`
--

DROP TABLE IF EXISTS `RolePermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RolePermissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roleId` int NOT NULL,
  `permissionId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permission_unique` (`roleId`,`permissionId`),
  KEY `permissionId` (`permissionId`),
  CONSTRAINT `RolePermissions_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `RolePermissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `Permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RolePermissions`
--

LOCK TABLES `RolePermissions` WRITE;
/*!40000 ALTER TABLE `RolePermissions` DISABLE KEYS */;
INSERT INTO `RolePermissions` VALUES (1,1,8,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(2,1,7,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(3,1,9,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(4,1,5,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(5,1,6,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(6,1,2,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(7,1,4,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(8,1,1,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(9,1,3,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(10,1,10,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(11,2,1,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(12,2,3,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(13,2,5,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(14,2,6,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(15,2,7,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(16,3,5,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(17,3,9,'2026-04-21 02:27:21','2026-04-21 02:27:21'),(18,1,11,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(19,1,12,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(20,1,13,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(21,1,14,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(22,1,15,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(23,2,12,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(24,2,14,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(25,2,15,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(26,3,11,'2026-04-21 05:35:37','2026-04-21 05:35:37'),(27,3,13,'2026-04-21 05:35:37','2026-04-21 05:35:37');
/*!40000 ALTER TABLE `RolePermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (1,'SUPER_ADMIN','Quản trị viên cấp cao nhất','2026-04-20 11:55:12','2026-04-20 11:55:12'),(2,'SALES','Nhân viên bán hàng','2026-04-20 11:55:12','2026-04-20 11:55:12'),(3,'ACCOUNTANT','Kế toán','2026-04-20 11:55:12','2026-04-20 11:55:12'),(4,'CUSTOMER','Khách hàng','2026-04-20 11:55:12','2026-04-20 11:55:12');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20260302144542-create-user.js'),('20260302144732-create-user-address.js'),('20260302144756-create-category.js'),('20260302144847-create-product.js'),('20260302145007-create-product-image.js'),('20260302145038-create-product-variant.js'),('20260302145117-create-collection.js'),('20260302145141-create-coupon.js'),('20260302145200-create-order.js'),('20260302145236-create-order-item.js'),('20260302145335-create-collection-product.js'),('20260305102300-create-cart.js'),('20260305102311-create-cart-item.js'),('20260306131228-add-shippingfee-to-orders.js'),('20260307104740-add-deletedAt-to-coupons.js'),('create-chatlog.js'),('20260420114211-create-roles.js'),('20260420114213-update-users-role-to-roleId.js'),('202604201142131-repair-existing-tables-pks.js'),('20260420114214-create-inventory-logs.js'),('20260420114215-create-payment-transactions.js'),('20260420114216-create-return-requests.js'),('20260420180000-add-indices-for-perf.js'),('20260421090001-create-permissions.js'),('20260421090002-create-role-permissions.js'),('20260421090003-create-user-roles.js'),('20260421090004-migrate-and-drop-role-id.js'),('20260421100001-create-user-permissions.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserAddresses`
--

DROP TABLE IF EXISTS `UserAddresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserAddresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `receiverName` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `ward` varchar(255) DEFAULT NULL,
  `detailAddress` varchar(255) DEFAULT NULL,
  `isDefault` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserAddresses`
--

LOCK TABLES `UserAddresses` WRITE;
/*!40000 ALTER TABLE `UserAddresses` DISABLE KEYS */;
INSERT INTO `UserAddresses` VALUES (1,2,'Nguyễn Bảo','0987654321','Hải Phòng','Kiến Minh','Cầu Đen',1,'2026-03-04 03:26:52','2026-03-04 06:31:07'),(3,2,'Địa chỉ Test','0987654321','Hà ','Kiến Minh','ádasd',0,'2026-03-16 12:58:17','2026-03-16 12:58:17'),(4,2,'Ngô Hoài Nam','0987654321','Nam Định','Nam Định','số 36 Hoa Thánh',0,'2026-04-19 10:37:07','2026-04-19 10:37:07');
/*!40000 ALTER TABLE `UserAddresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserPermissions`
--

DROP TABLE IF EXISTS `UserPermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserPermissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `permissionId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_permission_unique` (`userId`,`permissionId`),
  KEY `permissionId` (`permissionId`),
  CONSTRAINT `UserPermissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserPermissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `Permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserPermissions`
--

LOCK TABLES `UserPermissions` WRITE;
/*!40000 ALTER TABLE `UserPermissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `UserPermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserRoles`
--

DROP TABLE IF EXISTS `UserRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserRoles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `roleId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_role_unique` (`userId`,`roleId`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `UserRoles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserRoles_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserRoles`
--

LOCK TABLES `UserRoles` WRITE;
/*!40000 ALTER TABLE `UserRoles` DISABLE KEYS */;
INSERT INTO `UserRoles` VALUES (1,2,1,'2026-04-21 02:27:06','2026-04-21 02:27:06'),(2,4,2,'2026-04-21 02:27:06','2026-04-21 02:27:06'),(3,5,3,'2026-04-21 02:27:06','2026-04-21 02:27:06'),(4,1,4,'2026-04-21 02:27:06','2026-04-21 02:27:06'),(6,3,2,'2026-04-21 04:57:47','2026-04-21 04:57:47'),(8,7,4,'2026-04-21 05:01:06','2026-04-21 05:01:06'),(9,6,2,'2026-04-21 05:41:39','2026-04-21 05:41:39');
/*!40000 ALTER TABLE `UserRoles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `birthday` datetime DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `refresh_token` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'guest@gmail.com','0912345679','$2b$10$fDlN/LP1ey9nqZdNMuz2qOa2c9pux1xyo0PlwKQ5Uel8738toqIpS','Bao Update','2026-03-03 00:00:00',0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZnVsbE5hbWUiOiJCYW8gVXBkYXRlIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzI1NTI5NjgsImV4cCI6MTc3MzE1Nzc2OH0.W87ookj4TiisJ6wlN14-MzmqjSQV2jdaxF9SfFy9kNE','2026-03-02 16:01:21','2026-03-07 14:27:00'),(2,'baohp17@gmail.com','0912345670','$2b$10$CrzHS2rLmtXixdXYhAniQu1HzU2V8/bPRi0m.Qy8JuG9rAa1vXG4q','Bảo Nguyễn','2004-09-17 00:00:00',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZnVsbE5hbWUiOiJC4bqjbyBOZ3V54buFbiIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInJvbGVzIjpbIlNVUEVSX0FETUlOIl0sInBlcm1pc3Npb25zIjpbImNhdGVnb3JpZXMubWFuYWdlIiwiY2hhdGJvdC5tYW5hZ2UiLCJjaGF0Ym90LnJlYWQiLCJjb2xsZWN0aW9ucy5tYW5hZ2UiLCJjb3Vwb25zLm1hbmFnZSIsImRhc2hib2FyZC5yZWFkIiwiaW52ZW50b3J5LnJlYWQiLCJvcmRlcnMucmVhZCIsIm9yZGVycy51cGRhdGUiLCJwYXltZW50cy5yZWFkIiwicHJvZHVjdHMuY3JlYXRlIiwicHJvZHVjdHMuZGVsZXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLnVwZGF0ZSIsInVzZXJzLm1hbmFnZSJdLCJpYXQiOjE3NzY3NjQzNTQsImV4cCI6MTc3NzM2OTE1NH0.azzSt4Gu6H6DIgHUQEQMVB9fCpnjCwFx0EZ3TvWqZQw','2026-03-03 04:03:41','2026-04-21 09:39:14'),(3,'test@gmail.com','0912345671','$2b$10$mCsvO.GPzDt2FWpXyZasB.auIJMvDPqPxCwI/oy7HQ/1msmEh1PJO',NULL,NULL,1,NULL,'2026-03-03 04:04:09','2026-04-17 09:36:30'),(4,'testfront@asdas.com','0975761648','$2b$10$ZDbTFadHlqgZ44J8h9J7AOh2kp003D1OaxCZDH/jwykJC6M7GAEMm','Ngo Nam',NULL,NULL,NULL,'2026-04-16 15:18:07','2026-04-20 13:18:42'),(5,'newuser@gmail.com',NULL,'$2b$10$7yB3jGxlkEEioTPO4ey5fugkiEqHZhJUAH2369Hn5d55iN7F8iFri','Tiếp',NULL,NULL,NULL,'2026-04-20 13:02:11','2026-04-21 05:41:23'),(6,'tiep95323@st.vimaru.edu.vn',NULL,'$2b$10$H3pRV9AL7npD6VTz5pWPW.J5j/vhdNxgAc6aEF6ilpTE1NGaUFmEe','Mai Xuân Tiếp',NULL,NULL,NULL,'2026-04-21 05:00:05','2026-04-21 05:42:29'),(7,'bao95057@st.vimaru.edu.vn',NULL,'$2b$10$IXYA9xkPLKclvnqOPuC9qeQKLSf25tbkE2Gc0xTbUO4cDJIc102mu','Nguyễn Đức Bảo',NULL,NULL,NULL,'2026-04-21 05:01:06','2026-04-21 05:01:06');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'kvil_fashion'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 17:14:31
