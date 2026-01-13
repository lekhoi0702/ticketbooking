import pymysql

def init_seats_for_demo():
    try:
        # Hardcoded database credentials
        host = 'mysql-3b8d5202-dailyreport.i.aivencloud.com'
        user = 'avnadmin'
        password = 'AVNS_Wyds9xpxDGzYAuRQ8Rm'
        database = 'ticketbookingdb'
        port = 20325
        
        conn = pymysql.connect(
            host=host, user=user, password=password, database=database, port=port,
            charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, ssl={'ssl': {}}
        )
        
        with conn.cursor() as cursor:
            # Get the first ticket type
            cursor.execute("SELECT ticket_type_id, type_name FROM TicketType LIMIT 1")
            tt = cursor.fetchone()
            
            if not tt:
                print("No ticket types found. Please create an event first.")
                return

            tt_id = tt['ticket_type_id']
            print(f"Initializing seats for TicketType ID {tt_id} ({tt['type_name']})...")
            
            # Clear existing seats
            cursor.execute("DELETE FROM Seat WHERE ticket_type_id = %s", (tt_id,))
            
            row_names = "ABCDE"
            seats_per_row = 10
            
            for r in range(len(row_names)):
                row_name = row_names[r]
                for s in range(1, seats_per_row + 1):
                    cursor.execute("""
                        INSERT INTO Seat (ticket_type_id, row_name, seat_number, status, x_pos, y_pos)
                        VALUES (%s, %s, %s, 'AVAILABLE', %s, %s)
                    """, (tt_id, row_name, str(s), s * 40, (r + 1) * 40))
            
            # Update TicketType quantity
            cursor.execute("UPDATE TicketType SET quantity = %s WHERE ticket_type_id = %s", (len(row_names) * seats_per_row, tt_id))
            
            conn.commit()
            print(f"Created {len(row_names) * seats_per_row} seats successfully!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    init_seats_for_demo()
