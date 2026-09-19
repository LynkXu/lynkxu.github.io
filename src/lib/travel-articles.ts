type TravelArticle = {
	id: string;
	data: {
		slug?: string;
		places?: string[];
		pubDate: Date;
	};
};

export function groupTravelArticlesByPlace<T extends TravelArticle>(articles: T[]): Record<string, T[]> {
	const grouped: Record<string, T[]> = {};
	const newestFirst = [...articles].sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	for (const article of newestFirst) {
		for (const placeId of new Set(article.data.places ?? [])) {
			(grouped[placeId] ||= []).push(article);
		}
	}

	return grouped;
}

export function getTravelArticleHref(article: Pick<TravelArticle, 'id' | 'data'>): string {
	return `/blog/${article.data.slug ?? article.id}.html`;
}
