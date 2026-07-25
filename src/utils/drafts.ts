type Draftable = {
	data?: {
		draft?: boolean;
	};
};

/**
 * 仅开发环境（astro dev）展示草稿；生产构建（astro build）自动过滤。
 * 原理：Astro 基于 Vite，import.meta.env.DEV 在 dev 时为 true，build 时为 false。
 */
export const INCLUDE_DRAFTS = import.meta.env.DEV === true;

export function filterDrafts<T extends Draftable>(items: T[]): T[] {
	return INCLUDE_DRAFTS ? items : items.filter((item) => !item.data?.draft);
}

