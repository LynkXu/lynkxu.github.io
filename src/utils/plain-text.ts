/** Strip markdown/HTML-ish markup to a short plain excerpt. */
export function toPlainExcerpt(raw: string, maxLength = 80): string {
	const plain = (raw || '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/https?:\/\/\S+/g, ' ') // drop bare URLs from previews
		.replace(/[#>*_`~-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!plain) return '';
	return plain.length > maxLength ? `${plain.slice(0, maxLength).trim()}...` : plain;
}

/** Select the first prose paragraph from Markdown, then turn it into an excerpt. */
export function toArticleExcerpt(raw: string, maxLength = 110): string {
	const paragraphs = (raw || '')
		.replace(/```[\s\S]*?```/g, '')
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim());

	const firstParagraph = paragraphs.find((paragraph) => (
		paragraph
		&& !/^#{1,6}\s/.test(paragraph)
		&& !/^>\s?/.test(paragraph)
		&& !/^!\[[^\]]*]\([^)]+\)\s*$/.test(paragraph)
		&& Boolean(toPlainExcerpt(paragraph, maxLength))
	));

	return firstParagraph ? toPlainExcerpt(firstParagraph, maxLength) : '';
}
