import pymysql
import re

def clean_event_names():
    config = {
        'host': 'mysql-3b8d5202-dailyreport.i.aivencloud.com',
        'port': 20325,
        'user': 'avnadmin',
        'password': 'AVNS_Wyds9xpxDGzYAuRQ8Rm',
        'database': 'ticketbookingdb'
    }
    
    conn = pymysql.connect(**config)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT event_id, event_name FROM Event")
        events = cursor.fetchall()
        
        for event_id, name in events:
            # Remove " #number" or "#number" at the end
            new_name = re.sub(r'\s*#\d+$', '', name)
            if new_name != name:
                cursor.execute("UPDATE Event SET event_name = %s WHERE event_id = %s", (new_name, event_id))
                print(f"Updated: {name} -> {new_name}")
        
        conn.commit()
        print("Successfully cleaned event names!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error cleaning names: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    clean_event_names()
