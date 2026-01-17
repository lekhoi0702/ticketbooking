import pymysql
import os

def seed_organizer_info():
    # Use direct pymysql to avoid flask environment issues
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
        # Get all organizers
        cursor.execute("SELECT user_id, full_name FROM User WHERE role_id = 2")
        organizers = cursor.fetchall()
        
        organizer_data = [
            {
                'user_id': organizers[0][0],
                'org_name': 'Công ty Giải trí Việt (V-Entertainment)',
                'desc': 'Chúng tôi chuyên tổ chức các sự kiện âm nhạc và biểu diễn nghệ thuật hàng đầu Việt Nam.',
                'website': 'https://ventertainment.vn',
                'address': '123 Lê Lợi, Quận 1, TP. HCM'
            },
            {
                'user_id': organizers[1][0],
                'org_name': 'Sân khấu Kịch IDECAF',
                'desc': 'Sân khấu kịch nói uy tín tại Thành phố Hồ Chí Minh với nhiều tác phẩm kinh điển.',
                'website': 'http://idecaf.com.vn',
                'address': '28 Lê Thánh Tôn, Quận 1, TP. HCM'
            },
            {
                'user_id': organizers[2][0],
                'org_name': 'Liên đoàn Bóng đá Việt Nam (VFF)',
                'desc': 'Đơn vị quản lý và tổ chức các trận đấu bóng đá chuyên nghiệp cấp quốc gia.',
                'website': 'https://vff.org.vn',
                'address': 'Đường Lê Quang Đạo, Mỹ Đình, Nam Từ Liêm, Hà Nội'
            },
            {
                'user_id': organizers[3][0] if len(organizers) > 3 else None,
                'org_name': 'Trung tâm Văn hóa - Thể thao Quận 7',
                'desc': 'Địa điểm tổ chức các hoạt động văn hóa, thể thao cộng đồng đa dạng.',
                'website': 'https://ttvhttq7.vn',
                'address': '71 Nguyễn Thị Thập, Tân Phú, Quận 7, TP. HCM'
            },
            {
                'user_id': organizers[4][0] if len(organizers) > 4 else None,
                'org_name': 'Nhà hát Lớn Hà Nội',
                'desc': 'Biểu tượng văn hóa của thủ đô, nơi diễn ra các chương trình nghệ thuật đỉnh cao.',
                'website': 'http://hanoioperahouse.org.vn',
                'address': '1 Tràng Tiền, Phan Chu Trinh, Hoàn Kiếm, Hà Nội'
            }
        ]
        
        # Clear existing info
        cursor.execute("DELETE FROM OrganizerInfo")
        
        for data in organizer_data:
            if data['user_id']:
                sql = """
                INSERT INTO OrganizerInfo (user_id, organization_name, description, website, address, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                """
                cursor.execute(sql, (data['user_id'], data['org_name'], data['desc'], data['website'], data['address']))
        
        conn.commit()
        print("Successfully seeded OrganizerInfo!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error seeding data: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_organizer_info()
