const fs = require('fs');
const file = 'c:\\Users\\khoi.le\\Desktop\\ticketbooking\\ticketbookingwebapp\\src\\pages\\admin\\Events.jsx';

// Read file
let content = fs.readFileSync(file, 'utf8');

// Simple string replacements - using exact bytes
content = content.split('THÔNG TIN Sá»° KIá»†N').join('THÔNG TIN SỰ KIỆN');
content = content.split('NHÀ Tá»" CHá»¨C').join('NHÀ TỔ CHỨC');
content = content.split('TRáº NG THÁI').join('TRẠNG THÁI');
content = content.split('Ná»"I Báº¬T').join('NỔI BẬT');
content = content.split('THAO TÃC').join('THAO TÁC');

// Write back
fs.writeFileSync(file, content, 'utf8');

console.log('Fixed all table headers!');
