CREATE DATABASE IF NOT EXISTS expenseflow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expenseflow;

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  status        ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  token_hash  CHAR(64) NOT NULL UNIQUE,
  family_id   CHAR(36) NOT NULL,
  parent_id   CHAR(36) NULL,
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  user_agent  VARCHAR(255) NULL,
  ip          VARCHAR(64) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rt_family (family_id),
  INDEX idx_rt_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id        CHAR(36)       PRIMARY KEY,
  user_id   CHAR(36)       NOT NULL,
  name      VARCHAR(190)   NOT NULL,
  category  VARCHAR(60)    NOT NULL,
  type      ENUM('income','expense') NOT NULL,
  amount    DECIMAL(12,2)  NOT NULL,
  date      DATE           NOT NULL,
  note      TEXT           NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tx_user_date (user_id, date),
  INDEX idx_tx_user_cat  (user_id, category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budgets (
  id        CHAR(36)      PRIMARY KEY,
  user_id   CHAR(36)      NOT NULL,
  category  VARCHAR(60)   NOT NULL,
  `limit`   DECIMAL(12,2) NOT NULL,
  period    ENUM('monthly') NOT NULL DEFAULT 'monthly',
  CONSTRAINT fk_b_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_cat (user_id, category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS goals (
  id        CHAR(36)      PRIMARY KEY,
  user_id   CHAR(36)      NOT NULL,
  name      VARCHAR(190)  NOT NULL,
  target    DECIMAL(12,2) NOT NULL,
  current   DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline  DATE          NULL,
  CONSTRAINT fk_g_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id       CHAR(36)     PRIMARY KEY,
  user_id  CHAR(36)     NOT NULL,
  type     ENUM('budget','goal','system') NOT NULL,
  title    VARCHAR(190) NOT NULL,
  message  TEXT         NOT NULL,
  ref_key  VARCHAR(120) NULL,
  `read`   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_n_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_ref (user_id, type, ref_key),
  INDEX idx_n_user_date (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  user_id              CHAR(36) PRIMARY KEY,
  email_budget_alerts  TINYINT(1) NOT NULL DEFAULT 1,
  email_goal_alerts    TINYINT(1) NOT NULL DEFAULT 1,
  email_weekly_digest  TINYINT(1) NOT NULL DEFAULT 0,
  email_product_updates TINYINT(1) NOT NULL DEFAULT 0,
  currency             VARCHAR(8) NOT NULL DEFAULT 'USD',
  CONSTRAINT fk_s_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- For installs upgrading from an older schema:
-- ALTER TABLE settings ADD COLUMN currency VARCHAR(8) NOT NULL DEFAULT 'USD';
