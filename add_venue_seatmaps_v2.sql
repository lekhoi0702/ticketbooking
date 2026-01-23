-- =====================================================
-- Script: Thêm Seat Map cho Venues (Format Areas)
-- Dựa trên mẫu venue 120018
-- Format: areas với rows/cols grid
-- =====================================================

USE ticketbookingdb;

-- =====================================================
-- 1. TRUNG TÂM HỘI NGHỊ - 5000 chỗ
-- =====================================================

-- Venue 1: Trung tâm Hội nghị Hồ Chí Minh (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "VIP - Hàng Đầu",
      "rows": 10,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Standard - Giữa",
      "rows": 20,
      "cols": 25,
      "locked_seats": []
    },
    {
      "name": "Economy - Sau",
      "rows": 30,
      "cols": 30,
      "locked_seats": []
    }
  ]
}',
vip_seats = 200,
standard_seats = 500,
economy_seats = 900
WHERE venue_id = 1;

-- Venue 4: Trung tâm Hội nghị Hà Nội (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Orchestra VIP",
      "rows": 12,
      "cols": 22,
      "locked_seats": []
    },
    {
      "name": "Mezzanine",
      "rows": 18,
      "cols": 28,
      "locked_seats": []
    },
    {
      "name": "Upper Circle",
      "rows": 25,
      "cols": 32,
      "locked_seats": []
    }
  ]
}',
vip_seats = 264,
standard_seats = 504,
economy_seats = 800
WHERE venue_id = 4;

-- Venue 7: Trung tâm Hội nghị Đà Nẵng (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Floor VIP",
      "rows": 15,
      "cols": 18,
      "locked_seats": []
    },
    {
      "name": "Lower Bowl",
      "rows": 20,
      "cols": 30,
      "locked_seats": []
    },
    {
      "name": "Upper Bowl",
      "rows": 30,
      "cols": 35,
      "locked_seats": []
    }
  ]
}',
vip_seats = 270,
standard_seats = 600,
economy_seats = 1050
WHERE venue_id = 7;

-- Venue 10: Trung tâm Hội nghị Cần Thơ (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Premium Tables",
      "rows": 40,
      "cols": 10,
      "locked_seats": []
    },
    {
      "name": "Standard Tables",
      "rows": 80,
      "cols": 10,
      "locked_seats": []
    },
    {
      "name": "General Seating",
      "rows": 40,
      "cols": 25,
      "locked_seats": []
    }
  ]
}',
vip_seats = 400,
standard_seats = 800,
economy_seats = 1000
WHERE venue_id = 10;

-- Venue 13: Trung tâm Hội nghị Nha Trang (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Executive Front",
      "rows": 8,
      "cols": 25,
      "locked_seats": []
    },
    {
      "name": "Business Class",
      "rows": 25,
      "cols": 30,
      "locked_seats": []
    },
    {
      "name": "General Admission",
      "rows": 35,
      "cols": 32,
      "locked_seats": []
    }
  ]
}',
vip_seats = 200,
standard_seats = 750,
economy_seats = 1120
WHERE venue_id = 13;

-- Venue 16: Trung tâm Hội nghị Vũng Tàu (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Orchestra Pit",
      "rows": 10,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Terrace Level",
      "rows": 22,
      "cols": 28,
      "locked_seats": []
    },
    {
      "name": "Gallery",
      "rows": 30,
      "cols": 35,
      "locked_seats": []
    }
  ]
}',
vip_seats = 200,
standard_seats = 616,
economy_seats = 1050
WHERE venue_id = 16;

-- Venue 19: Trung tâm Hội nghị Huế (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Field Level VIP",
      "rows": 12,
      "cols": 24,
      "locked_seats": []
    },
    {
      "name": "Club Seats",
      "rows": 8,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Lower Deck",
      "rows": 25,
      "cols": 32,
      "locked_seats": []
    },
    {
      "name": "Upper Deck",
      "rows": 30,
      "cols": 36,
      "locked_seats": []
    }
  ]
}',
vip_seats = 448,
standard_seats = 800,
economy_seats = 1080
WHERE venue_id = 19;

-- Venue 22: Trung tâm Hội nghị Hải Phòng (5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Platinum Zone",
      "rows": 10,
      "cols": 22,
      "locked_seats": []
    },
    {
      "name": "Gold Zone",
      "rows": 12,
      "cols": 24,
      "locked_seats": []
    },
    {
      "name": "Silver Zone",
      "rows": 20,
      "cols": 30,
      "locked_seats": []
    },
    {
      "name": "Bronze Zone",
      "rows": 28,
      "cols": 34,
      "locked_seats": []
    }
  ]
}',
vip_seats = 508,
standard_seats = 600,
economy_seats = 952
WHERE venue_id = 22;

-- =====================================================
-- 2. NHÀ HÁT - 1000 chỗ
-- =====================================================

-- Venue 2: Nhà hát Hồ Chí Minh (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Stalls VIP",
      "rows": 8,
      "cols": 18,
      "locked_seats": []
    },
    {
      "name": "Stalls Standard",
      "rows": 12,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Dress Circle",
      "rows": 6,
      "cols": 22,
      "locked_seats": []
    },
    {
      "name": "Upper Circle",
      "rows": 10,
      "cols": 24,
      "locked_seats": []
    }
  ]
}',
vip_seats = 276,
standard_seats = 240,
economy_seats = 240
WHERE venue_id = 2;

-- Venue 5: Nhà hát Hà Nội (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Parterre VIP",
      "rows": 10,
      "cols": 16,
      "locked_seats": []
    },
    {
      "name": "Grand Tier",
      "rows": 5,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Balcony Tier",
      "rows": 8,
      "cols": 22,
      "locked_seats": []
    },
    {
      "name": "Gallery",
      "rows": 12,
      "cols": 24,
      "locked_seats": []
    }
  ]
}',
vip_seats = 260,
standard_seats = 176,
economy_seats = 288
WHERE venue_id = 5;

-- Venue 8: Nhà hát Đà Nẵng (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Premium Orchestra",
      "rows": 7,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Orchestra",
      "rows": 15,
      "cols": 22,
      "locked_seats": []
    },
    {
      "name": "Mezzanine",
      "rows": 8,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Balcony",
      "rows": 10,
      "cols": 18,
      "locked_seats": []
    }
  ]
}',
vip_seats = 140,
standard_seats = 490,
economy_seats = 180
WHERE venue_id = 8;

-- Venue 11: Nhà hát Cần Thơ (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Front Center",
      "rows": 8,
      "cols": 16,
      "locked_seats": []
    },
    {
      "name": "Side Left",
      "rows": 15,
      "cols": 12,
      "locked_seats": []
    },
    {
      "name": "Side Right",
      "rows": 15,
      "cols": 12,
      "locked_seats": []
    },
    {
      "name": "Rear Risers",
      "rows": 12,
      "cols": 20,
      "locked_seats": []
    }
  ]
}',
vip_seats = 128,
standard_seats = 360,
economy_seats = 240
WHERE venue_id = 11;

-- Venue 14: Nhà hát Nha Trang (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Main Floor VIP",
      "rows": 9,
      "cols": 18,
      "locked_seats": []
    },
    {
      "name": "Main Floor Standard",
      "rows": 14,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Loge Level",
      "rows": 6,
      "cols": 16,
      "locked_seats": []
    },
    {
      "name": "Terrace",
      "rows": 11,
      "cols": 22,
      "locked_seats": []
    }
  ]
}',
vip_seats = 258,
standard_seats = 280,
economy_seats = 242
WHERE venue_id = 14;

-- Venue 17: Nhà hát Vũng Tàu (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Premium Tables",
      "rows": 20,
      "cols": 6,
      "locked_seats": []
    },
    {
      "name": "Standard Tables",
      "rows": 35,
      "cols": 6,
      "locked_seats": []
    },
    {
      "name": "Bar Seating",
      "rows": 3,
      "cols": 30,
      "locked_seats": []
    },
    {
      "name": "General Seating",
      "rows": 10,
      "cols": 25,
      "locked_seats": []
    }
  ]
}',
vip_seats = 120,
standard_seats = 300,
economy_seats = 340
WHERE venue_id = 17;

-- Venue 20: Nhà hát Huế (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Imperial Stalls",
      "rows": 8,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Mandarin Circle",
      "rows": 12,
      "cols": 22,
      "locked_seats": []
    },
    {
      "name": "Upper Gallery",
      "rows": 15,
      "cols": 24,
      "locked_seats": []
    }
  ]
}',
vip_seats = 160,
standard_seats = 264,
economy_seats = 360
WHERE venue_id = 20;

-- Venue 23: Nhà hát Hải Phòng (1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Recliner VIP",
      "rows": 6,
      "cols": 12,
      "locked_seats": []
    },
    {
      "name": "Premium Standard",
      "rows": 10,
      "cols": 18,
      "locked_seats": []
    },
    {
      "name": "Standard",
      "rows": 15,
      "cols": 20,
      "locked_seats": []
    },
    {
      "name": "Economy",
      "rows": 12,
      "cols": 22,
      "locked_seats": []
    }
  ]
}',
vip_seats = 72,
standard_seats = 480,
economy_seats = 264
WHERE venue_id = 23;

-- =====================================================
-- 3. CAFE & EVENT SPACE - 200 chỗ
-- =====================================================

-- Venue 3: Cafe & Event Space Hồ Chí Minh (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Sofa Lounge",
      "rows": 10,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "High Tables",
      "rows": 15,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Regular Tables",
      "rows": 12,
      "cols": 4,
      "locked_seats": []
    }
  ]
}',
vip_seats = 40,
standard_seats = 108,
economy_seats = 52
WHERE venue_id = 3;

-- Venue 6: Cafe & Event Space Hà Nội (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Booth Seating",
      "rows": 12,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Window Tables",
      "rows": 10,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Center Tables",
      "rows": 14,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Counter Seats",
      "rows": 1,
      "cols": 16,
      "locked_seats": []
    }
  ]
}',
vip_seats = 48,
standard_seats = 96,
economy_seats = 16
WHERE venue_id = 6;

-- Venue 9: Cafe & Event Space Đà Nẵng (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Skyline VIP",
      "rows": 8,
      "cols": 6,
      "locked_seats": []
    },
    {
      "name": "Lounge Pods",
      "rows": 10,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Standard Seating",
      "rows": 12,
      "cols": 4,
      "locked_seats": []
    }
  ]
}',
vip_seats = 88,
standard_seats = 48,
economy_seats = 60
WHERE venue_id = 9;

-- Venue 12: Cafe & Event Space Cần Thơ (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Gazebo Seating",
      "rows": 6,
      "cols": 8,
      "locked_seats": []
    },
    {
      "name": "Garden Tables",
      "rows": 18,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Picnic Area",
      "rows": 10,
      "cols": 6,
      "locked_seats": []
    }
  ]
}',
vip_seats = 48,
standard_seats = 72,
economy_seats = 60
WHERE venue_id = 12;

-- Venue 15: Cafe & Event Space Nha Trang (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Cabana VIP",
      "rows": 8,
      "cols": 6,
      "locked_seats": []
    },
    {
      "name": "Deck Seating",
      "rows": 16,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Beach Chairs",
      "rows": 6,
      "cols": 8,
      "locked_seats": []
    }
  ]
}',
vip_seats = 48,
standard_seats = 112,
economy_seats = 40
WHERE venue_id = 15;

-- Venue 18: Cafe & Event Space Vũng Tàu (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Gallery Lounge",
      "rows": 8,
      "cols": 5,
      "locked_seats": []
    },
    {
      "name": "Exhibition Tables",
      "rows": 14,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Workshop Area",
      "rows": 10,
      "cols": 6,
      "locked_seats": []
    }
  ]
}',
vip_seats = 40,
standard_seats = 116,
economy_seats = 44
WHERE venue_id = 18;

-- Venue 21: Cafe & Event Space Huế (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Pavilion Seating",
      "rows": 5,
      "cols": 8,
      "locked_seats": []
    },
    {
      "name": "Courtyard Tables",
      "rows": 16,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Veranda",
      "rows": 8,
      "cols": 8,
      "locked_seats": []
    },
    {
      "name": "Garden Benches",
      "rows": 8,
      "cols": 4,
      "locked_seats": []
    }
  ]
}',
vip_seats = 40,
standard_seats = 128,
economy_seats = 32
WHERE venue_id = 21;

-- Venue 24: Cafe & Event Space Hải Phòng (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{
  "areas": [
    {
      "name": "Mezzanine VIP",
      "rows": 6,
      "cols": 6,
      "locked_seats": []
    },
    {
      "name": "Loft Lounge",
      "rows": 8,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Main Floor",
      "rows": 18,
      "cols": 4,
      "locked_seats": []
    },
    {
      "name": "Communal Table",
      "rows": 2,
      "cols": 16,
      "locked_seats": []
    }
  ]
}',
vip_seats = 68,
standard_seats = 72,
economy_seats = 32
WHERE venue_id = 24;

-- =====================================================
-- Cập nhật thông tin bổ sung
-- =====================================================

UPDATE Venue 
SET 
    vip_seats = COALESCE(vip_seats, 0),
    standard_seats = COALESCE(standard_seats, 0),
    economy_seats = COALESCE(economy_seats, 0)
WHERE seat_map_template IS NOT NULL;

-- =====================================================
-- Kiểm tra kết quả
-- =====================================================

SELECT 
    venue_id,
    venue_name,
    city,
    capacity,
    vip_seats,
    standard_seats,
    economy_seats,
    CASE 
        WHEN seat_map_template IS NOT NULL THEN 'Có'
        ELSE 'Không'
    END as has_seatmap,
    JSON_EXTRACT(seat_map_template, '$.areas[0].name') as first_area_name
FROM Venue
WHERE venue_id <= 24
ORDER BY venue_id;

-- Thống kê tổng quan
SELECT 
    COUNT(*) as total_venues,
    SUM(capacity) as total_capacity,
    SUM(vip_seats) as total_vip_seats,
    SUM(standard_seats) as total_standard_seats,
    SUM(economy_seats) as total_economy_seats,
    COUNT(CASE WHEN seat_map_template IS NOT NULL THEN 1 END) as venues_with_seatmap
FROM Venue
WHERE venue_id <= 24;
