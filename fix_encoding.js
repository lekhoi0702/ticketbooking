const fs = require('fs');

const filePath = 'c:\\Users\\khoi.le\\Desktop\\ticketbooking\\ticketbookingwebapp\\src\\pages\\admin\\Events.jsx';

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Vietnamese text replacements
const replacements = [
    ['Xem x\u00c3\u00a9t v\u00c3\u00a0 c\u00e1\u00ba\u00a5p ph\u00c3\u00a9p xu\u00e1\u00ba\u00a5t b\u00e1\u00ba\u00a3n c\u00c3\u00a1c s\u00e1\u00bb\u00b1 ki\u00e1\u00bb\u2021n tr\u00c3\u00aan h\u00e1\u00bb\u2021 th\u00e1\u00bb\u2018ng', 'Xem x\u00e9t v\u00e0 c\u1ea5p ph\u00e9p xu\u1ea5t b\u1ea3n c\u00e1c s\u1ef1 ki\u1ec7n tr\u00ean h\u1ec7 th\u1ed1ng'],
    ['L\u00c3\u00a0m m\u00e1\u00bb\u203ai', 'L\u00e0m m\u1edbi'],
    ['\u00c4ang c\u00c3\u00b3', '\u0110ang c\u00f3'],
    ['s\u00e1\u00bb\u00b1 ki\u00e1\u00bb\u2021n c\u00e1\u00ba\u00a7n \u00c4\u2018\u00c6\u00b0\u00e1\u00bb\u00a3c b\u00e1\u00ba\u00a1n ph\u00c3\u00aa duy\u00e1\u00bb\u2021t \u00c4\u2018\u00e1\u00bb\u0192 l\u00c3\u00aan s\u00c3\u00a0n', 's\u1ef1 ki\u1ec7n c\u1ea7n \u0111\u01b0\u1ee3c b\u1ea1n ph\u00ea duy\u1ec7t \u0111\u1ec3 l\u00ean s\u00e0n'],
    ['B\u00e1\u00bb\u2122 l\u00e1\u00bb\u008dc', 'B\u1ed9 l\u1ecdc'],
    ['T\u00c3\u00acm ki\u00e1\u00ba\u00bfm theo t\u00c3\u00aan s\u00e1\u00bb\u00b1 ki\u00e1\u00bb\u2021n', 'T\u00ecm ki\u1ebfm theo t\u00ean s\u1ef1 ki\u1ec7n'],
    ['Tr\u00e1\u00ba\u00a1ng th\u00c3\u00a1i', 'Tr\u1ea1ng th\u00e1i'],
    ['T\u00e1\u00ba\u00a5t c\u00e1\u00ba\u00a3 tr\u00e1\u00ba\u00a1ng th\u00c3\u00a1i', 'T\u1ea5t c\u1ea3 tr\u1ea1ng th\u00e1i'],
    ['Ch\u00e1\u00bb\u00a3 duy\u00e1\u00bb\u2021t', 'Ch\u1edd duy\u1ec7t'],
    ['\u00c4\u0090\u00c3\u00a3 duy\u00e1\u00bb\u2021t', '\u0110\u00e3 duy\u1ec7t'],
    ['\u00c4\u0090\u00c3\u00a3 xu\u00e1\u00ba\u00a5t b\u00e1\u00ba\u00a3n', '\u0110\u00e3 xu\u1ea5t b\u1ea3n'],
    ['T\u00e1\u00bb\u00ab ch\u00e1\u00bb\u2018i', 'T\u1eeb ch\u1ed1i'],
    ['Nh\u00c3\u00a1p', 'Nh\u00e1p'],
    ['\u00c4ang di\u00e1\u00bb\u2026n ra', '\u0110ang di\u1ec5n ra'],
    ['Ho\u00c3\u00a0n th\u00c3\u00a0nh', 'Ho\u00e0n th\u00e0nh'],
    ['\u00c4\u0090\u00c3\u00a3 h\u00e1\u00bb\u00a7y', '\u0110\u00e3 h\u1ee7y'],
    ['S\u00e1\u00bb\u00b1 ki\u00e1\u00bb\u2021n n\u00e1\u00bb\u2022i b\u00e1\u00ba\u00adt', 'S\u1ef1 ki\u1ec7n n\u1ed5i b\u1eadt'],
    ['T\u00e1\u00ba\u00a5t c\u00e1\u00ba\u00a3', 'T\u1ea5t c\u1ea3'],
    ['Ch\u00e1\u00bb\u2030 s\u00e1\u00bb\u00b1 ki\u00e1\u00bb\u2021n n\u00e1\u00bb\u2022i b\u00e1\u00ba\u00adt', 'Ch\u1ec9 s\u1ef1 ki\u1ec7n n\u1ed5i b\u1eadt'],
    ['Kh\u00c3\u00b4ng n\u00e1\u00bb\u2022i b\u00e1\u00ba\u00adt', 'Kh\u00f4ng n\u1ed5i b\u1eadt'],
    ['Hi\u00e1\u00bb\u0192n th\u00e1\u00bb\u2039', 'Hi\u1ec3n th\u1ecb'],
    ['X\u00c3\u00b3a b\u00e1\u00bb\u2122 l\u00e1\u00bb\u008dc', 'X\u00f3a b\u1ed9 l\u1ecdc']
];

// Apply all replacements
replacements.forEach(([bad, good]) => {
    content = content.split(bad).join(good);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed encoding successfully!');
