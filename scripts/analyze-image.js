const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, '../assets/7a684f287038adce17a132ad8b123393.jpg');
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

console.log('Image size:', imageBuffer.length, 'bytes');
console.log('Base64 length:', base64Image.length);
console.log('Base64 preview:', base64Image.substring(0, 100) + '...');
