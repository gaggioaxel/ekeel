CREATE DATABASE  IF NOT EXISTS `unige_encode_db2` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `unige_encode_db2`;
-- MySQL dump 10.13  Distrib 8.0.18, for Win64 (x86_64)
--
-- Host: localhost    Database: unige_encode_db
-- ------------------------------------------------------
-- Server version	5.7.27-log

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
-- Table structure for table `encode_associations`
--

DROP TABLE IF EXISTS `encode_associations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_associations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topicmap_id` int(11) NOT NULL,
  `association_type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_associations_encode_topicmaps_fk` (`topicmap_id`),
  KEY `encode_associations_encode_associations_types_fk` (`association_type_id`),
  CONSTRAINT `encode_associations_encode_associations_types_fk` FOREIGN KEY (`association_type_id`) REFERENCES `encode_associations_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_associations_encode_topicmaps_fk` FOREIGN KEY (`topicmap_id`) REFERENCES `encode_topicmaps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_associations`
--

LOCK TABLES `encode_associations` WRITE;
/*!40000 ALTER TABLE `encode_associations` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_associations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_associations_scopes`
--

DROP TABLE IF EXISTS `encode_associations_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_associations_scopes` (
  `association_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL,
  `content` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`association_id`,`scope_id`),
  KEY `encode_associations_scopes_encode_associations_fk` (`association_id`),
  KEY `encode_associations_scopes_encode_scopes_fk` (`scope_id`),
  CONSTRAINT `encode_associations_scopes_encode_associations_fk` FOREIGN KEY (`association_id`) REFERENCES `encode_associations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_associations_scopes_encode_scopes_fk` FOREIGN KEY (`scope_id`) REFERENCES `encode_scopes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_associations_scopes`
--

LOCK TABLES `encode_associations_scopes` WRITE;
/*!40000 ALTER TABLE `encode_associations_scopes` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_associations_scopes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_associations_types`
--

DROP TABLE IF EXISTS `encode_associations_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_associations_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `schema_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_associations_types_encode_schema_fk` (`schema_id`),
  CONSTRAINT `encode_associations_types_encode_schema_fk` FOREIGN KEY (`schema_id`) REFERENCES `encode_schema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_associations_types`
--

LOCK TABLES `encode_associations_types` WRITE;
/*!40000 ALTER TABLE `encode_associations_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_associations_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_authorizations`
--

DROP TABLE IF EXISTS `encode_authorizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_authorizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_authorizations`
--

LOCK TABLES `encode_authorizations` WRITE;
/*!40000 ALTER TABLE `encode_authorizations` DISABLE KEYS */;
INSERT INTO `encode_authorizations` VALUES (1,'ROLE_ADMIN'),(2,'ROLE_USER');
/*!40000 ALTER TABLE `encode_authorizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_editors`
--

DROP TABLE IF EXISTS `encode_editors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_editors` (
  `topicmap_id` int(11) NOT NULL,
  `user_email` varchar(60) NOT NULL,
  PRIMARY KEY (`topicmap_id`,`user_email`),
  KEY `encode_editors_encode_topicmaps_fk` (`topicmap_id`),
  KEY `encode_editors_encode_users_fk` (`user_email`),
  CONSTRAINT `encode_editors_encode_topicmaps_fk` FOREIGN KEY (`topicmap_id`) REFERENCES `encode_topicmaps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_editors_encode_users_fk` FOREIGN KEY (`user_email`) REFERENCES `encode_users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_editors`
--

LOCK TABLES `encode_editors` WRITE;
/*!40000 ALTER TABLE `encode_editors` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_editors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_efforts_occurrences`
--

DROP TABLE IF EXISTS `encode_efforts_occurrences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_efforts_occurrences` (
  `occurrence_id` int(11) NOT NULL,
  `effort_id` int(11) NOT NULL,
  `metric_value` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`occurrence_id`,`effort_id`),
  KEY `encode_efforts_occurrences_encode_occurrences_fk` (`occurrence_id`),
  KEY `encode_efforts_occurrences_encode_efforts_types_fk` (`effort_id`),
  CONSTRAINT `encode_efforts_occurrences_encode_efforts_types_fk` FOREIGN KEY (`effort_id`) REFERENCES `encode_efforts_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_efforts_occurrences_encode_occurrences_fk` FOREIGN KEY (`occurrence_id`) REFERENCES `encode_occurrences` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_efforts_occurrences`
--

LOCK TABLES `encode_efforts_occurrences` WRITE;
/*!40000 ALTER TABLE `encode_efforts_occurrences` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_efforts_occurrences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_efforts_types`
--

DROP TABLE IF EXISTS `encode_efforts_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_efforts_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_type` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `schema_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_efforts_types_encode_schema_fk` (`schema_id`),
  CONSTRAINT `encode_efforts_types_encode_schema_fk` FOREIGN KEY (`schema_id`) REFERENCES `encode_schema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_efforts_types`
--

LOCK TABLES `encode_efforts_types` WRITE;
/*!40000 ALTER TABLE `encode_efforts_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_efforts_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_occurrences`
--

DROP TABLE IF EXISTS `encode_occurrences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_occurrences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data_value` text,
  `data_reference` varchar(2048) DEFAULT NULL,
  `topic_id` int(11) NOT NULL,
  `occurrence_type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_occurrences_encode_occurrences_types_fk` (`occurrence_type_id`),
  KEY `encode_occurrences_encode_topics_fk` (`topic_id`),
  CONSTRAINT `encode_occurrences_encode_occurrences_types_fk` FOREIGN KEY (`occurrence_type_id`) REFERENCES `encode_occurrences_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_occurrences_encode_topics_fk` FOREIGN KEY (`topic_id`) REFERENCES `encode_topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_occurrences`
--

LOCK TABLES `encode_occurrences` WRITE;
/*!40000 ALTER TABLE `encode_occurrences` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_occurrences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_occurrences_files`
--

DROP TABLE IF EXISTS `encode_occurrences_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_occurrences_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `path` varchar(512) NOT NULL,
  `occurrence_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `encode_occurrences_files_candidate_key` (`name`,`occurrence_id`),
  KEY `encode_occurrence_files_encode_occurrences_fk` (`occurrence_id`),
  CONSTRAINT `encode_occurrence_files_encode_occurrences_fk` FOREIGN KEY (`occurrence_id`) REFERENCES `encode_occurrences` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_occurrences_files`
--

LOCK TABLES `encode_occurrences_files` WRITE;
/*!40000 ALTER TABLE `encode_occurrences_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_occurrences_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_occurrences_scopes`
--

DROP TABLE IF EXISTS `encode_occurrences_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_occurrences_scopes` (
  `occurrence_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL,
  `content` text,
  PRIMARY KEY (`occurrence_id`,`scope_id`),
  KEY `encode_occurrences_scopes_encode_occurrences_fk` (`occurrence_id`),
  KEY `encode_occurrences_scopes_encode_scopes_fk` (`scope_id`),
  CONSTRAINT `encode_occurrences_scopes_encode_occurrences_fk` FOREIGN KEY (`occurrence_id`) REFERENCES `encode_occurrences` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_occurrences_scopes_encode_scopes_fk` FOREIGN KEY (`scope_id`) REFERENCES `encode_scopes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_occurrences_scopes`
--

LOCK TABLES `encode_occurrences_scopes` WRITE;
/*!40000 ALTER TABLE `encode_occurrences_scopes` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_occurrences_scopes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_occurrences_types`
--

DROP TABLE IF EXISTS `encode_occurrences_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_occurrences_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `schema_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_occurrences_types_encode_schema_fk` (`schema_id`),
  CONSTRAINT `encode_occurrences_types_encode_schema_fk` FOREIGN KEY (`schema_id`) REFERENCES `encode_schema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_occurrences_types`
--

LOCK TABLES `encode_occurrences_types` WRITE;
/*!40000 ALTER TABLE `encode_occurrences_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_occurrences_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_roles`
--

DROP TABLE IF EXISTS `encode_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `association_type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_roles_encode_associations_types_fk` (`association_type_id`),
  CONSTRAINT `encode_roles_encode_associations_types_fk` FOREIGN KEY (`association_type_id`) REFERENCES `encode_associations_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_roles`
--

LOCK TABLES `encode_roles` WRITE;
/*!40000 ALTER TABLE `encode_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_roles_topics_types`
--

DROP TABLE IF EXISTS `encode_roles_topics_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_roles_topics_types` (
  `topic_type_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`topic_type_id`,`role_id`),
  KEY `encode_roles_topics_types_encode_topics_types_fk` (`topic_type_id`),
  KEY `encode_roles_topics_types_encode_roles_fk` (`role_id`),
  CONSTRAINT `encode_roles_topics_types_encode_roles_fk` FOREIGN KEY (`role_id`) REFERENCES `encode_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_roles_topics_types_encode_topics_types_fk` FOREIGN KEY (`topic_type_id`) REFERENCES `encode_topics_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_roles_topics_types`
--

LOCK TABLES `encode_roles_topics_types` WRITE;
/*!40000 ALTER TABLE `encode_roles_topics_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_roles_topics_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_schema`
--

DROP TABLE IF EXISTS `encode_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_schema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `owner` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_schema_encode_users_fk` (`owner`),
  CONSTRAINT `encode_schema_encode_schema_fk` FOREIGN KEY (`owner`) REFERENCES `encode_users` (`email`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_schema`
--

LOCK TABLES `encode_schema` WRITE;
/*!40000 ALTER TABLE `encode_schema` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_schema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_scopes`
--

DROP TABLE IF EXISTS `encode_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_scopes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `schema_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_scopes_encode_schema_fk` (`schema_id`),
  CONSTRAINT `encode_scopes_encode_schema_fk` FOREIGN KEY (`schema_id`) REFERENCES `encode_schema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_scopes`
--

LOCK TABLES `encode_scopes` WRITE;
/*!40000 ALTER TABLE `encode_scopes` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_scopes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_topicmaps`
--

DROP TABLE IF EXISTS `encode_topicmaps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_topicmaps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(128) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `version` varchar(8) DEFAULT NULL,
  `creation_date` timestamp(4) NOT NULL DEFAULT CURRENT_TIMESTAMP(4),
  `last_modify_date` timestamp(4) NULL DEFAULT NULL,
  `schema_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_topicmaps_encode_schema_fk` (`schema_id`),
  CONSTRAINT `encode_topicmaps_encode_schema_fk` FOREIGN KEY (`schema_id`) REFERENCES `encode_schema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_topicmaps`
--

LOCK TABLES `encode_topicmaps` WRITE;
/*!40000 ALTER TABLE `encode_topicmaps` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_topicmaps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_topics`
--

DROP TABLE IF EXISTS `encode_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `subject_locator` varchar(2048) DEFAULT NULL,
  `subject_identifier` varchar(2048) DEFAULT NULL,
  `topicmap_id` int(11) NOT NULL,
  `topic_type_id` int(11) NOT NULL,
  `variant_name` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_topics_encode_topicmaps_fk` (`topicmap_id`),
  KEY `encode_topics_encode_topics_types_fk` (`topic_type_id`),
  CONSTRAINT `encode_topics_encode_topicmaps_fk` FOREIGN KEY (`topicmap_id`) REFERENCES `encode_topicmaps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_topics_encode_topics_types_fk` FOREIGN KEY (`topic_type_id`) REFERENCES `encode_topics_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_topics`
--

LOCK TABLES `encode_topics` WRITE;
/*!40000 ALTER TABLE `encode_topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_topics_associations_roles`
--

DROP TABLE IF EXISTS `encode_topics_associations_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_topics_associations_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `association_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `encode_tar_associations_topics_key` (`association_id`,`topic_id`),
  KEY `encode_topics_associations_roles_encode_associations_fk` (`association_id`),
  KEY `encode_topics_associations_roles_encode_roles_fk` (`role_id`),
  KEY `encode_topics_associations_roles_encode_topics_fk` (`topic_id`),
  CONSTRAINT `encode_topics_associations_roles_encode_associations_fk` FOREIGN KEY (`association_id`) REFERENCES `encode_associations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_topics_associations_roles_encode_roles_fk` FOREIGN KEY (`role_id`) REFERENCES `encode_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_topics_associations_roles_encode_topics_fk` FOREIGN KEY (`topic_id`) REFERENCES `encode_topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_topics_associations_roles`
--

LOCK TABLES `encode_topics_associations_roles` WRITE;
/*!40000 ALTER TABLE `encode_topics_associations_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_topics_associations_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER after_delete_encode_topics_associations_roles AFTER DELETE
ON encode_topics_associations_roles FOR EACH ROW
BEGIN
    DELETE FROM encode_associations WHERE id = OLD.id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `encode_topics_scopes`
--

DROP TABLE IF EXISTS `encode_topics_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_topics_scopes` (
  `topic_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL,
  `content` text,
  PRIMARY KEY (`topic_id`,`scope_id`),
  KEY `encode_topics_scopes_encode_scopes_fk` (`scope_id`),
  KEY `encode_topics_scopes_encode_topics_fk` (`topic_id`),
  CONSTRAINT `encode_topics_scopes_encode_scopes_fk` FOREIGN KEY (`scope_id`) REFERENCES `encode_scopes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encode_topics_scopes_encode_topics_fk` FOREIGN KEY (`topic_id`) REFERENCES `encode_topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_topics_scopes`
--

LOCK TABLES `encode_topics_scopes` WRITE;
/*!40000 ALTER TABLE `encode_topics_scopes` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_topics_scopes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_topics_types`
--

DROP TABLE IF EXISTS `encode_topics_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_topics_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `schema_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `encode_topics_types_encode_schema_fk` (`schema_id`),
  CONSTRAINT `encode_topics_types_encode_schema_fk` FOREIGN KEY (`schema_id`) REFERENCES `encode_schema` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_topics_types`
--

LOCK TABLES `encode_topics_types` WRITE;
/*!40000 ALTER TABLE `encode_topics_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_topics_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_users`
--

DROP TABLE IF EXISTS `encode_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_users` (
  `email` varchar(60) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `first_name` varchar(64) NOT NULL,
  `last_name` varchar(64) NOT NULL,
  `creation_date` timestamp(4) NOT NULL DEFAULT CURRENT_TIMESTAMP(4),
  `enabled` tinyint(1) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_users`
--

LOCK TABLES `encode_users` WRITE;
/*!40000 ALTER TABLE `encode_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encode_users_authorizations`
--

DROP TABLE IF EXISTS `encode_users_authorizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encode_users_authorizations` (
  `user_email` varchar(60) NOT NULL,
  `authorization_id` int(11) NOT NULL,
  PRIMARY KEY (`user_email`,`authorization_id`),
  KEY `encode_users_authorizations_encode_users_fk` (`user_email`),
  KEY `encode_users_authorizations_encode_authorizations_fk` (`authorization_id`),
  CONSTRAINT `encode_users_authorizations_encode_authorizations_fk` FOREIGN KEY (`authorization_id`) REFERENCES `encode_authorizations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `encode_users_authorizations_encode_users_fk` FOREIGN KEY (`user_email`) REFERENCES `encode_users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encode_users_authorizations`
--

LOCK TABLES `encode_users_authorizations` WRITE;
/*!40000 ALTER TABLE `encode_users_authorizations` DISABLE KEYS */;
/*!40000 ALTER TABLE `encode_users_authorizations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-12-02 22:23:05
