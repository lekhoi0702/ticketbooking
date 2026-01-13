import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_seating():
    try:
        host = os.getenv('DB_HOST')
        user = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        database = os.getenv('DB_NAME')
        port = int(os.getenv('DB_PORT', 20325))
        
        print(f"Connecting to {host}:{port} for seating migration...")
        
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            ssl={'ssl': {}}
        )
        
        with conn.cursor() as cursor:
            # 1. Create Seat table
            print("Creating Seat table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Seat (
                    seat_id INT AUTO_INCREMENT PRIMARY KEY,
                    ticket_type_id INT NOT NULL,
                    row_name VARCHAR(10) NOT NULL,
                    seat_number VARCHAR(10) NOT NULL,
                    status ENUM('AVAILABLE', 'LOCKED', 'BOOKED', 'RESERVED') DEFAULT 'AVAILABLE',
                    is_active BOOLEAN DEFAULT TRUE,
                    x_pos INT,
                    y_pos INT,
                    INDEX (ticket_type_id),
                    INDEX (status),
                    FOREIGN KEY (ticket_type_id) REFERENCES TicketType(ticket_type_id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            # 2. Add seat_id to Ticket table
            print("Checking Ticket table for seat_id...")
            cursor.execute("SHOW COLUMNS FROM Ticket LIKE 'seat_id'")
            if not cursor.fetchone():
                print("Adding seat_id column to Ticket...")
                cursor.execute("ALTER TABLE Ticket ADD COLUMN seat_id INT AFTER ticket_status")
                cursor.execute("ALTER TABLE Ticket ADD CONSTRAINT fk_ticket_seat FOREIGN KEY (seat_id) REFERENCES Seat(seat_id)")
                cursor.execute("CREATE INDEX idx_ticket_seat ON Ticket(seat_id)")

            conn.commit()
            print("Seating migration completed successfully!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    migrate_seating()
