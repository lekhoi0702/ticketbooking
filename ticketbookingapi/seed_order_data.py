import pymysql
import random
from datetime import datetime, timedelta

def seed_order_data():
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
        # Get customers (role_id = 3)
        cursor.execute("SELECT user_id, email FROM User WHERE role_id = 3 LIMIT 20")
        customers = cursor.fetchall()
        
        # Get events with ticket types
        cursor.execute("""
            SELECT e.event_id, e.event_name, tt.ticket_type_id, tt.type_name, tt.price, tt.quantity
            FROM Event e
            JOIN TicketType tt ON e.event_id = tt.event_id
            WHERE e.status IN ('PUBLISHED', 'APPROVED')
            LIMIT 10
        """)
        events_tickets = cursor.fetchall()
        
        if not customers:
            print("❌ No customers found! Please seed users first.")
            return
        
        if not events_tickets:
            print("❌ No events with tickets found!")
            return
        
        print(f"Found {len(customers)} customers and {len(events_tickets)} event-ticket combinations\n")
        
        # Order statuses with weights (matching schema: PENDING, PAID, CANCELLED, REFUNDED, COMPLETED, CANCELLATION_PENDING)
        order_statuses = [
            ('PENDING', 0.1),
            ('PAID', 0.2),
            ('COMPLETED', 0.6),
            ('CANCELLED', 0.1)
        ]
        
        # Payment methods (matching schema: CREDIT_CARD, BANK_TRANSFER, E_WALLET, MOMO, VNPAY, CASH)
        payment_methods = ['VNPAY', 'MOMO', 'E_WALLET', 'BANK_TRANSFER']
        
        orders_created = 0
        tickets_created = 0
        payments_created = 0
        
        # Create 30 sample orders
        for i in range(30):
            # Random customer
            customer = random.choice(customers)
            customer_id, customer_email = customer
            
            # Random event and ticket type
            event_data = random.choice(events_tickets)
            event_id, event_name, ticket_type_id, ticket_type_name, price, max_quantity = event_data
            
            # Random number of tickets (1-5)
            num_tickets = random.randint(1, min(5, max_quantity))
            total_amount = float(price) * num_tickets
            
            # Random order date (last 30 days)
            days_ago = random.randint(0, 30)
            order_date = datetime.now() - timedelta(days=days_ago)
            
            # Select order status
            status = random.choices(
                [s[0] for s in order_statuses],
                weights=[s[1] for s in order_statuses]
            )[0]
            
            # Generate unique order code
            order_code = f"ORD{datetime.now().strftime('%Y%m%d')}{random.randint(10000, 99999)}"
            
            # Create order (no event_id in Order table)
            order_sql = """
            INSERT INTO `Order` (user_id, order_code, total_amount, final_amount, order_status, 
                                customer_name, customer_email, created_at, paid_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            paid_at = order_date if status in ('PAID', 'COMPLETED') else None
            
            cursor.execute(order_sql, (
                customer_id,
                order_code,
                total_amount,
                total_amount,  # final_amount same as total for now
                status,
                customer_email.split('@')[0],  # Simple name from email
                customer_email,
                order_date,
                paid_at
            ))
            order_id = cursor.lastrowid
            orders_created += 1
            
            # Create tickets for this order
            for j in range(num_tickets):
                ticket_code = f"TKT{order_id:06d}{j+1:02d}"
                # Ticket status: ACTIVE, USED, CANCELLED, REFUNDED
                if status == 'COMPLETED':
                    ticket_status = 'ACTIVE'
                elif status == 'CANCELLED':
                    ticket_status = 'CANCELLED'
                elif status == 'REFUNDED':
                    ticket_status = 'REFUNDED'
                else:
                    ticket_status = 'ACTIVE'
                
                ticket_sql = """
                INSERT INTO Ticket (order_id, ticket_type_id, ticket_code, ticket_status, price, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(ticket_sql, (
                    order_id,
                    ticket_type_id,
                    ticket_code,
                    ticket_status,
                    price,
                    order_date
                ))
                tickets_created += 1
            
            # Create payment record
            payment_method = random.choice(payment_methods)
            
            # Payment status based on order status (PENDING, SUCCESS, FAILED, REFUNDED)
            if status in ('COMPLETED', 'PAID'):
                payment_status = 'SUCCESS'
            elif status == 'CANCELLED':
                payment_status = random.choice(['FAILED', 'REFUNDED'])
            elif status == 'REFUNDED':
                payment_status = 'REFUNDED'
            else:
                payment_status = 'PENDING'
            
            # Generate unique payment code
            payment_code = f"PAY{datetime.now().strftime('%Y%m%d')}{random.randint(10000, 99999)}"
            transaction_id = f"{payment_method}_{order_id}_{random.randint(100000, 999999)}"
            payment_date = order_date + timedelta(minutes=random.randint(1, 30)) if payment_status == 'SUCCESS' else None
            
            payment_sql = """
            INSERT INTO Payment (order_id, payment_code, amount, payment_method, payment_status, 
                               transaction_id, payment_date, paid_at, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(payment_sql, (
                order_id,
                payment_code,
                total_amount,
                payment_method,
                payment_status,
                transaction_id,
                payment_date,
                payment_date,
                order_date
            ))
            payments_created += 1
            
            print(f"✓ Order #{order_id}: {customer_email} - {event_name} - {num_tickets} tickets - {status}")
        
        conn.commit()
        
        print(f"\n{'='*80}")
        print(f"✅ Successfully created:")
        print(f"   - {orders_created} orders")
        print(f"   - {tickets_created} tickets")
        print(f"   - {payments_created} payments")
        print(f"{'='*80}")
        
        # Show summary statistics
        cursor.execute("""
            SELECT order_status, COUNT(*) as count, SUM(total_amount) as total
            FROM `Order`
            GROUP BY order_status
        """)
        print("\nOrder Statistics:")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]} orders, Total: {row[2]:,.0f} VND")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_order_data()
