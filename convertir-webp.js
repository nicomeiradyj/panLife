const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirs = [
    'img/panificados',
    'img/especiales',
    'img/prepizzas',
    'img/facturas',
    'img/medialunas',
    'img/hero',
    'img/logo',
    'img/social'
];

dirs.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.jfif'].includes(ext)) {
            const input = path.join(dir, file);
            const output = path.join(dir, file.replace(ext, '.webp'));
            sharp(input)
                .webp({ quality: 80 })
                .toFile(output)
                .then(() => console.log('OK:', output))
                .catch(e => console.error('ERROR:', input, e.message));
        }
    });
});