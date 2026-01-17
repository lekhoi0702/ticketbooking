import pymysql

def update_organizer_info():
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
        cursor.execute("""
            SELECT oi.organizer_id, oi.user_id, oi.organization_name, u.full_name, u.email
            FROM OrganizerInfo oi
            JOIN User u ON oi.user_id = u.user_id
        """)
        organizers = cursor.fetchall()
        
        print(f"Found {len(organizers)} organizers\n")
        
        # Enhanced organizer data with phone numbers and more details
        enhanced_data = [
            {
                'user_id': organizers[0][1],
                'phone': '028 3822 5678',
                'description': 'Công ty Giải trí Việt (V-Entertainment) là đơn vị hàng đầu trong lĩnh vực tổ chức sự kiện âm nhạc và biểu diễn nghệ thuật tại Việt Nam. Với hơn 10 năm kinh nghiệm, chúng tôi đã tổ chức thành công hàng trăm concert, liveshow và festival quy mô lớn.',
                'social_facebook': 'https://facebook.com/ventertainment',
                'social_instagram': 'https://instagram.com/ventertainment',
                'tax_code': '0123456789',
                'bank_account': 'Vietcombank - 1234567890',
            },
            {
                'user_id': organizers[1][1],
                'phone': '028 3930 3588',
                'description': 'Sân khấu Kịch IDECAF là một trong những sân khấu kịch nói uy tín nhất tại TP. Hồ Chí Minh. Chúng tôi chuyên dựng các vở kịch kinh điển và đương đại, mang đến cho khán giả những trải nghiệm nghệ thuật đỉnh cao.',
                'social_facebook': 'https://facebook.com/idecaf',
                'social_instagram': 'https://instagram.com/idecaf_theater',
                'tax_code': '0123456790',
                'bank_account': 'Techcombank - 9876543210',
            },
            {
                'user_id': organizers[2][1],
                'phone': '024 3733 7979',
                'description': 'Liên đoàn Bóng đá Việt Nam (VFF) là cơ quan quản lý và tổ chức các giải đấu bóng đá chuyên nghiệp tại Việt Nam. Chúng tôi cam kết mang đến những trận cầu đỉnh cao và phát triển bóng đá Việt Nam.',
                'social_facebook': 'https://facebook.com/vff.org.vn',
                'social_instagram': 'https://instagram.com/vff_official',
                'tax_code': '0123456791',
                'bank_account': 'BIDV - 5555666677',
            },
            {
                'user_id': organizers[3][1] if len(organizers) > 3 else None,
                'phone': '028 5413 3456',
                'description': 'Trung tâm Văn hóa - Thể thao Quận 7 là địa điểm tổ chức các hoạt động văn hóa, thể thao cộng đồng đa dạng. Chúng tôi phục vụ cộng đồng với các chương trình chất lượng cao và ý nghĩa.',
                'social_facebook': 'https://facebook.com/ttvhttq7',
                'social_instagram': 'https://instagram.com/ttvhttq7',
                'tax_code': '0123456792',
                'bank_account': 'ACB - 8888999900',
            },
            {
                'user_id': organizers[4][1] if len(organizers) > 4 else None,
                'phone': '024 3933 0113',
                'description': 'Nhà hát Lớn Hà Nội là biểu tượng văn hóa của thủ đô, nơi diễn ra các chương trình nghệ thuật đỉnh cao. Với kiến trúc Pháp cổ điển tráng lệ, chúng tôi tự hào là sân khấu hàng đầu Việt Nam.',
                'social_facebook': 'https://facebook.com/hanoioperahouse',
                'social_instagram': 'https://instagram.com/hanoi_opera_house',
                'tax_code': '0123456793',
                'bank_account': 'Vietinbank - 3333444455',
            }
        ]
        
        for data in enhanced_data:
            if data['user_id']:
                sql = """
                UPDATE OrganizerInfo 
                SET description = %s,
                    contact_phone = %s,
                    social_facebook = %s,
                    social_instagram = %s,
                    tax_code = %s,
                    bank_account = %s,
                    updated_at = NOW()
                WHERE user_id = %s
                """
                cursor.execute(sql, (
                    data['description'],
                    data['phone'],
                    data['social_facebook'],
                    data['social_instagram'],
                    data['tax_code'],
                    data['bank_account'],
                    data['user_id']
                ))
                print(f"✓ Updated organizer info for user_id: {data['user_id']}")
        
        conn.commit()
        print(f"\n✅ Successfully updated {len(enhanced_data)} organizer profiles!")
        
        # Display updated data
        print("\n" + "="*80)
        print("UPDATED ORGANIZER INFO:")
        print("="*80)
        cursor.execute("""
            SELECT oi.organization_name, oi.contact_phone, oi.website, 
                   oi.social_facebook, oi.tax_code
            FROM OrganizerInfo oi
        """)
        for row in cursor.fetchall():
            print(f"\nOrg: {row[0]}")
            print(f"  Phone: {row[1]}")
            print(f"  Website: {row[2]}")
            print(f"  Facebook: {row[3]}")
            print(f"  Tax Code: {row[4]}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    update_organizer_info()
