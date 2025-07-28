import os
import sys
import re
import gzip
import glob
import MySQLdb
from datetime import datetime
import geoip2.database

DB_CONFIG = {
    'host': '',
    'user': '',
    'passwd': '',
    'db': '',
    'charset': 'utf8mb4'
}

GEOIP_DB = "/usr/share/GeoIP/GeoLite2-City.mmdb"

LOG_PATTERN = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<time>[^\]]+)\] "(?P<request>[^"]+)" (?P<status>\d+) \d+ "[^"]*" "(?P<agent>[^"]+)"'
)

TABLES = {
    "summary": "access_summary",
    "daily": "access_daily",
    "detail": "access_detail",
    "logs": "access_logs"
}

def shorten_agent(agent):
    agent = agent.lower()
    if "curl" in agent:
        return "curl"
    elif "wget" in agent:
        return "wget"
    elif "mozilla" in agent:
        return "Mozilla"
    elif "python" in agent:
        return "Python"
    return agent.split('/')[0][:100]

def get_geo(ip, reader):
    try:
        response = reader.city(ip)
        country = response.country.name or "Unknown"
        city = response.city.name or "-"
        return country, city
    except:
        return "Unknown", "-"

def init_db(conn):
    cur = conn.cursor()

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS access_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45),
            access_time DATETIME,
            request TEXT,
            user_agent VARCHAR(100),
            country VARCHAR(100),
            city VARCHAR(100)
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {TABLES["summary"]} (
            ip VARCHAR(45) PRIMARY KEY,
            count INT DEFAULT 1,
            last_access DATETIME,
            user_agent VARCHAR(100),
            country VARCHAR(100),
            city VARCHAR(100)
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {TABLES["daily"]} (
            ip VARCHAR(45),
            date DATE,
            count INT DEFAULT 1,
            PRIMARY KEY (ip, date)
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {TABLES["detail"]} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45),
            access_time DATETIME,
            request TEXT,
            user_agent VARCHAR(100),
            country VARCHAR(100),
            city VARCHAR(100)
        )
    """)

    conn.commit()

def parse_log_file(file_path, conn, geo_reader):
    print(f"[INFO] Processing: {file_path}")
    open_func = gzip.open if file_path.endswith(".gz") else open

    with open_func(file_path, 'rt', encoding='utf-8', errors='ignore') as f:
        for line in f:
            match = LOG_PATTERN.search(line)
            if not match or match.group('status') != "200":
                continue

            ip = match.group('ip')
            request = match.group('request')
            request = re.sub(r'\sHTTP\/[0-9\.]+$', '', request)
            user_agent = shorten_agent(match.group('agent'))
            country, city = get_geo(ip, geo_reader)

            log_time_str = match.group('time')
            access_time = datetime.strptime(log_time_str, "%d/%b/%Y:%H:%M:%S %z")
            datetime_str = access_time.strftime("%Y-%m-%d %H:%M:%S")
            date_str = access_time.strftime("%Y-%m-%d")

            cur = conn.cursor()

            cur.execute(f"""
                INSERT INTO {TABLES['logs']} (ip, access_time, request, user_agent, country, city)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (ip, datetime_str, request, user_agent, country, city))

            cur.execute(f"SELECT count FROM {TABLES['summary']} WHERE ip = %s", (ip,))
            if cur.fetchone():
                cur.execute(f"""
                    UPDATE {TABLES['summary']}
                    SET count = count + 1, last_access = %s, user_agent = %s, country = %s, city = %s
                    WHERE ip = %s
                """, (datetime_str, user_agent, country, city, ip))
            else:
                cur.execute(f"""
                    INSERT INTO {TABLES['summary']} (ip, count, last_access, user_agent, country, city)
                    VALUES (%s, 1, %s, %s, %s, %s)
                """, (ip, datetime_str, user_agent, country, city))

            cur.execute(f"SELECT count FROM {TABLES['daily']} WHERE ip = %s AND date = %s", (ip, date_str))
            if cur.fetchone():
                cur.execute(f"""
                    UPDATE {TABLES['daily']} SET count = count + 1 WHERE ip = %s AND date = %s
                """, (ip, date_str))
            else:
                cur.execute(f"""
                    INSERT INTO {TABLES['daily']} (ip, date, count)
                    VALUES (%s, %s, 1)
                """, (ip, date_str))

            cur.execute(f"""
                INSERT INTO {TABLES['detail']} (ip, access_time, request, user_agent, country, city)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (ip, datetime_str, request, user_agent, country, city))

            conn.commit()

def main():
    conn = MySQLdb.connect(**DB_CONFIG)
    init_db(conn)

    if len(sys.argv) > 1:
        log_files = [os.path.join("/var/log/apache2", sys.argv[1])]
    else:
        log_files = sorted(glob.glob("/var/log/apache2/access.log.*"))

    with geoip2.database.Reader(GEOIP_DB) as geo_reader:
        for log_file in log_files:
            parse_log_file(log_file, conn, geo_reader)

    conn.close()
    print("[完了] データベースへの記録が完了しました。")

if __name__ == "__main__":
    main()