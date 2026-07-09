-- ExpenseFlow schema (MySQL 8+)
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  status        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  avatar_url    VARCHAR(500) NULL,
  reset_token   VARCHAR(120) NULL,
  reset_expires DATETIME     NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id      CHAR(36)     PRIMARY KEY,
  user_id CHAR(36)     NOT NULL,
  name    VARCHAR(80)  NOT NULL,
  type    ENUM('expense','income') NOT NULL DEFAULT 'expense',
  color   VARCHAR(20)  NULL,
  icon    VARCHAR(40)  NULL,
  UNIQUE KEY uq_cat (user_id, name, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id         CHAR(36)     PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  name       VARCHAR(160) NOT NULL,
  category   VARCHAR(80)  NOT NULL,
  type       ENUM('expense','income') NOT NULL,
  amount     DECIMAL(14,2) NOT NULL,
  date       DATE         NOT NULL,
  note       TEXT         NULL,
  receipt_id CHAR(36)     NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budgets (
  id       CHAR(36)     PRIMARY KEY,
  user_id  CHAR(36)     NOT NULL,
  category VARCHAR(80)  NOT NULL,
  `limit`  DECIMAL(14,2) NOT NULL,
  period   ENUM('weekly','monthly','yearly') NOT NULL DEFAULT 'monthly',
  UNIQUE KEY uq_bud (user_id, category, period),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS goals (
  id       CHAR(36)     PRIMARY KEY,
  user_id  CHAR(36)     NOT NULL,
  name     VARCHAR(120) NOT NULL,
  target   DECIMAL(14,2) NOT NULL,
  current  DECIMAL(14,2) NOT NULL DEFAULT 0,
  deadline DATE         NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS receipts (
  id           CHAR(36)     PRIMARY KEY,
  user_id      CHAR(36)     NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  original     VARCHAR(255) NOT NULL,
  mime         VARCHAR(80)  NOT NULL,
  size_bytes   INT          NOT NULL,
  uploaded_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id         CHAR(36)     PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  type       VARCHAR(40)  NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  ref_key    VARCHAR(160) NULL,
  `read`     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  user_id                CHAR(36) PRIMARY KEY,
  email_budget_alerts    TINYINT(1) NOT NULL DEFAULT 1,
  email_goal_alerts      TINYINT(1) NOT NULL DEFAULT 1,
  email_weekly_digest    TINYINT(1) NOT NULL DEFAULT 0,
  email_product_updates  TINYINT(1) NOT NULL DEFAULT 0,
  currency               VARCHAR(8) NOT NULL DEFAULT 'USD',
  theme                  ENUM('light','dark','system') NOT NULL DEFAULT 'system',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         CHAR(36)  PRIMARY KEY,
  user_id    CHAR(36)  NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expires_at DATETIME  NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
