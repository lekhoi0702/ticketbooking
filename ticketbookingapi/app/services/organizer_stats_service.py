from sqlalchemy import text
from app.extensions import db
from datetime import datetime

class OrganizerStatsService:
    @staticmethod
    def get_dashboard_stats(manager_id):
        # 1. Total Revenue
        # Revenue from paid orders containing tickets for events managed by this organizer
        rev_sql = text("""
            SELECT COALESCE(SUM(t.price), 0) as total_revenue
            FROM tickets t
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            JOIN orders o ON t.order_id = o.order_id
            WHERE e.manager_id = :mid
            AND o.order_status = 'PAID'
            AND t.ticket_status IN ('ACTIVE', 'USED')
        """)
        total_revenue = db.session.execute(rev_sql, {"mid": manager_id}).scalar()

        # 2. Total Tickets Sold
        sold_sql = text("""
            SELECT COALESCE(SUM(sold_tickets), 0) 
            FROM events WHERE manager_id = :mid
        """)
        total_tickets_sold = db.session.execute(sold_sql, {"mid": manager_id}).scalar()
        
        # 3. Ongoing Events
        ongoing_sql = text("""
            SELECT COUNT(*) FROM events 
            WHERE manager_id = :mid AND status IN ('PUBLISHED', 'ONGOING')
        """)
        ongoing_events = db.session.execute(ongoing_sql, {"mid": manager_id}).scalar()
        
        # 4. Recent Orders
        # This is tricky because an order might contain tickets from multiple organizers.
        # But usually user sees orders relevant to them.
        # Logic: Select orders that have at least one ticket for an event managed by this organizer.
        recent_orders_sql = text("""
            SELECT DISTINCT o.order_id, o.order_code, o.total_amount, o.order_status, 
                   o.created_at, e.event_name, o.customer_name, o.customer_email,
                   p.payment_method
            FROM orders o
            JOIN tickets t ON o.order_id = t.order_id
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE e.manager_id = :mid
            ORDER BY o.created_at DESC
            LIMIT 10
        """)
        
        recent_rows = db.session.execute(recent_orders_sql, {"mid": manager_id}).fetchall()
        
        orders_list = []
        for row in recent_rows:
            # Row mapping
            orders_list.append({
                'order_id': row.order_id,
                'order_code': row.order_code,
                'event_name': row.event_name,
                'customer_name': row.customer_name,
                'customer_email': row.customer_email,
                'total_amount': float(row.total_amount),
                'status': row.order_status,
                'payment_method': row.payment_method,
                'created_at': row.created_at.isoformat() if row.created_at else None
            })
            
        return {
            'total_revenue': float(total_revenue),
            'total_tickets_sold': int(total_tickets_sold),
            'ongoing_events': ongoing_events,
            'recent_orders': orders_list
        }

    @staticmethod
    def get_organizer_stats_detailed(manager_id):
        # Revenue
        rev_sql = text("""
            SELECT COALESCE(SUM(t.price), 0)
            FROM tickets t
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            WHERE e.manager_id = :mid
            AND t.ticket_status IN ('ACTIVE', 'USED')
        """)
        total_revenue = db.session.execute(rev_sql, {"mid": manager_id}).scalar()
            
        # Sold Tickets
        sold_sql = text("""
            SELECT COUNT(t.ticket_id)
            FROM tickets t
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            WHERE e.manager_id = :mid
            AND t.ticket_status IN ('ACTIVE', 'USED')
        """)
        total_tickets_sold = db.session.execute(sold_sql, {"mid": manager_id}).scalar()
            
        # Refunded
        ref_sql = text("""
            SELECT COUNT(t.ticket_id)
            FROM tickets t
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            WHERE e.manager_id = :mid
            AND t.ticket_status IN ('REFUNDED', 'CANCELLED')
        """)
        refunded_tickets = db.session.execute(ref_sql, {"mid": manager_id}).scalar()
            
        # Total Events
        evt_sql = text("SELECT COUNT(*) FROM events WHERE manager_id = :mid")
        total_events = db.session.execute(evt_sql, {"mid": manager_id}).scalar()

        # Best Selling
        best_sql = text("""
            SELECT e.event_id, e.event_name, e.total_capacity, COUNT(t.ticket_id) as sold_count
            FROM events e
            JOIN ticket_types tt ON e.event_id = tt.event_id
            JOIN tickets t ON tt.ticket_type_id = t.ticket_type_id
            WHERE e.manager_id = :mid
            AND t.ticket_status IN ('ACTIVE', 'USED')
            GROUP BY e.event_id
            ORDER BY sold_count DESC
            LIMIT 5
        """)
        best_rows = db.session.execute(best_sql, {"mid": manager_id}).fetchall()
        
        best_selling_data = [{
            'event_id': r.event_id,
            'event_name': r.event_name,
            'sold_tickets': r.sold_count,
            'total_capacity': r.total_capacity,
            'fill_rate': round((r.sold_count / r.total_capacity * 100), 1) if r.total_capacity > 0 else 0
        } for r in best_rows]

        # Highest Revenue
        hrev_sql = text("""
            SELECT e.event_id, e.event_name, SUM(t.price) as revenue
            FROM events e
            JOIN ticket_types tt ON e.event_id = tt.event_id
            JOIN tickets t ON tt.ticket_type_id = t.ticket_type_id
            WHERE e.manager_id = :mid
            AND t.ticket_status IN ('ACTIVE', 'USED')
            GROUP BY e.event_id
            ORDER BY revenue DESC
            LIMIT 5
        """)
        hrev_rows = db.session.execute(hrev_sql, {"mid": manager_id}).fetchall()

        revenue_data = [{
            'event_id': r.event_id,
            'event_name': r.event_name,
            'revenue': float(r.revenue or 0)
        } for r in hrev_rows]
        
        return {
            'total_revenue': float(total_revenue),
            'total_tickets_sold': total_tickets_sold,
            'refunded_tickets': refunded_tickets,
            'total_events': total_events,
            'best_selling_events': best_selling_data,
            'revenue_events': revenue_data
        }

    @staticmethod
    def get_organizer_orders_paginated(manager_id, search, page, per_page):
        # Base query structure for counting and data
        # We need orders that contain tickets for this manager's events
        
        # 1. Count Total
        count_sql_str = """
            SELECT COUNT(DISTINCT o.order_id)
            FROM orders o
            JOIN tickets t ON o.order_id = t.order_id
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            WHERE e.manager_id = :mid
        """
        
        params = {"mid": manager_id}
        
        if search:
            count_sql_str += """
                AND (
                    o.order_code LIKE :search OR
                    o.customer_name LIKE :search OR
                    o.customer_email LIKE :search OR
                    o.customer_phone LIKE :search
                )
            """
            params['search'] = f"%{search}%"
            
        total_items = db.session.execute(text(count_sql_str), params).scalar()
        
        # 2. Fetch Page Data
        offset = (page - 1) * per_page
        
        data_sql_str = """
            SELECT DISTINCT o.*
            FROM orders o
            JOIN tickets t ON o.order_id = t.order_id
            JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN events e ON tt.event_id = e.event_id
            WHERE e.manager_id = :mid
        """
        
        if search:
            data_sql_str += """
                AND (
                    o.order_code LIKE :search OR
                    o.customer_name LIKE :search OR
                    o.customer_email LIKE :search OR
                    o.customer_phone LIKE :search
                )
            """
            
        data_sql_str += " ORDER BY o.created_at DESC LIMIT :limit OFFSET :offset"
        
        params['limit'] = per_page
        params['offset'] = offset
        
        # Execute main query
        orders_rows = db.session.execute(text(data_sql_str), params).fetchall()
        
        orders_data = []
        for orow in orders_rows:
            # Check Order ID
            oid = orow.order_id
            
            # Fetch tickets for this order AND this manager (to calculate correct revenue/count for THIS manager)
            # An order might have tickets from multiple managers? 
            # If so, we only show tickets relevant to this manager.
            
            t_sql = text("""
                SELECT t.*, tt.type_name, e.event_name, e.end_datetime
                FROM tickets t
                JOIN ticket_types tt ON t.ticket_type_id = tt.ticket_type_id
                JOIN events e ON tt.event_id = e.event_id
                WHERE t.order_id = :oid AND e.manager_id = :mid
            """)
            
            t_rows = db.session.execute(t_sql, {"oid": oid, "mid": manager_id}).fetchall()
            
            if not t_rows: continue

            org_revenue = sum(float(r.price) for r in t_rows)
            
            ticket_list = []
            for tr in t_rows:
                status = tr.ticket_status
                if status == 'ACTIVE' and tr.end_datetime:
                     end_dt = datetime.fromisoformat(tr.end_datetime) if isinstance(tr.end_datetime, str) else tr.end_datetime
                     if end_dt < datetime.utcnow():
                         status = 'EXPIRED'
                         
                ticket_list.append({
                    'ticket_id': tr.ticket_id,
                    'code': tr.ticket_code,
                    'event': tr.event_name,
                    'type': tr.type_name,
                    'price': float(tr.price),
                    'status': status
                })

            orders_data.append({
                'order_id': orow.order_id,
                'order_code': orow.order_code,
                'customer_name': orow.customer_name or "Unknown",
                'customer_email': orow.customer_email or "N/A",
                'customer_phone': orow.customer_phone,
                'created_at': orow.created_at.isoformat() if orow.created_at else None,
                'status': orow.order_status,
                'revenue': float(org_revenue),
                'ticket_count': len(t_rows),
                'tickets': ticket_list
            })
            
        # Pagination object to mimic Flask-SQLAlchemy Pagination
        class Pagination:
            def __init__(self, total, page, per_page):
                self.total = total
                self.page = page
                self.per_page = per_page
                self.pages = (total + per_page - 1) // per_page
                
        return orders_data, Pagination(total_items, page, per_page)
