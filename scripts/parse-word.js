// Word文档解析工具脚本
// 用法：node scripts/parse-word.js <文件路径> [是否包含图片: true/false]

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const includeImages = process.argv[3] === 'true';

if (!filePath || !fs.existsSync(filePath)) {
  console.error('文件不存在:', filePath);
  process.exit(1);
}

async function parseWord() {
  try {
    // 提取文本
    const textResult = await mammoth.extractRawText({ path: filePath });
    let fullText = textResult.value;
    fullText = fullText.split('\n').filter(line => line.trim().length > 0).join('\n').trim();

    const result = {
      text: fullText,
      chars: fullText.length,
      images: [],
    };

    // 提取图片
    if (includeImages) {
      const images = [];
      await mammoth.convertToHtml({ path: filePath }, {
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read('base64').then(function(imageBuffer) {
            const contentType = image.contentType;
            let imageType = 'png';
            if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
              imageType = 'jpeg';
            } else if (contentType === 'image/gif') {
              imageType = 'gif';
            } else if (contentType === 'image/webp') {
              imageType = 'webp';
            } else if (contentType === 'image/bmp') {
              imageType = 'bmp';
            }

            const dataUri = `data:image/${imageType};base64,${imageBuffer}`;
            images.push({
              index: images.length + 1,
              dataUri: dataUri,
            });

            return { src: dataUri };
          });
        })
      });

      result.images = images;
    }

    console.log(JSON.stringify(result));
  } catch (error) {
    console.error('解析错误:', error.message);
    process.exit(1);
  }
}

parseWord();
