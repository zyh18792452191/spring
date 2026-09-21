// 识别Word文档中的图片
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// 使用豆包视觉大模型识别图片（通过API调用）
async function recognizeImage(dataUri, index) {
  try {
    // 这里应该调用视觉大模型API
    // 由于我无法直接在脚本中调用API，我会返回一个占位符
    return {
      index: index + 1,
      description: `图片${index + 1} - 需要通过视觉大模型识别`,
      dataUriLength: dataUri.length
    };
  } catch (error) {
    return {
      index: index + 1,
      description: '识别失败',
      error: error.message
    };
  }
}

async function main() {
  const filePath = process.argv[2];
  
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('文件不存在:', filePath);
    process.exit(1);
  }

  // 提取图片
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

  // 保存图片信息到JSON文件，供后续识别
  const result = {
    count: images.length,
    images: images.map(img => ({
      index: img.index,
      dataUriLength: img.dataUri.length,
      // 不保存完整的dataUri以避免文件过大
    }))
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
