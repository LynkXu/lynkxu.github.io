/**
 * Calculate progress through the article body, excluding page chrome and footer.
 * Returns null when the article does not require scrolling.
 */
export function calculateReadingProgress(scrollY, contentTop, contentHeight, viewportHeight) {
	const readableDistance = contentHeight - viewportHeight;
	if (readableDistance <= 0) return null;

	const progress = (scrollY - contentTop) / readableDistance;
	return Math.min(1, Math.max(0, progress));
}
