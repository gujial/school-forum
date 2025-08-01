import fs from 'fs';
import path from 'path';

// 测试文件目录结构
const testDirs = [
  'dynamic/avatars/test-user',
  'dynamic/media/test-tweet'
];

// 创建测试目录
testDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  }
});

// 创建测试文件
const testFiles = [
  {
    path: 'dynamic/avatars/test-user/test-avatar.jpg',
    content: 'fake image data'
  },
  {
    path: 'dynamic/media/test-tweet/test-image.jpg',
    content: 'fake image data'
  },
  {
    path: 'dynamic/media/test-tweet/test-video.mp4',
    content: 'fake video data'
  }
];

testFiles.forEach(file => {
  if (!fs.existsSync(file.path)) {
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ 创建测试文件: ${file.path}`);
  }
});

console.log('\n📁 文件服务测试环境已准备就绪！');
console.log('现在可以启动服务器并测试以下API:');
console.log('- GET /api/files/avatar/test-user');
console.log('- GET /api/files/media/test-tweet/test-image.jpg');
console.log('- GET /api/files/media/test-tweet/test-video.mp4'); 