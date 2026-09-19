export type TravelPlace = {
	id: string;
	name: string;
	lat: number;
	lng: number;
	date: string;
	status?: 'living' | 'hometown';
	country?: string;
	adminCode?: string;
	location?: string;
};

export const travelPlaces: TravelPlace[] = [
	{ id: 'cn-shanghai', name: '上海', lat: 31.2304, lng: 121.4737, date: '2020 - 至今', status: 'living', country: 'CN', adminCode: '310000', location: '上海, 中国' },
	{ id: 'cn-luan', name: '六安', lat: 31.73, lng: 116.43, date: '1998', status: 'hometown', country: 'CN', adminCode: '341500', location: '安徽, 中国' },
	{ id: 'cn-chengdu', name: '成都', lat: 30.65, lng: 104.07, date: '2026-09', country: 'CN', adminCode: '510100', location: '四川, 中国' },
	{ id: 'cn-chongqing', name: '重庆', lat: 29.59, lng: 106.55, date: '2026-09', country: 'CN', adminCode: '500000', location: '重庆, 中国' },
	{ id: 'jp-osaka', name: '大阪', lat: 34.6937, lng: 135.5023, date: '2026-05', country: 'JP', location: '日本' },
	{ id: 'jp-kyoto', name: '京都', lat: 35.0116, lng: 135.7681, date: '2026-05', country: 'JP', location: '日本' },
	{ id: 'jp-kobe', name: '神户', lat: 34.6901, lng: 135.1955, date: '2026-05', country: 'JP', location: '日本' },
	{ id: 'cn-yangzhou', name: '扬州', lat: 32.39, lng: 119.41, date: '2025-10', country: 'CN', adminCode: '321000', location: '江苏, 中国' },
	{ id: 'cn-changzhou', name: '常州', lat: 31.81, lng: 119.97, date: '2025-10', country: 'CN', adminCode: '320400', location: '江苏, 中国' },
	{ id: 'cn-hong-kong', name: '香港', lat: 22.28, lng: 114.17, date: '2025-05', country: 'CN', adminCode: '810000', location: '香港, 中国' },
	{ id: 'cn-shenzhen', name: '深圳', lat: 22.5431, lng: 114.0579, date: '2025-05', country: 'CN', adminCode: '440300', location: '广东, 中国' },
	{ id: 'kr-jeju', name: '济州岛', lat: 33.5, lng: 126.518, date: '2025-05', country: 'KR', location: '韩国' },
	{ id: 'us-houston', name: '休斯顿', lat: 29.97, lng: -95.689, date: '2025-02', country: 'US', location: '美国' },
	{ id: 'cn-nanjing', name: '南京', lat: 32.06, lng: 118.8, date: '2024-10', country: 'CN', adminCode: '320100', location: '江苏, 中国' },
	{ id: 'cn-shaoxing', name: '绍兴', lat: 30.05, lng: 120.58, date: '2024-07', country: 'CN', adminCode: '330600', location: '浙江, 中国' },
	{ id: 'cn-huangshan', name: '黄山', lat: 30.14, lng: 118.16, date: '2024-07', country: 'CN', adminCode: '341000', location: '安徽, 中国' },
	{ id: 'cn-changsha', name: '长沙', lat: 28.23, lng: 112.94, date: '2024-06', country: 'CN', adminCode: '430100', location: '湖南, 中国' },
	{ id: 'cn-qiandaohu', name: '千岛湖', lat: 29.59, lng: 119.01, date: '2024-05', country: 'CN', adminCode: '330127', location: '浙江, 中国' },
	{ id: 'cn-pingtan', name: '平潭', lat: 25.5, lng: 119.79, date: '2023-10', country: 'CN', adminCode: '350128', location: '福建, 中国' },
	{ id: 'cn-xiamen', name: '厦门', lat: 24.48, lng: 118.09, date: '2023-10', country: 'CN', adminCode: '350200', location: '福建, 中国' },
	{ id: 'cn-wuhan', name: '武汉', lat: 30.59, lng: 114.3, date: '2023-08', country: 'CN', adminCode: '420100', location: '湖北, 中国' },
	{ id: 'cn-xishuangbanna', name: '西双版纳', lat: 22.01, lng: 100.8, date: '2023-02', country: 'CN', adminCode: '532800', location: '云南, 中国' },
	{ id: 'cn-dali', name: '大理', lat: 25.68, lng: 100.3, date: '2023-02', country: 'CN', adminCode: '532900', location: '云南, 中国' },
	{ id: 'cn-lijiang', name: '丽江', lat: 26.87, lng: 100.24, date: '2023-02', country: 'CN', adminCode: '530700', location: '云南, 中国' },
	{ id: 'cn-huzhou', name: '湖州', lat: 30.89, lng: 120.09, date: '2023-01', country: 'CN', adminCode: '330500', location: '浙江, 中国' },
	{ id: 'cn-hangzhou', name: '杭州', lat: 30.2741, lng: 120.1551, date: '2021-06', country: 'CN', adminCode: '330100', location: '浙江, 中国' },
	{ id: 'cn-yichun', name: '宜春', lat: 28.1, lng: 114.08, date: '2017-12', country: 'CN', adminCode: '360900', location: '江西, 中国' },
	{ id: 'cn-yantai', name: '烟台', lat: 37.46, lng: 121.45, date: '2015-12', country: 'CN', adminCode: '370600', location: '山东, 中国' },
	{ id: 'cn-qingdao', name: '青岛', lat: 36.06, lng: 120.31, date: '2015-09', country: 'CN', adminCode: '370200', location: '山东, 中国' },
];
