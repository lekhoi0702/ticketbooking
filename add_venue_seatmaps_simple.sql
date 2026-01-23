-- =====================================================
-- Script đơn giản: Thêm Seat Map cho Venues
-- Chạy từng venue một để dễ debug
-- =====================================================

USE ticketbookingdb;

-- Venue 1: Trung tâm Hội nghị Hồ Chí Minh (Auditorium - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"auditorium","total_capacity":5000,"sections":[{"section_id":"VIP_FRONT","section_name":"VIP - Hàng Đầu","zone":"VIP","rows":10,"seats_per_row":20,"start_row":"A","color":"#FFD700","x_offset":150,"y_offset":50},{"section_id":"STANDARD_MIDDLE","section_name":"Standard - Giữa","zone":"Standard","rows":20,"seats_per_row":25,"start_row":"K","color":"#4169E1","x_offset":100,"y_offset":200},{"section_id":"ECONOMY_BACK","section_name":"Economy - Sau","zone":"Economy","rows":30,"seats_per_row":30,"start_row":"AE","color":"#90EE90","x_offset":50,"y_offset":450}],"stage":{"position":"front","width":600,"depth":40}}',
vip_seats = 200,
standard_seats = 500,
economy_seats = 900
WHERE venue_id = 1;

-- Venue 2: Nhà hát Hồ Chí Minh (Theater - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"traditional_theater","total_capacity":1000,"sections":[{"section_id":"STALLS_VIP","section_name":"Stalls VIP","zone":"VIP","rows":8,"seats_per_row":18,"start_row":"A","color":"#FFD700","x_offset":180,"y_offset":80},{"section_id":"STALLS_STANDARD","section_name":"Stalls Standard","zone":"Standard","rows":12,"seats_per_row":20,"start_row":"I","color":"#4169E1","x_offset":160,"y_offset":260},{"section_id":"DRESS_CIRCLE","section_name":"Dress Circle","zone":"VIP","rows":6,"seats_per_row":22,"start_row":"DC1","color":"#FF6347","x_offset":150,"y_offset":500},{"section_id":"UPPER_CIRCLE","section_name":"Upper Circle","zone":"Economy","rows":10,"seats_per_row":24,"start_row":"UC1","color":"#90EE90","x_offset":140,"y_offset":650}],"stage":{"position":"front","width":450,"depth":40,"type":"proscenium"}}',
vip_seats = 276,
standard_seats = 240,
economy_seats = 240
WHERE venue_id = 2;

-- Venue 3: Cafe & Event Space Hồ Chí Minh (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"cafe_lounge","total_capacity":200,"sections":[{"section_id":"SOFA_LOUNGE","section_name":"Sofa Lounge","zone":"VIP","sofas":10,"seats_per_sofa":4,"start_sofa":"SL1","color":"#FFD700","x_offset":50,"y_offset":50},{"section_id":"HIGH_TABLES","section_name":"High Tables","zone":"Standard","tables":15,"seats_per_table":4,"start_table":"HT1","color":"#4169E1","x_offset":200,"y_offset":100},{"section_id":"REGULAR_TABLES","section_name":"Regular Tables","zone":"Standard","tables":12,"seats_per_table":4,"start_table":"RT1","color":"#87CEEB","x_offset":100,"y_offset":250},{"section_id":"STANDING_BAR","section_name":"Standing Bar Area","zone":"Economy","capacity":52,"color":"#90EE90","x_offset":350,"y_offset":50}]}',
vip_seats = 40,
standard_seats = 108,
economy_seats = 52
WHERE venue_id = 3;

-- Venue 4: Trung tâm Hội nghị Hà Nội (Theater - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"theater","total_capacity":5000,"sections":[{"section_id":"ORCHESTRA_VIP","section_name":"Orchestra VIP","zone":"VIP","rows":12,"seats_per_row":22,"start_row":"A","color":"#FFD700","x_offset":140,"y_offset":60},{"section_id":"MEZZANINE","section_name":"Mezzanine","zone":"Standard","rows":18,"seats_per_row":28,"start_row":"M","color":"#4169E1","x_offset":90,"y_offset":250},{"section_id":"UPPER_CIRCLE","section_name":"Upper Circle","zone":"Economy","rows":25,"seats_per_row":32,"start_row":"UC1","color":"#90EE90","x_offset":40,"y_offset":500}],"stage":{"position":"front","width":550,"depth":50,"type":"proscenium"}}',
vip_seats = 264,
standard_seats = 504,
economy_seats = 800
WHERE venue_id = 4;

-- Venue 5: Nhà hát Hà Nội (Opera House - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"opera_house","total_capacity":1000,"sections":[{"section_id":"PARTERRE","section_name":"Parterre","zone":"VIP","rows":10,"seats_per_row":16,"start_row":"P1","color":"#FFD700","x_offset":200,"y_offset":100},{"section_id":"GRAND_TIER","section_name":"Grand Tier","zone":"VIP","rows":5,"seats_per_row":20,"start_row":"GT1","color":"#FF6347","x_offset":180,"y_offset":300},{"section_id":"BALCONY_TIER","section_name":"Balcony Tier","zone":"Standard","rows":8,"seats_per_row":22,"start_row":"BT1","color":"#4169E1","x_offset":160,"y_offset":450},{"section_id":"GALLERY","section_name":"Gallery","zone":"Economy","rows":12,"seats_per_row":24,"start_row":"GL1","color":"#90EE90","x_offset":140,"y_offset":600}]}',
vip_seats = 260,
standard_seats = 176,
economy_seats = 288
WHERE venue_id = 5;

-- Venue 6: Cafe & Event Space Hà Nội (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"bistro_style","total_capacity":200,"sections":[{"section_id":"BOOTH_SEATING","section_name":"Booth Seating","zone":"VIP","booths":12,"seats_per_booth":4,"start_booth":"BS1","color":"#FFD700","x_offset":30,"y_offset":50},{"section_id":"WINDOW_TABLES","section_name":"Window Tables","zone":"Standard","tables":10,"seats_per_table":4,"start_table":"WT1","color":"#4169E1","x_offset":300,"y_offset":80},{"section_id":"CENTER_TABLES","section_name":"Center Tables","zone":"Standard","tables":14,"seats_per_table":4,"start_table":"CT1","color":"#87CEEB","x_offset":150,"y_offset":200},{"section_id":"COUNTER_SEATS","section_name":"Counter Seats","zone":"Economy","rows":1,"seats_per_row":16,"start_row":"CS1","color":"#90EE90","x_offset":50,"y_offset":400}]}',
vip_seats = 48,
standard_seats = 96,
economy_seats = 16
WHERE venue_id = 6;

-- Venue 7: Trung tâm Hội nghị Đà Nẵng (Arena - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"arena","total_capacity":5000,"sections":[{"section_id":"FLOOR_VIP","section_name":"Floor VIP","zone":"VIP","rows":15,"seats_per_row":18,"start_row":"F1","color":"#FFD700","x_offset":180,"y_offset":100},{"section_id":"LOWER_BOWL","section_name":"Lower Bowl","zone":"Standard","rows":20,"seats_per_row":30,"start_row":"L1","color":"#4169E1","x_offset":80,"y_offset":280},{"section_id":"UPPER_BOWL","section_name":"Upper Bowl","zone":"Economy","rows":30,"seats_per_row":35,"start_row":"U1","color":"#90EE90","x_offset":30,"y_offset":550}],"center_stage":{"x":400,"y":400,"radius":80}}',
vip_seats = 270,
standard_seats = 600,
economy_seats = 1050
WHERE venue_id = 7;

-- Venue 8: Nhà hát Đà Nẵng (Modern Theater - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"modern_theater","total_capacity":1000,"sections":[{"section_id":"PREMIUM_ORCHESTRA","section_name":"Premium Orchestra","zone":"VIP","rows":7,"seats_per_row":20,"start_row":"A","color":"#FFD700","x_offset":170,"y_offset":90},{"section_id":"ORCHESTRA","section_name":"Orchestra","zone":"Standard","rows":15,"seats_per_row":22,"start_row":"H","color":"#4169E1","x_offset":150,"y_offset":250},{"section_id":"MEZZANINE","section_name":"Mezzanine","zone":"Standard","rows":8,"seats_per_row":20,"start_row":"MZ1","color":"#87CEEB","x_offset":170,"y_offset":550},{"section_id":"BALCONY","section_name":"Balcony","zone":"Economy","rows":10,"seats_per_row":18,"start_row":"BL1","color":"#90EE90","x_offset":190,"y_offset":700}]}',
vip_seats = 140,
standard_seats = 490,
economy_seats = 180
WHERE venue_id = 8;

-- Venue 9: Cafe & Event Space Đà Nẵng (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"rooftop_lounge","total_capacity":200,"sections":[{"section_id":"SKYLINE_VIP","section_name":"Skyline VIP","zone":"VIP","tables":8,"seats_per_table":6,"start_table":"SV1","color":"#FFD700","x_offset":100,"y_offset":50},{"section_id":"LOUNGE_PODS","section_name":"Lounge Pods","zone":"VIP","pods":10,"seats_per_pod":4,"start_pod":"LP1","color":"#FF6347","x_offset":250,"y_offset":150},{"section_id":"STANDARD_SEATING","section_name":"Standard Seating","zone":"Standard","tables":12,"seats_per_table":4,"start_table":"SS1","color":"#4169E1","x_offset":150,"y_offset":300},{"section_id":"BAR_AREA","section_name":"Bar Area","zone":"Economy","capacity":60,"color":"#90EE90","x_offset":350,"y_offset":100}]}',
vip_seats = 88,
standard_seats = 48,
economy_seats = 60
WHERE venue_id = 9;

-- Venue 10: Trung tâm Hội nghị Cần Thơ (Banquet - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"banquet","total_capacity":5000,"sections":[{"section_id":"PREMIUM_TABLES","section_name":"Premium Tables","zone":"VIP","tables":40,"seats_per_table":10,"start_table":"P1","color":"#FFD700","x_offset":150,"y_offset":80},{"section_id":"STANDARD_TABLES","section_name":"Standard Tables","zone":"Standard","tables":80,"seats_per_table":10,"start_table":"S1","color":"#4169E1","x_offset":100,"y_offset":250},{"section_id":"GENERAL_SEATING","section_name":"General Seating","zone":"Economy","rows":40,"seats_per_row":25,"start_row":"G1","color":"#90EE90","x_offset":50,"y_offset":500}],"stage":{"position":"center","width":400,"depth":300,"type":"rotating"}}',
vip_seats = 400,
standard_seats = 800,
economy_seats = 1000
WHERE venue_id = 10;

-- Venue 11: Nhà hát Cần Thơ (Black Box - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"black_box_theater","total_capacity":1000,"sections":[{"section_id":"FRONT_CENTER","section_name":"Front Center","zone":"VIP","rows":8,"seats_per_row":16,"start_row":"FC1","color":"#FFD700","x_offset":200,"y_offset":100},{"section_id":"SIDE_LEFT","section_name":"Side Left","zone":"Standard","rows":15,"seats_per_row":12,"start_row":"SL1","color":"#4169E1","x_offset":50,"y_offset":150},{"section_id":"SIDE_RIGHT","section_name":"Side Right","zone":"Standard","rows":15,"seats_per_row":12,"start_row":"SR1","color":"#4169E1","x_offset":550,"y_offset":150},{"section_id":"REAR_RISERS","section_name":"Rear Risers","zone":"Economy","rows":12,"seats_per_row":20,"start_row":"RR1","color":"#90EE90","x_offset":160,"y_offset":500}]}',
vip_seats = 128,
standard_seats = 360,
economy_seats = 240
WHERE venue_id = 11;

-- Venue 12: Cafe & Event Space Cần Thơ (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"garden_venue","total_capacity":200,"sections":[{"section_id":"GAZEBO_SEATING","section_name":"Gazebo Seating","zone":"VIP","gazebos":6,"seats_per_gazebo":8,"start_gazebo":"GZ1","color":"#FFD700","x_offset":80,"y_offset":80},{"section_id":"GARDEN_TABLES","section_name":"Garden Tables","zone":"Standard","tables":18,"seats_per_table":4,"start_table":"GT1","color":"#4169E1","x_offset":150,"y_offset":200},{"section_id":"PICNIC_AREA","section_name":"Picnic Area","zone":"Economy","benches":10,"seats_per_bench":6,"start_bench":"PA1","color":"#90EE90","x_offset":250,"y_offset":350}]}',
vip_seats = 48,
standard_seats = 72,
economy_seats = 60
WHERE venue_id = 12;

-- Venue 13: Trung tâm Hội nghị Nha Trang (Conference - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"conference","total_capacity":5000,"sections":[{"section_id":"EXECUTIVE_FRONT","section_name":"Executive Front","zone":"VIP","rows":8,"seats_per_row":25,"start_row":"EX1","color":"#FFD700","x_offset":150,"y_offset":50},{"section_id":"BUSINESS_CLASS","section_name":"Business Class","zone":"Standard","rows":25,"seats_per_row":30,"start_row":"BC1","color":"#4169E1","x_offset":100,"y_offset":200},{"section_id":"GENERAL_ADMISSION","section_name":"General Admission","zone":"Economy","rows":35,"seats_per_row":32,"start_row":"GA1","color":"#90EE90","x_offset":80,"y_offset":500}]}',
vip_seats = 200,
standard_seats = 750,
economy_seats = 1120
WHERE venue_id = 13;

-- Venue 14: Nhà hát Nha Trang (Concert Hall - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"concert_hall","total_capacity":1000,"sections":[{"section_id":"MAIN_FLOOR_VIP","section_name":"Main Floor VIP","zone":"VIP","rows":9,"seats_per_row":18,"start_row":"MF1","color":"#FFD700","x_offset":180,"y_offset":100},{"section_id":"MAIN_FLOOR_STD","section_name":"Main Floor Standard","zone":"Standard","rows":14,"seats_per_row":20,"start_row":"MF10","color":"#4169E1","x_offset":160,"y_offset":280},{"section_id":"LOGE_LEVEL","section_name":"Loge Level","zone":"VIP","rows":6,"seats_per_row":16,"start_row":"LG1","color":"#FF6347","x_offset":200,"y_offset":550},{"section_id":"TERRACE","section_name":"Terrace","zone":"Economy","rows":11,"seats_per_row":22,"start_row":"TR1","color":"#90EE90","x_offset":150,"y_offset":680}],"stage":{"position":"front","width":500,"depth":45,"type":"concert"}}',
vip_seats = 258,
standard_seats = 280,
economy_seats = 242
WHERE venue_id = 14;

-- Venue 15: Cafe & Event Space Nha Trang (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"beachfront_venue","total_capacity":200,"sections":[{"section_id":"CABANA_VIP","section_name":"Cabana VIP","zone":"VIP","cabanas":8,"seats_per_cabana":6,"start_cabana":"CB1","color":"#FFD700","x_offset":50,"y_offset":50},{"section_id":"DECK_SEATING","section_name":"Deck Seating","zone":"Standard","tables":16,"seats_per_table":4,"start_table":"DS1","color":"#4169E1","x_offset":200,"y_offset":150},{"section_id":"BEACH_CHAIRS","section_name":"Beach Chairs","zone":"Standard","rows":6,"seats_per_row":8,"start_row":"BC1","color":"#87CEEB","x_offset":150,"y_offset":300},{"section_id":"SAND_AREA","section_name":"Sand Area","zone":"Economy","capacity":40,"color":"#F4A460","x_offset":100,"y_offset":450}]}',
vip_seats = 48,
standard_seats = 112,
economy_seats = 40
WHERE venue_id = 15;

-- Venue 16: Trung tâm Hội nghị Vũng Tàu (Amphitheater - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"amphitheater","total_capacity":5000,"sections":[{"section_id":"ORCHESTRA_PIT","section_name":"Orchestra Pit","zone":"VIP","rows":10,"seats_per_row":20,"start_row":"OP1","color":"#FFD700","x_offset":160,"y_offset":40},{"section_id":"TERRACE_LEVEL","section_name":"Terrace Level","zone":"Standard","rows":22,"seats_per_row":28,"start_row":"T1","color":"#4169E1","x_offset":100,"y_offset":250},{"section_id":"GALLERY","section_name":"Gallery","zone":"Economy","rows":30,"seats_per_row":35,"start_row":"GL1","color":"#90EE90","x_offset":40,"y_offset":520}],"stage":{"position":"front","width":600,"depth":60,"type":"thrust"}}',
vip_seats = 200,
standard_seats = 616,
economy_seats = 1050
WHERE venue_id = 16;

-- Venue 17: Nhà hát Vũng Tàu (Cabaret - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"cabaret_theater","total_capacity":1000,"sections":[{"section_id":"PREMIUM_TABLES","section_name":"Premium Tables","zone":"VIP","tables":20,"seats_per_table":6,"start_table":"PT1","color":"#FFD700","x_offset":150,"y_offset":100},{"section_id":"STANDARD_TABLES","section_name":"Standard Tables","zone":"Standard","tables":35,"seats_per_table":6,"start_table":"ST1","color":"#4169E1","x_offset":100,"y_offset":250},{"section_id":"BAR_SEATING","section_name":"Bar Seating","zone":"Standard","rows":3,"seats_per_row":30,"start_row":"BAR1","color":"#87CEEB","x_offset":50,"y_offset":500},{"section_id":"GENERAL_SEATING","section_name":"General Seating","zone":"Economy","rows":10,"seats_per_row":25,"start_row":"GS1","color":"#90EE90","x_offset":100,"y_offset":600}],"stage":{"position":"center","width":350,"depth":250,"type":"thrust"}}',
vip_seats = 120,
standard_seats = 300,
economy_seats = 250
WHERE venue_id = 17;

-- Venue 18: Cafe & Event Space Vũng Tàu (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"art_gallery_cafe","total_capacity":200,"sections":[{"section_id":"GALLERY_LOUNGE","section_name":"Gallery Lounge","zone":"VIP","sofas":8,"seats_per_sofa":5,"start_sofa":"GL1","color":"#FFD700","x_offset":100,"y_offset":80},{"section_id":"EXHIBITION_TABLES","section_name":"Exhibition Tables","zone":"Standard","tables":14,"seats_per_table":4,"start_table":"ET1","color":"#4169E1","x_offset":200,"y_offset":200},{"section_id":"WORKSHOP_AREA","section_name":"Workshop Area","zone":"Standard","tables":10,"seats_per_table":6,"start_table":"WA1","color":"#87CEEB","x_offset":150,"y_offset":350},{"section_id":"STANDING_GALLERY","section_name":"Standing Gallery","zone":"Economy","capacity":44,"color":"#90EE90","x_offset":350,"y_offset":100}]}',
vip_seats = 40,
standard_seats = 116,
economy_seats = 44
WHERE venue_id = 18;

-- Venue 19: Trung tâm Hội nghị Huế (Stadium - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"stadium","total_capacity":5000,"sections":[{"section_id":"FIELD_LEVEL","section_name":"Field Level","zone":"VIP","rows":12,"seats_per_row":24,"start_row":"FL1","color":"#FFD700","x_offset":140,"y_offset":80},{"section_id":"CLUB_SEATS","section_name":"Club Seats","zone":"VIP","rows":8,"seats_per_row":20,"start_row":"CS1","color":"#FF6347","x_offset":160,"y_offset":300},{"section_id":"LOWER_DECK","section_name":"Lower Deck","zone":"Standard","rows":25,"seats_per_row":32,"start_row":"LD1","color":"#4169E1","x_offset":80,"y_offset":450},{"section_id":"UPPER_DECK","section_name":"Upper Deck","zone":"Economy","rows":30,"seats_per_row":36,"start_row":"UD1","color":"#90EE90","x_offset":30,"y_offset":750}]}',
vip_seats = 448,
standard_seats = 800,
economy_seats = 1080
WHERE venue_id = 19;

-- Venue 20: Nhà hát Huế (Royal Theater - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"royal_theater","total_capacity":1000,"sections":[{"section_id":"ROYAL_BOX","section_name":"Royal Box","zone":"VIP","boxes":1,"seats_per_box":12,"start_box":"RB1","color":"#9370DB","x_offset":350,"y_offset":400},{"section_id":"IMPERIAL_STALLS","section_name":"Imperial Stalls","zone":"VIP","rows":8,"seats_per_row":20,"start_row":"IS1","color":"#FFD700","x_offset":160,"y_offset":80},{"section_id":"MANDARIN_CIRCLE","section_name":"Mandarin Circle","zone":"Standard","rows":12,"seats_per_row":22,"start_row":"MC1","color":"#4169E1","x_offset":140,"y_offset":260},{"section_id":"UPPER_GALLERY","section_name":"Upper Gallery","zone":"Economy","rows":15,"seats_per_row":24,"start_row":"UG1","color":"#90EE90","x_offset":120,"y_offset":500}]}',
vip_seats = 172,
standard_seats = 264,
economy_seats = 360
WHERE venue_id = 20;

-- Venue 21: Cafe & Event Space Huế (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"heritage_courtyard","total_capacity":200,"sections":[{"section_id":"PAVILION_SEATING","section_name":"Pavilion Seating","zone":"VIP","pavilions":5,"seats_per_pavilion":8,"start_pavilion":"PV1","color":"#FFD700","x_offset":120,"y_offset":100},{"section_id":"COURTYARD_TABLES","section_name":"Courtyard Tables","zone":"Standard","tables":16,"seats_per_table":4,"start_table":"CY1","color":"#4169E1","x_offset":180,"y_offset":220},{"section_id":"VERANDA","section_name":"Veranda","zone":"Standard","rows":8,"seats_per_row":8,"start_row":"VR1","color":"#87CEEB","x_offset":250,"y_offset":350},{"section_id":"GARDEN_BENCHES","section_name":"Garden Benches","zone":"Economy","benches":8,"seats_per_bench":4,"start_bench":"GB1","color":"#90EE90","x_offset":100,"y_offset":450}]}',
vip_seats = 40,
standard_seats = 128,
economy_seats = 32
WHERE venue_id = 21;

-- Venue 22: Trung tâm Hội nghị Hải Phòng (Multi-purpose - 5000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"multi_purpose","total_capacity":5000,"sections":[{"section_id":"PLATINUM_ZONE","section_name":"Platinum Zone","zone":"VIP","rows":10,"seats_per_row":22,"start_row":"PZ1","color":"#E5E4E2","x_offset":150,"y_offset":60},{"section_id":"GOLD_ZONE","section_name":"Gold Zone","zone":"VIP","rows":12,"seats_per_row":24,"start_row":"GZ1","color":"#FFD700","x_offset":130,"y_offset":220},{"section_id":"SILVER_ZONE","section_name":"Silver Zone","zone":"Standard","rows":20,"seats_per_row":30,"start_row":"SZ1","color":"#C0C0C0","x_offset":90,"y_offset":420},{"section_id":"BRONZE_ZONE","section_name":"Bronze Zone","zone":"Economy","rows":28,"seats_per_row":34,"start_row":"BZ1","color":"#CD7F32","x_offset":50,"y_offset":700}]}',
vip_seats = 508,
standard_seats = 600,
economy_seats = 952
WHERE venue_id = 22;

-- Venue 23: Nhà hát Hải Phòng (Multiplex - 1000 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"multiplex_theater","total_capacity":1000,"sections":[{"section_id":"RECLINER_VIP","section_name":"Recliner VIP","zone":"VIP","rows":6,"seats_per_row":12,"start_row":"RV1","color":"#FFD700","x_offset":220,"y_offset":100},{"section_id":"PREMIUM_STANDARD","section_name":"Premium Standard","zone":"Standard","rows":10,"seats_per_row":18,"start_row":"PS1","color":"#4169E1","x_offset":180,"y_offset":250},{"section_id":"STANDARD","section_name":"Standard","zone":"Standard","rows":15,"seats_per_row":20,"start_row":"ST1","color":"#87CEEB","x_offset":160,"y_offset":450},{"section_id":"ECONOMY","section_name":"Economy","zone":"Economy","rows":12,"seats_per_row":22,"start_row":"EC1","color":"#90EE90","x_offset":140,"y_offset":700}],"screen":{"position":"front","width":600,"height":300,"type":"IMAX"}}',
vip_seats = 72,
standard_seats = 480,
economy_seats = 264
WHERE venue_id = 23;

-- Venue 24: Cafe & Event Space Hải Phòng (200 chỗ)
UPDATE Venue SET 
seat_map_template = '{"layout_type":"industrial_loft","total_capacity":200,"sections":[{"section_id":"MEZZANINE_VIP","section_name":"Mezzanine VIP","zone":"VIP","tables":6,"seats_per_table":6,"start_table":"MV1","color":"#FFD700","x_offset":250,"y_offset":50},{"section_id":"LOFT_LOUNGE","section_name":"Loft Lounge","zone":"VIP","sofas":8,"seats_per_sofa":4,"start_sofa":"LL1","color":"#FF6347","x_offset":300,"y_offset":200},{"section_id":"MAIN_FLOOR","section_name":"Main Floor","zone":"Standard","tables":18,"seats_per_table":4,"start_table":"MF1","color":"#4169E1","x_offset":100,"y_offset":150},{"section_id":"COMMUNAL_TABLE","section_name":"Communal Table","zone":"Economy","tables":2,"seats_per_table":16,"start_table":"CM1","color":"#90EE90","x_offset":150,"y_offset":400}]}',
vip_seats = 68,
standard_seats = 72,
economy_seats = 32
WHERE venue_id = 24;

-- Cập nhật thông tin bổ sung
UPDATE Venue 
SET 
    vip_seats = COALESCE(vip_seats, 0),
    standard_seats = COALESCE(standard_seats, 0),
    economy_seats = COALESCE(economy_seats, 0)
WHERE seat_map_template IS NOT NULL;

-- Kiểm tra kết quả
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
    END as has_seatmap
FROM Venue
ORDER BY venue_id;
