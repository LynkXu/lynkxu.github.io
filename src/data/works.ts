export type WorkItem = {
	title: string;
	description: string;
	href: string;
	/** e.g. 2026 */
	year?: string;
	/** e.g. 工具 / 开源 / 实验 */
	kind?: string;
};

/** Placeholder works — replace with real projects when ready. */
export const works: WorkItem[] = [
	{
		title: '示例作品甲',
		description: '一句话说明。',
		href: '/about',
		year: '2026',
		kind: '工具',
	},
	{
		title: '示例作品乙',
		description: '一句话说明。',
		href: '/tools',
		year: '2025',
		kind: '开源',
	},
	{
		title: '示例作品丙',
		description: '一句话说明。',
		href: '/about',
		year: '2024',
		kind: '实验',
	},
];
