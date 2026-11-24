export type WorkItem = {
	title: string;
	description: string;
	href: string;
	kind?: string;
	status?: string;
	active?: boolean;
	stack?: string[];
	year?: string;
	/** 本地路径（/logo/...）、完整 URL，或 Simple Icons slug（与 /tools 页面保持一致）。 */
	icon?: string;
	invertDark?: boolean;
	iconScale?: number;
};

export const works: WorkItem[] = [
	{
		title: 'Runote',
		description: '记录跑步赛事与旅程的赛事记录 iOS APP。',
		href: 'https://runote.app',
		kind: 'iOS 应用',
		status: '维护中',
		active: true,
		stack: ['Swift', 'iOS'],
		year: '2026',
		icon: 'swift',
	},
	{
		title: 'AI-Learning',
		description: '12 周从零让 AI 教我从零构建一个 Coding Agent。',
		href: 'https://github.com/LynkXu/AI-Learning',
		kind: '开源实践',
		status: '开源',
		active: false,
		stack: ['AI Agent', 'LLM'],
		year: '2026',
		icon: '/logo/openai.svg',
		invertDark: true,
	},
	{
		title: 'AlgorithmDiagram',
		description: '《算法图解》的算法示例，用 Python 和 Java 实现。',
		href: 'https://github.com/LynkXu/AlgorithmDiagram',
		kind: '代码仓库',
		status: '归档',
		active: false,
		stack: ['Python', 'Java'],
		year: '2021',
		icon: 'python',
	},
];
