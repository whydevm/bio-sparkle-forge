export interface LyricLine {
  time: number; // seconds
  text: string;
}

/**
 * Parse an LRC string into time-sorted lyric lines.
 * Supports multiple timestamps on one line: [00:12.34][00:48.10]text
 */
export function parseLRC(lrc: string | null | undefined): LyricLine[] {
  if (!lrc) return [];
  const lines: LyricLine[] = [];
  const re = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const raw of lrc.split(/\r?\n/)) {
    const stamps: number[] = [];
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(raw)) !== null) {
      const mins = parseInt(m[1], 10);
      const secs = parseInt(m[2], 10);
      const frac = m[3] ? parseInt(m[3].padEnd(3, '0').slice(0, 3), 10) / 1000 : 0;
      stamps.push(mins * 60 + secs + frac);
    }
    if (!stamps.length) continue;
    const text = raw.replace(re, '').trim();
    for (const t of stamps) lines.push({ time: t, text });
  }

  lines.sort((a, b) => a.time - b.time);
  return lines;
}

export function findActiveLineIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines.length) return -1;
  let lo = 0, hi = lines.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= currentTime) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
