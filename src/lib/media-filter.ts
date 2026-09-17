export function matchesMediaFilter(itemKind: string, activeKind: string): boolean {
  return activeKind === 'all' || itemKind === activeKind;
}

type LocalizedTitle = {
  lang?: string;
  text?: string;
};

const SEASON_LABEL = /^(season|staffel|saison|temporada|시즌|シーズン|第\s*\d+\s*季)/i;

function usableTitle(entry?: LocalizedTitle | null): string {
  const text = entry?.text?.trim() || '';
  if (!text || SEASON_LABEL.test(text)) return '';
  return text;
}

export function getPreferredTitle(
  localized: LocalizedTitle[] | undefined,
  ...fallbacks: Array<string | undefined>
): string {
  for (const lang of ['zh-cn', 'zh-tw', 'zh-hk']) {
    const match = localized?.find((entry) => entry.lang === lang && usableTitle(entry));
    if (match) return usableTitle(match);
  }

  const usableFallback = fallbacks.map((value) => usableTitle({ text: value })).find(Boolean);
  if (usableFallback) return usableFallback;

  const anyLocalized = localized?.find((entry) => usableTitle(entry));
  return anyLocalized ? usableTitle(anyLocalized) : (fallbacks.find((value) => value?.trim()) || '');
}

export function getAlternateTitle(localized: LocalizedTitle[] | undefined, primary: string): string {
  const match = localized?.find((entry) => entry.lang === 'en');
  const text = usableTitle(match);
  return text && text !== primary ? text : '';
}

export function getMediaStatusLabel(kind: string, shelfType?: string): string {
  const inProgress = shelfType === 'progress';
  if (kind === 'book') return inProgress ? '在读' : '已读';
  if (kind === 'game') return inProgress ? '进行中' : '已通关';
  return inProgress ? '在看' : '已看';
}

export function formatRecordedMonth(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

export function toFilledStars(ratingGrade?: number | null): number | null {
  if (typeof ratingGrade !== 'number' || !Number.isFinite(ratingGrade)) return null;
  return Math.max(0, Math.min(5, Math.round(ratingGrade / 2)));
}
