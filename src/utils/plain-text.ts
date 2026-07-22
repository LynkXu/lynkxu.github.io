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
