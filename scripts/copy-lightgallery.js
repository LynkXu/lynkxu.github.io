#!/usr/bin/env node
/**
 * 将 lightgallery.js 的资源文件复制到 public 目录
 */

import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const files = [
	{
		src: 'node_modules/lightgallery.js/dist/css/lightgallery.min.css',
		dest: 'public/lightgallery/css/lightgallery.min.css',
	},
	{
		src: 'node_modules/lightgallery.js/dist/js/lightgallery.min.js',
		dest: 'public/lightgallery/js/lightgallery.min.js',
	},
	{
		src: 'node_modules/lightgallery.js/dist/fonts/lg.svg',
		dest: 'public/lightgallery/fonts/lg.svg',
	},
	{
		src: 'node_modules/lightgallery.js/dist/fonts/lg.ttf',
		dest: 'public/lightgallery/fonts/lg.ttf',
	},
	{
		src: 'node_modules/lightgallery.js/dist/fonts/lg.woff',
		dest: 'public/lightgallery/fonts/lg.woff',
	},
	{
		src: 'node_modules/lightgallery.js/dist/img/loading.gif',
		dest: 'public/lightgallery/img/loading.gif',
	},
	{
		src: 'node_modules/lightgallery.js/dist/img/video-play.png',
		dest: 'public/lightgallery/img/video-play.png',
	},
	{
		src: 'node_modules/lightgallery.js/dist/img/vimeo-play.png',
		dest: 'public/lightgallery/img/vimeo-play.png',
	},
	{
		src: 'node_modules/lightgallery.js/dist/img/youtube-play.png',
		dest: 'public/lightgallery/img/youtube-play.png',
	},
];

console.log('📦 正在复制 lightgallery 资源文件...\n');

let successCount = 0;
let errorCount = 0;

files.forEach(({ src, dest }) => {
	try {
		const srcPath = join(projectRoot, src);
		const destPath = join(projectRoot, dest);

		// 确保目标目录存在
		mkdirSync(dirname(destPath), { recursive: true });

		// 复制文件
		copyFileSync(srcPath, destPath);
		console.log(`✅ ${src} -> ${dest}`);
		successCount++;
	} catch (error) {
		console.error(`❌ 复制失败：${src}`);
		console.error(`   错误：${error.message}`);
		errorCount++;
	}
});

console.log(`\n📊 复制完成：${successCount} 个文件成功，${errorCount} 个文件失败`);

if (errorCount > 0) {
	process.exit(1);
}
