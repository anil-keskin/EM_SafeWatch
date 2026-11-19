/**
 * Aynı rolü karşılayan KKD aileleri.
 *
 * Senaryo tek bir kod yazar (ör. baret_en397). Oyuncu aynı aileden
 * diğerini seçerse isabet sayılır; "olmaz" demeyiz.
 *
 * Farklı risk aileleri eşdeğer değildir: standart iş kıyafeti FR yerine
 * geçmez, IR gözlük EN 166 yerine geçmez, ısı eldiveni mekanik eldiven
 * yerine geçmez.
 */

export const EQUIPMENT_SUBSTITUTE_GROUPS: readonly (readonly string[])[] = [
  ["baret_en397", "baret_jugular", "baret_en14052"],
  ["kulak_tikaci", "kulaklik_en352"],
];

const GROUP_BY_CODE: Record<string, string> = {};
for (const group of EQUIPMENT_SUBSTITUTE_GROUPS) {
  const id = group[0];
  for (const code of group) GROUP_BY_CODE[code] = id;
}

export function substituteGroup(code: string): string {
  return GROUP_BY_CODE[code] ?? code;
}

/**
 * `noSubstitute`: aile eşdeğeri sayılmayacak kodlar. Yüklenici/işletme
 * sekmesinde kişinin zaten üzerinde olan kart "eksik" diye işaretlenirse
 * bu bir tespit hatasıdır; aynı aileden başka bir eksiğin yerine geçmez.
 */
export function matchSelectedToCorrect(
  selected: string[],
  correct: string[],
  noSubstitute: readonly string[] = []
): { hits: string[]; misses: string[]; extras: string[] } {
  const blocked = new Set(noSubstitute);
  const remaining = new Set(selected);
  const hits: string[] = [];
  const misses: string[] = [];
  const satisfiedGroups = new Set<string>();

  for (const req of correct) {
    if (remaining.has(req)) {
      remaining.delete(req);
      hits.push(req);
      satisfiedGroups.add(substituteGroup(req));
      continue;
    }

    const group = substituteGroup(req);
    let found: string | undefined;
    for (const code of remaining) {
      if (blocked.has(code)) continue;
      if (substituteGroup(code) === group) {
        found = code;
        break;
      }
    }

    if (found) {
      remaining.delete(found);
      hits.push(found);
      satisfiedGroups.add(group);
    } else {
      misses.push(req);
    }
  }

  const extras: string[] = [];
  for (const code of remaining) {
    const group = substituteGroup(code);
    if (!blocked.has(code) && satisfiedGroups.has(group)) continue;
    extras.push(code);
  }

  return { hits, misses, extras };
}

export function selectedMatchesCorrect(
  selected: string[],
  correct: string[]
): boolean {
  const { misses, extras } = matchSelectedToCorrect(selected, correct);
  return misses.length === 0 && extras.length === 0;
}
