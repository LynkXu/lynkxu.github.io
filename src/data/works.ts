export type WorkItem = {
	title: string;
	description: string;
	href: string;
};

export const works: WorkItem[] = [
	{
		title: 'Runote',
		description: '记录跑步赛事与旅程的赛事记录 iOS APP。',
		href: 'https://runote.app',
	},
	{
		title: 'AI-Learning',
		description: '12 周从零让 AI 教我从零构建一个 Coding Agent。',
		href: 'https://github.com/LynkXu/AI-Learning',
	},
	{
		title: 'AlgorithmDiagram',
		description: '《算法图解》的算法示例，用 Python 和 Java 实现。',
		href: 'https://github.com/LynkXu/AlgorithmDiagram',
	},
];
