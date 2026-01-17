from sqlalchemy import create_engine, text

DB_URI = "mysql+pymysql://avnadmin:AVNS_Wyds9xpxDGzYAuRQ8Rm@mysql-3b8d5202-dailyreport.i.aivencloud.com:20325/ticketbookingdb"
engine = create_engine(DB_URI, connect_args={'ssl': {'ssl_mode': 'REQUIRED'}})

with engine.connect() as conn:
    tables = ['User', 'Event', 'Venue', 'Ticket', 'Order', 'Seat']
    print("Database Row Counts:")
    for table in tables:
        result = conn.execute(text(f"SELECT COUNT(*) FROM `{table}`"))
        count = result.scalar()
        print(f"  {table}: {count}")
