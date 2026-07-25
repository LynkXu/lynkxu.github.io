export type TravelPlace = {
	name: string;
	lat: number;
	lng: number;
	date: string;
	status?: 'living' | 'hometown';
	country?: string;
};

export const travelPlaces: TravelPlace[] = [
	{ name: '上海', lat: 31.2304, lng: 121.4737, date: '2020 - 至今', status: 'living' },
	{ name: '六安', lat: 31.73, lng: 116.43, date: '1998', status: 'hometown' },
	{ name: '大阪', lat: 34.6937, lng: 135.5023, date: '2026-05', country: 'JP' },
	{ name: '京都', lat: 35.0116, lng: 135.7681, date: '2026-05', country: 'JP' },
	{ name: '神户', lat: 34.6901, lng: 135.1955, date: '2026-05', country: 'JP' },
	{ name: '扬州', lat: 32.39, lng: 119.41, date: '2025-10' },
	{ name: '常州', lat: 31.81, lng: 119.97, date: '2025-10' },
	{ name: '香港', lat: 22.28, lng: 114.17, date: '2025-05' },
	{ name: '深圳', lat: 22.5431, lng: 114.0579, date: '2025-05' },
	{ name: '济州岛', lat: 33.5, lng: 126.518, date: '2025-05', country: 'KR' },
	{ name: '休斯顿', lat: 29.97, lng: -95.689, date: '2025-02', country: 'US' },
	{ name: '南京', lat: 32.06, lng: 118.8, date: '2024-10' },
	{ name: '绍兴', lat: 30.05, lng: 120.58, date: '2024-07' },
	{ name: '黄山', lat: 30.14, lng: 118.16, date: '2024-07' },
	{ name: '长沙', lat: 28.23, lng: 112.94, date: '2024-06' },
	{ name: '千岛湖', lat: 29.59, lng: 119.01, date: '2024-05' },
	{ name: '平潭', lat: 25.5, lng: 119.79, date: '2023-10' },
	{ name: '厦门', lat: 24.48, lng: 118.09, date: '2023-10' },
	{ name: '武汉', lat: 30.59, lng: 114.3, date: '2023-08' },
	{ name: '西双版纳', lat: 22.01, lng: 100.8, date: '2023-02' },
	{ name: '大理', lat: 25.68, lng: 100.3, date: '2023-02' },
	{ name: '丽江', lat: 26.87, lng: 100.24, date: '2023-02' },
	{ name: '湖州', lat: 30.89, lng: 120.09, date: '2023-01' },
	{ name: '杭州', lat: 30.2741, lng: 120.1551, date: '2021-06' },
	{ name: '宜春', lat: 28.1, lng: 114.08, date: '2017-12' },
	{ name: '烟台', lat: 37.46, lng: 121.45, date: '2015-12' },
	{ name: '青岛', lat: 36.06, lng: 120.31, date: '2015-09' },
];
