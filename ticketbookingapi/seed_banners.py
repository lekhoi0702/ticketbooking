import pymysql

def seed_banners():
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
        banners = [
            {
                'title': 'Đại Nhạc Hội Mùa Hè 2026',
                'url': 'https://images.unsplash.com/photo-1459749411177-042180ce673b?w=1600&h=600&fit=crop',
                'link': '/category/1',
                'order': 0
            },
            {
                'title': 'Kịch Nói Kinh Điển - Sân Khấu IDECAF',
                'url': 'https://images.unsplash.com/photo-1503095396549-807a8bc3667c?w=1600&h=600&fit=crop',
                'link': '/category/2',
                'order': 1
            },
            {
                'title': 'Giải Bóng Đá Vô Địch Quốc Gia',
                'url': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&h=600&fit=crop',
                'link': '/category/3',
                'order': 2
            }
        ]
        
        # Already cleared in previous step, but let's be sure
        cursor.execute("DELETE FROM Banner")
        
        for b in banners:
            sql = """
            INSERT INTO Banner (image_url, title, link, is_active, `order`, created_at)
            VALUES (%s, %s, %s, 1, %s, NOW())
            """
            cursor.execute(sql, (b['url'], b['title'], b['link'], b['order']))
            
        conn.commit()
        print("Successfully seeded Banners with Unsplash images!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error seeding banners: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_banners()
