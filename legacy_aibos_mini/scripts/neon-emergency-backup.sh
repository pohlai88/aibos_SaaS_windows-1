#!/bin/bash
# Neon Emergency Backup Script (Production-Ready)
# Backs up the last 15 days of data from Supabase to Neon (for contingency use)
# Usage: Set environment variables and run manually or via cron
#
# --- ENVIRONMENT VARIABLES ---
# SUPABASE_HOST: Supabase PostgreSQL host
# SUPABASE_USER: Supabase PostgreSQL user
# SUPABASE_DB:   Supabase PostgreSQL database name
# SUPABASE_PASS: Supabase PostgreSQL password
# NEON_HOST:     Neon PostgreSQL host
# NEON_USER:     Neon PostgreSQL user
# NEON_DB:       Neon PostgreSQL database name
# NEON_PASS:     Neon PostgreSQL password
# TABLES:        Space-separated list of tables to back up (e.g. "table1 table2 table3")
# BACKUP_DIR:    Directory to store backup files (default: ./neon_backups)
# LOG_FILE:      Log file path (default: ./neon_backup.log)
# EXCLUDE_TABLES: Space-separated list of tables to exclude (optional)
# EMAIL_ON_FAIL: Email address to notify on failure (optional)
#
# --- SCHEDULING ---
# To run daily at 2am, add to crontab:
# 0 2 * * * /path/to/neon-emergency-backup.sh >> /path/to/cron.log 2>&1
#
# --- END ENVIRONMENT VARIABLES ---

set -e
set -o pipefail

# --- CONFIGURATION ---
SUPABASE_HOST=${SUPABASE_HOST:-"your_supabase_host"}
SUPABASE_USER=${SUPABASE_USER:-"your_supabase_user"}
SUPABASE_DB=${SUPABASE_DB:-"your_supabase_db"}
SUPABASE_PASS=${SUPABASE_PASS:-"your_supabase_password"}
NEON_HOST=${NEON_HOST:-"your_neon_host"}
NEON_USER=${NEON_USER:-"your_neon_user"}
NEON_DB=${NEON_DB:-"your_neon_db"}
NEON_PASS=${NEON_PASS:-"your_neon_password"}
TABLES=(${TABLES:-"table1 table2 table3"})
BACKUP_DIR=${BACKUP_DIR:-"./neon_backups"}
LOG_FILE=${LOG_FILE:-"./neon_backup.log"}
EXCLUDE_TABLES=(${EXCLUDE_TABLES:-""})
EMAIL_ON_FAIL=${EMAIL_ON_FAIL:-""}
LOG_RETENTION=7

# --- FUNCTIONS ---
function error_exit {
  echo "[$(date)] ERROR: $1" | tee -a "$LOG_FILE"
  if [[ -n "$EMAIL_ON_FAIL" ]]; then
    echo "Neon backup failed: $1" | mail -s "[ALERT] Neon Emergency Backup Failed" "$EMAIL_ON_FAIL"
  fi
  exit 1
}

function check_env {
  local missing=()
  for var in SUPABASE_HOST SUPABASE_USER SUPABASE_DB SUPABASE_PASS NEON_HOST NEON_USER NEON_DB NEON_PASS; do
    if [[ -z "${!var}" ]]; then
      missing+=("$var")
    fi
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    error_exit "Missing required environment variables: ${missing[*]}"
  fi
}

function rotate_logs {
  # Keep only the last $LOG_RETENTION logs
  local base_log="${LOG_FILE%.*}"
  for ((i=LOG_RETENTION-1; i>=1; i--)); do
    if [[ -f "$base_log.$i.log" ]]; then
      mv "$base_log.$i.log" "$base_log.$((i+1)).log"
    fi
  done
  if [[ -f "$LOG_FILE" ]]; then
    mv "$LOG_FILE" "$base_log.1.log"
  fi
}

# --- SCRIPT START ---
rotate_logs
check_env
mkdir -p "$BACKUP_DIR"
echo "[$(date)] Starting Neon emergency backup..." | tee -a "$LOG_FILE"

SUCCESS_TABLES=()
FAILED_TABLES=()

for TABLE in "${TABLES[@]}"; do
  # Skip excluded tables
  if [[ " ${EXCLUDE_TABLES[@]} " =~ " $TABLE " ]]; then
    echo "[$(date)] Skipping excluded table: $TABLE" | tee -a "$LOG_FILE"
    continue
  fi
  BACKUP_FILE="$BACKUP_DIR/backup_${TABLE}_$(date +%F).sql"
  echo "[$(date)] Exporting $TABLE from Supabase..." | tee -a "$LOG_FILE"
  PGPASSWORD=$SUPABASE_PASS pg_dump \
    --host=$SUPABASE_HOST \
    --username=$SUPABASE_USER \
    --dbname=$SUPABASE_DB \
    --data-only \
    --table=$TABLE \
    --column-inserts \
    --file=$BACKUP_FILE \
    --where="created_at >= NOW() - INTERVAL '15 days'" || {
      echo "[$(date)] ERROR: Failed to export $TABLE from Supabase." | tee -a "$LOG_FILE"
      FAILED_TABLES+=("$TABLE")
      continue
    }

  echo "[$(date)] Importing $TABLE into Neon..." | tee -a "$LOG_FILE"
  PGPASSWORD=$NEON_PASS psql \
    --host=$NEON_HOST \
    --username=$NEON_USER \
    --dbname=$NEON_DB \
    -f $BACKUP_FILE || {
      echo "[$(date)] ERROR: Failed to import $TABLE into Neon." | tee -a "$LOG_FILE"
      FAILED_TABLES+=("$TABLE")
      continue
    }

  SUCCESS_TABLES+=("$TABLE")
done

echo "[$(date)] Neon emergency backup completed." | tee -a "$LOG_FILE"
echo "[$(date)] Success: ${SUCCESS_TABLES[*]}" | tee -a "$LOG_FILE"
echo "[$(date)] Failed: ${FAILED_TABLES[*]}" | tee -a "$LOG_FILE"

if [[ ${#FAILED_TABLES[@]} -gt 0 ]]; then
  error_exit "Backup completed with errors. Failed tables: ${FAILED_TABLES[*]}"
fi

echo "[$(date)] All tables backed up and imported successfully." | tee -a "$LOG_FILE"

# --- END --- 