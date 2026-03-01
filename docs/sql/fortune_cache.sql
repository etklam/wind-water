CREATE TABLE IF NOT EXISTS fortune_cache (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cache_key VARCHAR(191) NOT NULL,
  mode VARCHAR(16) NOT NULL,
  year INT NULL,
  gender VARCHAR(16) NOT NULL DEFAULT '',
  focus_area VARCHAR(128) NOT NULL DEFAULT '',
  request_payload JSON NULL,
  response_text LONGTEXT NOT NULL,
  model VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_fortune_cache_scope (cache_key, mode, year, gender, focus_area)
);
