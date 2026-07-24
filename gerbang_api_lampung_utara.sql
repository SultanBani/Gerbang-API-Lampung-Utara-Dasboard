-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 24, 2026 at 12:58 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gerbang_api_lampung_utara`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_controls`
--

CREATE TABLE `access_controls` (
  `id` bigint UNSIGNED NOT NULL,
  `application_id` bigint UNSIGNED NOT NULL,
  `endpoint_id` bigint UNSIGNED NOT NULL,
  `is_allowed` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `access_controls`
--

INSERT INTO `access_controls` (`id`, `application_id`, `endpoint_id`, `is_allowed`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(2, 1, 2, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(3, 1, 8, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(4, 1, 9, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(5, 2, 3, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(6, 2, 4, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(7, 2, 5, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(8, 2, 8, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(9, 2, 9, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(10, 3, 3, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(11, 3, 4, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(12, 3, 6, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(13, 3, 7, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(14, 3, 8, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(15, 3, 9, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(16, 4, 3, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(17, 4, 4, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(18, 4, 8, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(19, 4, 9, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(20, 5, 8, 1, '2026-07-21 19:34:47', '2026-07-21 19:34:47');

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` bigint UNSIGNED NOT NULL,
  `application_id` bigint UNSIGNED NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `expires_at` timestamp NULL DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_keys`
--

INSERT INTO `api_keys` (`id`, `application_id`, `key`, `status`, `expires_at`, `last_used_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'LAMPURA-DISDUKCAPIL-d2StfwHDKAeMTK1Ixko6dUmtISVXD8Kv', 'active', '2027-07-21 19:34:47', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(2, 2, 'LAMPURA-BKPSDM-ESzRzXVC6axFQqyYAKG4MRkn3CjGvxMV', 'active', '2027-07-21 19:34:47', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(3, 3, 'LAMPURA-BAPPEDA-Fc1wkgYhj7cUzZ7AekS1w5qnKd70lN7b', 'active', '2027-07-21 19:34:47', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(4, 4, 'LAMPURA-BKPSDM-K7DNF1kwCTvBdNq3tmWYgPpb6WdgkoZY', 'active', '2027-07-21 19:34:47', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(5, 5, 'LAMPURA-DINASPENDIDIKAN-qTuAZTde973SETr7VjGqg2SVHMZQfyNw', 'revoked', '2027-07-21 19:34:47', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opd` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pic_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pic_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `name`, `opd`, `pic_name`, `pic_phone`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'SIAK Disdukcapil', 'Disdukcapil', 'Siti Rahma', '0813-9876-5432', 'Integrasi data kependudukan dan NIK warga Kabupaten Lampung Utara.', 'active', '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(2, 'SIMPEG BKPSDM', 'BKPSDM', 'Budi Santoso', '0812-3456-7890', 'Sistem Informasi Kepegawaian ASN Kabupaten Lampung Utara.', 'active', '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(3, 'SIPD Bappeda', 'Bappeda', 'Rina Dewi', '0821-4455-6677', 'Sistem Informasi Perencanaan dan Pembangunan Daerah.', 'active', '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(4, 'E-Kinerja BKPSDM', 'BKPSDM', 'Yuli Andini', '0823-1122-4455', 'Manajemen penilaian SKP dan capaian kinerja ASN.', 'active', '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(5, 'PPDB Dinas Pendidikan', 'Dinas Pendidikan', 'Hendra W.', '0819-3344-5566', 'Penerimaan Peserta Didik Baru tingkat SD dan SMP.', 'inactive', '2026-07-21 19:34:47', '2026-07-21 19:34:47');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `endpoints`
--

CREATE TABLE `endpoints` (
  `id` bigint UNSIGNED NOT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tag` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_auth_required` tinyint(1) NOT NULL DEFAULT '1',
  `rate_limit` int NOT NULL DEFAULT '60',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `endpoints`
--

INSERT INTO `endpoints` (`id`, `method`, `url`, `description`, `tag`, `is_auth_required`, `rate_limit`, `created_at`, `updated_at`) VALUES
(1, 'GET', '/v1/penduduk', 'Ambil daftar data kependudukan', 'Kependudukan', 1, 100, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(2, 'GET', '/v1/penduduk/{nik}', 'Ambil detail penduduk berdasarkan NIK', 'Kependudukan', 1, 50, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(3, 'GET', '/v1/pegawai', 'Daftar seluruh data ASN aktif', 'Kepegawaian', 1, 100, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(4, 'GET', '/v1/pegawai/{nip}', 'Detail profil ASN berdasarkan NIP', 'Kepegawaian', 1, 100, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(5, 'POST', '/v1/pegawai', 'Tambah data pegawai baru', 'Kepegawaian', 1, 20, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(6, 'GET', '/v1/anggaran', 'Data realisasi anggaran tahunan daerah', 'Perencanaan', 1, 60, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(7, 'GET', '/v1/program-kerja', 'Daftar program kerja OPD aktif', 'Perencanaan', 1, 60, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(8, 'POST', '/v1/auth/login', 'Autentikasi dan generate token sesi', 'Auth', 0, 10, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(9, 'POST', '/v1/auth/logout', 'Invalidasi token sesi aktif', 'Auth', 1, 10, '2026-07-21 19:34:47', '2026-07-21 19:34:47');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_16_035434_create_applications_table', 1),
(5, '2026_07_16_035435_create_endpoints_table', 1),
(6, '2026_07_16_035436_create_api_keys_table', 1),
(7, '2026_07_16_035437_create_access_controls_table', 1),
(8, '2026_07_16_035438_create_request_logs_table', 1),
(9, '2026_07_22_014220_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(4, 'App\\Models\\User', 1, 'auth_token', '8361f679e933defe2e53bcd026e8ad96d88aa66a4e81e3ee505fa48d1cf7948d', '[\"*\"]', '2026-07-21 19:48:17', NULL, '2026-07-21 19:48:01', '2026-07-21 19:48:17');

-- --------------------------------------------------------

--
-- Table structure for table `request_logs`
--

CREATE TABLE `request_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `api_key_id` bigint UNSIGNED DEFAULT NULL,
  `application_id` bigint UNSIGNED DEFAULT NULL,
  `endpoint_id` bigint UNSIGNED DEFAULT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_code` int NOT NULL,
  `response_time_ms` int NOT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_payload` text COLLATE utf8mb4_unicode_ci,
  `response_payload` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_logs`
--

INSERT INTO `request_logs` (`id`, `api_key_id`, `application_id`, `endpoint_id`, `method`, `url`, `status_code`, `response_time_ms`, `ip_address`, `request_payload`, `response_payload`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'GET', '/v1/penduduk', 200, 87, '172.16.0.31', '{\"method\":\"GET\",\"path\":\"\\/v1\\/penduduk\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(2, 1, 1, 2, 'GET', '/v1/penduduk/{nik}', 200, 102, '172.16.0.46', '{\"method\":\"GET\",\"path\":\"\\/v1\\/penduduk\\/{nik}\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-21 17:34:47', '2026-07-21 17:34:47'),
(3, 2, 2, 3, 'GET', '/v1/pegawai', 200, 145, '172.16.0.44', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-21 14:34:47', '2026-07-21 14:34:47'),
(4, 2, 2, 4, 'GET', '/v1/pegawai/{nip}', 200, 98, '172.16.0.42', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\\/{nip}\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-21 11:34:47', '2026-07-21 11:34:47'),
(5, 3, 3, 6, 'GET', '/v1/anggaran', 200, 210, '172.16.0.40', '{\"method\":\"GET\",\"path\":\"\\/v1\\/anggaran\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-21 07:34:47', '2026-07-21 07:34:47'),
(6, 4, 4, 3, 'GET', '/v1/pegawai', 200, 130, '172.16.0.10', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-21 04:34:47', '2026-07-21 04:34:47'),
(7, 1, 1, 1, 'GET', '/v1/penduduk', 401, 31, '172.16.0.38', '{\"method\":\"GET\",\"path\":\"\\/v1\\/penduduk\",\"query\":null,\"body\":null}', '{\"success\":false,\"error\":\"HTTP 401\"}', '2026-07-20 23:34:47', '2026-07-20 23:34:47'),
(8, 2, 2, 5, 'POST', '/v1/pegawai', 403, 45, '172.16.0.15', '{\"method\":\"POST\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":false,\"error\":\"HTTP 403\"}', '2026-07-20 19:34:47', '2026-07-20 19:34:47'),
(9, 3, 3, 6, 'GET', '/v1/anggaran', 200, 189, '172.16.0.26', '{\"method\":\"GET\",\"path\":\"\\/v1\\/anggaran\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-20 17:34:47', '2026-07-20 17:34:47'),
(10, 2, 2, 3, 'GET', '/v1/pegawai', 200, 77, '172.16.0.40', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-20 13:34:47', '2026-07-20 13:34:47'),
(11, 1, 1, 8, 'POST', '/v1/auth/login', 200, 210, '172.16.0.39', '{\"method\":\"POST\",\"path\":\"\\/v1\\/auth\\/login\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-20 08:34:47', '2026-07-20 08:34:47'),
(12, 3, 3, 7, 'GET', '/v1/program-kerja', 200, 160, '172.16.0.26', '{\"method\":\"GET\",\"path\":\"\\/v1\\/program-kerja\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-20 03:34:47', '2026-07-20 03:34:47'),
(13, 4, 4, 4, 'GET', '/v1/pegawai/{nip}', 502, 2103, '172.16.0.30', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\\/{nip}\",\"query\":null,\"body\":null}', '{\"success\":false,\"error\":\"HTTP 502\"}', '2026-07-19 22:34:47', '2026-07-19 22:34:47'),
(14, 2, 2, 4, 'GET', '/v1/pegawai/{nip}', 200, 88, '172.16.0.30', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\\/{nip}\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-19 19:34:47', '2026-07-19 19:34:47'),
(15, 5, 5, 8, 'POST', '/v1/auth/login', 401, 22, '172.16.0.43', '{\"method\":\"POST\",\"path\":\"\\/v1\\/auth\\/login\",\"query\":null,\"body\":null}', '{\"success\":false,\"error\":\"HTTP 401\"}', '2026-07-19 17:34:47', '2026-07-19 17:34:47'),
(16, 1, 1, 2, 'GET', '/v1/penduduk/{nik}', 200, 110, '172.16.0.10', '{\"method\":\"GET\",\"path\":\"\\/v1\\/penduduk\\/{nik}\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-19 12:34:47', '2026-07-19 12:34:47'),
(17, 2, 2, 3, 'GET', '/v1/pegawai', 200, 95, '172.16.0.31', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-19 07:34:47', '2026-07-19 07:34:47'),
(18, 3, 3, 6, 'GET', '/v1/anggaran', 404, 30, '172.16.0.26', '{\"method\":\"GET\",\"path\":\"\\/v1\\/anggaran\",\"query\":null,\"body\":null}', '{\"success\":false,\"error\":\"HTTP 404\"}', '2026-07-18 19:34:47', '2026-07-18 19:34:47'),
(19, 1, 1, 1, 'GET', '/v1/penduduk', 200, 112, '172.16.0.27', '{\"method\":\"GET\",\"path\":\"\\/v1\\/penduduk\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-18 16:34:47', '2026-07-18 16:34:47'),
(20, 4, 4, 3, 'GET', '/v1/pegawai', 200, 143, '172.16.0.24', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-18 11:34:47', '2026-07-18 11:34:47'),
(21, 2, 2, 5, 'POST', '/v1/pegawai', 200, 198, '172.16.0.37', '{\"method\":\"POST\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-17 19:34:47', '2026-07-17 19:34:47'),
(22, 3, 3, 7, 'GET', '/v1/program-kerja', 200, 175, '172.16.0.41', '{\"method\":\"GET\",\"path\":\"\\/v1\\/program-kerja\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-17 10:34:47', '2026-07-17 10:34:47'),
(23, 1, 1, 1, 'GET', '/v1/penduduk', 200, 90, '172.16.0.16', '{\"method\":\"GET\",\"path\":\"\\/v1\\/penduduk\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-16 19:34:47', '2026-07-16 19:34:47'),
(24, 2, 2, 3, 'GET', '/v1/pegawai', 200, 101, '172.16.0.45', '{\"method\":\"GET\",\"path\":\"\\/v1\\/pegawai\",\"query\":null,\"body\":null}', '{\"success\":true,\"data\":{\"sample\":\"response data\"}}', '2026-07-16 09:34:47', '2026-07-16 09:34:47'),
(25, 3, 3, 6, 'GET', '/v1/anggaran', 503, 5000, '172.16.0.29', '{\"method\":\"GET\",\"path\":\"\\/v1\\/anggaran\",\"query\":null,\"body\":null}', '{\"success\":false,\"error\":\"HTTP 503\"}', '2026-07-15 19:34:47', '2026-07-15 19:34:47');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dinas',
  `opd_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_id` bigint UNSIGNED DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `role`, `opd_name`, `application_id`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin Super Diskominfo', 'admin', 'admin@lampungutarakab.go.id', 'admin', 'Dinas Komunikasi dan Informatika', NULL, NULL, '$2y$12$tSTCkRUGzEzNYZ3dXNUHnuDutKqjjwPsS.IYLjHGmiqBjIq0S/MmW', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(2, 'Dinas Perencanaan (Bappeda)', 'bappeda', 'bappeda@lampungutarakab.go.id', 'dinas', 'Badan Perencanaan Pembangunan Daerah', 3, NULL, '$2y$12$bdx8x7xCbOJ6TMYNJFEMSeNcLPZipEdaD6IT/8v92mqHUYVDfP9oC', NULL, '2026-07-21 19:34:47', '2026-07-21 19:34:47'),
(3, 'Dinas Kependudukan & Capil', 'disdukcapil', 'disdukcapil@lampungutarakab.go.id', 'dinas', 'Dinas Kependudukan dan Pencatatan Sipil', 1, NULL, '$2y$12$BYnRp.XBjWFWtErY7cAdauUT48pHPCqWSXh4Hd2saZJPpUTJQh0EW', NULL, '2026-07-21 19:34:48', '2026-07-21 19:34:48'),
(4, 'Badan Kepegawaian Daerah', 'bkd', 'bkd@lampungutarakab.go.id', 'dinas', 'Badan Kepegawaian Daerah', 2, NULL, '$2y$12$I.cL56B2bVtWaR1fWVvG8.hnnBie/Adb.RZghkAS3rcS0lrgQG1AC', NULL, '2026-07-21 19:34:48', '2026-07-21 19:34:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_controls`
--
ALTER TABLE `access_controls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `access_controls_application_id_foreign` (`application_id`),
  ADD KEY `access_controls_endpoint_id_foreign` (`endpoint_id`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_keys_key_unique` (`key`),
  ADD KEY `api_keys_application_id_foreign` (`application_id`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `endpoints`
--
ALTER TABLE `endpoints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `request_logs`
--
ALTER TABLE `request_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_logs_api_key_id_foreign` (`api_key_id`),
  ADD KEY `request_logs_application_id_foreign` (`application_id`),
  ADD KEY `request_logs_endpoint_id_foreign` (`endpoint_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_controls`
--
ALTER TABLE `access_controls`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `endpoints`
--
ALTER TABLE `endpoints`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `request_logs`
--
ALTER TABLE `request_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_controls`
--
ALTER TABLE `access_controls`
  ADD CONSTRAINT `access_controls_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `access_controls_endpoint_id_foreign` FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `api_keys_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `request_logs`
--
ALTER TABLE `request_logs`
  ADD CONSTRAINT `request_logs_api_key_id_foreign` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `request_logs_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `request_logs_endpoint_id_foreign` FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
