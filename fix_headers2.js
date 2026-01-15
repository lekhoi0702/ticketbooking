const fs = require('fs');
const path = 'c:\\Users\\khoi.le\\Desktop\\ticketbooking\\ticketbookingwebapp\\src\\pages\\admin\\Events.jsx';

let content = fs.readFileSync(path, { encoding: 'utf8' });

// Use Unicode escapes for exact matching
const replacements = [
    [/TH\u00d4NG TIN S\u1ef0 KI\u1ec6N/g, 'THÔNG TIN SỰ KIỆN'],
    [/TH\u00c3"NG TIN S\u00e1\u00bb\u00b0 KI\u00e1\u00bb\u2020N/g, 'THÔNG TIN SỰ KIỆN'],
    [/NH\u00c0 T\u1ed4 CH\u1ee8C/g, 'NHÀ TỔ CHỨC'],
    [/NH\u00c3\u0080 T\u00e1\u00bb" CH\u00e1\u00bb\u00a8C/g, 'NHÀ TỔ CHỨC'],
    [/TR\u1ea0NG TH\u00c1I/g, 'TRẠNG THÁI'],
    [/TR\u00e1\u00ba NG TH\u00c3I/g, 'TRẠNG THÁI'],
    [/N\u1ed4I B\u1eacT/g, 'NỔI BẬT'],
    [/N\u00e1\u00bb"I B\u00e1\u00ba\u00acT/g, 'NỔI BẬT'],
    [/THAO T\u00c1C/g, 'THAO TÁC'],
    [/THAO T\u00c3C/g, 'THAO TÁC']
];

replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
});

fs.writeFileSync(path, content, { encoding: 'utf8' });
console.log('Headers fixed!');
