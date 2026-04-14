-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: ticketbooking
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `discount`
--

DROP TABLE IF EXISTS `discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount` (
  `DiscountID` int NOT NULL AUTO_INCREMENT,
  `EventID` int DEFAULT NULL,
  `AppliesAllEvents` tinyint(1) NOT NULL DEFAULT '0',
  `Code` varchar(50) NOT NULL,
  `Description` text,
  `DiscountAmount` decimal(18,2) NOT NULL,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`DiscountID`),
  UNIQUE KEY `Code` (`Code`),
  KEY `fk_discount_event` (`EventID`),
  CONSTRAINT `fk_discount_event` FOREIGN KEY (`EventID`) REFERENCES `event` (`EventID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount`
--

LOCK TABLES `discount` WRITE;
/*!40000 ALTER TABLE `discount` DISABLE KEYS */;
/*!40000 ALTER TABLE `discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `EventName` varchar(255) NOT NULL,
  `CategoryID` int NOT NULL,
  `VenueID` int DEFAULT NULL,
  `Description` text,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `OrganizerID` int NOT NULL,
  `FeaturedEvent` tinyint(1) NOT NULL DEFAULT '0',
  `ImageURL` varchar(255) DEFAULT NULL,
  `IsBanner` tinyint(1) NOT NULL DEFAULT '0',
  `IsFeaturedEvent` tinyint(1) NOT NULL DEFAULT '0',
  `IsFavorite` tinyint(1) NOT NULL DEFAULT '0',
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  KEY `fk_event_category` (`CategoryID`),
  KEY `fk_event_organizer` (`OrganizerID`),
  KEY `idx_event_venue` (`VenueID`),
  CONSTRAINT `fk_event_category` FOREIGN KEY (`CategoryID`) REFERENCES `eventcategory` (`CategoryID`),
  CONSTRAINT `fk_event_organizer` FOREIGN KEY (`OrganizerID`) REFERENCES `organizer` (`OrganizerID`),
  CONSTRAINT `fk_event_venue` FOREIGN KEY (`VenueID`) REFERENCES `venue` (`VenueID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,'âm nhạc 1',1,NULL,'12312','2026-04-12 00:00:00','2026-04-13 00:00:00','PUBLISHED',2,0,NULL,0,0,0,'2026-04-08 16:09:46','2026-04-10 15:38:13');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventcategory`
--

DROP TABLE IF EXISTS `eventcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventcategory` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(50) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventcategory`
--

LOCK TABLES `eventcategory` WRITE;
/*!40000 ALTER TABLE `eventcategory` DISABLE KEYS */;
INSERT INTO `eventcategory` VALUES (1,'Âm nhạc','Active',1,'2026-04-08 22:43:38',NULL),(2,'Thể thao','Active',1,'2026-04-08 22:43:38',NULL),(3,'Hội thảo','Active',1,'2026-04-08 22:43:38',NULL),(4,'Triển lãm','Active',1,'2026-04-08 22:43:38',NULL),(5,'Sân khấu','Active',1,'2026-04-08 22:43:38',NULL),(6,'Ẩm thực','Active',1,'2026-04-08 22:43:38',NULL),(7,'Workshop','Active',1,'2026-04-08 22:43:38',NULL),(8,'Hài kịch','Active',1,'2026-04-08 22:43:38',NULL),(9,'Thời trang','Active',1,'2026-04-08 22:43:38',NULL),(10,'Marathon','Active',1,'2026-04-08 22:43:38',NULL),(11,'Giáo dục','Active',1,'2026-04-08 22:43:38',NULL),(12,'Công nghệ','Active',1,'2026-04-08 22:43:38',NULL),(13,'Gia đình','Active',1,'2026-04-08 22:43:38',NULL),(14,'Thiếu nhi','Active',1,'2026-04-08 22:43:38',NULL),(15,'Nghệ thuật','Active',1,'2026-04-08 22:43:38',NULL),(16,'SMOKE_TEST_CATEGORY','ACTIVE',1,'2026-04-10 15:37:42',NULL);
/*!40000 ALTER TABLE `eventcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventqrcode`
--

DROP TABLE IF EXISTS `eventqrcode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventqrcode` (
  `QRCodeID` int NOT NULL AUTO_INCREMENT,
  `EventID` int NOT NULL,
  `QRCodeURL` varchar(255) NOT NULL,
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`QRCodeID`),
  KEY `fk_eventqrcode_event` (`EventID`),
  CONSTRAINT `fk_eventqrcode_event` FOREIGN KEY (`EventID`) REFERENCES `event` (`EventID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventqrcode`
--

LOCK TABLES `eventqrcode` WRITE;
/*!40000 ALTER TABLE `eventqrcode` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventqrcode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `EventID` int NOT NULL,
  `OrderDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Pending',
  `OrderCode` varchar(20) NOT NULL,
  `CreateID` int NOT NULL,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`OrderID`),
  UNIQUE KEY `OrderCode` (`OrderCode`),
  KEY `fk_orders_user` (`UserID`),
  KEY `fk_orders_event` (`EventID`),
  CONSTRAINT `fk_orders_event` FOREIGN KEY (`EventID`) REFERENCES `event` (`EventID`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizer`
--

DROP TABLE IF EXISTS `organizer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizer` (
  `OrganizerID` int NOT NULL AUTO_INCREMENT,
  `OrganizerName` varchar(255) NOT NULL,
  `Description` text,
  `LogoURL` varchar(255) DEFAULT NULL,
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`OrganizerID`),
  KEY `fk_Users` (`CreateID`),
  CONSTRAINT `fk_Users` FOREIGN KEY (`CreateID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizer`
--

LOCK TABLES `organizer` WRITE;
/*!40000 ALTER TABLE `organizer` DISABLE KEYS */;
INSERT INTO `organizer` VALUES (2,'Organizer 2',NULL,NULL,2,'2026-04-08 16:09:46',NULL);
/*!40000 ALTER TABLE `organizer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `PaymentID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int NOT NULL,
  `PaymentDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Amount` decimal(18,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Completed',
  `CreateID` int NOT NULL,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`PaymentID`),
  KEY `fk_payment_order` (`OrderID`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  `CreateID` int DEFAULT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`RoleID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Administrator',NULL,'2026-04-05 23:12:08',NULL),(2,'Organizer',1,'2026-04-05 23:12:08',NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seat`
--

DROP TABLE IF EXISTS `seat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat` (
  `SeatID` int NOT NULL AUTO_INCREMENT,
  `VenueID` int NOT NULL,
  `SeatNumber` varchar(20) NOT NULL,
  `RowNumber` varchar(20) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Available',
  `Area` varchar(100) DEFAULT NULL,
  `XPosition` int DEFAULT NULL,
  `YPosition` int DEFAULT NULL,
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`SeatID`),
  KEY `fk_seat_venue` (`VenueID`),
  CONSTRAINT `fk_seat_venue` FOREIGN KEY (`VenueID`) REFERENCES `venue` (`VenueID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat`
--

LOCK TABLES `seat` WRITE;
/*!40000 ALTER TABLE `seat` DISABLE KEYS */;
/*!40000 ALTER TABLE `seat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `TicketID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int NOT NULL,
  `SeatID` int NOT NULL,
  `TicketTypeID` int NOT NULL,
  `TicketPrice` decimal(18,2) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `TicketQRCode` varchar(255) NOT NULL,
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`TicketID`),
  UNIQUE KEY `TicketQRCode` (`TicketQRCode`),
  KEY `fk_ticket_order` (`OrderID`),
  KEY `fk_ticket_seat` (`SeatID`),
  KEY `fk_ticket_type` (`TicketTypeID`),
  CONSTRAINT `fk_ticket_order` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`),
  CONSTRAINT `fk_ticket_seat` FOREIGN KEY (`SeatID`) REFERENCES `seat` (`SeatID`),
  CONSTRAINT `fk_ticket_type` FOREIGN KEY (`TicketTypeID`) REFERENCES `tickettype` (`TicketTypeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickettype`
--

DROP TABLE IF EXISTS `tickettype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickettype` (
  `TicketTypeID` int NOT NULL AUTO_INCREMENT,
  `EventID` int NOT NULL,
  `TypeName` varchar(50) NOT NULL,
  `Price` decimal(18,2) NOT NULL,
  `SaleStartDate` datetime DEFAULT NULL,
  `SaleEndDate` datetime DEFAULT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  `SaleOpenTime` datetime DEFAULT NULL,
  PRIMARY KEY (`TicketTypeID`),
  KEY `fk_tickettype_event` (`EventID`),
  CONSTRAINT `fk_tickettype_event` FOREIGN KEY (`EventID`) REFERENCES `event` (`EventID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickettype`
--

LOCK TABLES `tickettype` WRITE;
/*!40000 ALTER TABLE `tickettype` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickettype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Password` varchar(255) NOT NULL,
  `RoleID` int NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Phone` varchar(20) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  KEY `fk_users_role` (`RoleID`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'123456',1,'admin@gmail.com','09876544321','Administrator','1',1,'2026-04-05 23:13:13',NULL),(2,'123456',2,'organizer1@gmail.com','09876544322','organizer1','1',1,'2026-04-05 23:13:13',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue`
--

DROP TABLE IF EXISTS `venue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue` (
  `VenueID` int NOT NULL AUTO_INCREMENT,
  `VenueName` varchar(255) NOT NULL,
  `Address` varchar(255) NOT NULL,
  `City` varchar(100) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `Capacity` int NOT NULL,
  `SeatMap` json DEFAULT NULL,
  `CreateID` int NOT NULL,
  `CreateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`VenueID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue`
--

LOCK TABLES `venue` WRITE;
/*!40000 ALTER TABLE `venue` DISABLE KEYS */;
INSERT INTO `venue` VALUES (1,'Nhà thờ đức bà','Nhà thờ đức bà','Ho Chi Minh','ACTIVE',50,'{\"areas\": [{\"cols\": 10, \"name\": \"Khu vực 1\", \"rows\": 5, \"locked_seats\": []}]}',2,'2026-04-08 15:31:26','2026-04-08 15:39:35');
/*!40000 ALTER TABLE `venue` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-13 20:28:30
