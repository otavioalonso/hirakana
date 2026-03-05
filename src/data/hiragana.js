/**
 * Complete hiragana + katakana data.
 * Each row is unlocked as a new level.
 * Romanization follows standard Hepburn.
 *
 * HIRAGANA_ROWS and KATAKANA_ROWS are parallel arrays —
 * katakana row i corresponds to hiragana row i.
 * ROWS interleaves them: [hira0, kata0, hira1, kata1, …]
 * but the engine treats each script independently for leveling.
 */

// ── Hiragana rows ─────────────────────────────────────────────

export const HIRAGANA_ROWS = [
  {
    name: 'Vowels',
    script: 'hiragana',
    letters: [
      { id: 'a',   romaji: 'a',   kana: 'あ', script: 'hiragana' },
      { id: 'i',   romaji: 'i',   kana: 'い', script: 'hiragana' },
      { id: 'u',   romaji: 'u',   kana: 'う', script: 'hiragana' },
      { id: 'e',   romaji: 'e',   kana: 'え', script: 'hiragana' },
      { id: 'o',   romaji: 'o',   kana: 'お', script: 'hiragana' },
    ],
  },
  {
    name: 'K-row',
    script: 'hiragana',
    letters: [
      { id: 'ka',  romaji: 'ka',  kana: 'か', script: 'hiragana' },
      { id: 'ki',  romaji: 'ki',  kana: 'き', script: 'hiragana' },
      { id: 'ku',  romaji: 'ku',  kana: 'く', script: 'hiragana' },
      { id: 'ke',  romaji: 'ke',  kana: 'け', script: 'hiragana' },
      { id: 'ko',  romaji: 'ko',  kana: 'こ', script: 'hiragana' },
    ],
  },
  {
    name: 'G-row',
    script: 'hiragana',
    letters: [
      { id: 'ga',  romaji: 'ga',  kana: 'が', script: 'hiragana' },
      { id: 'gi',  romaji: 'gi',  kana: 'ぎ', script: 'hiragana' },
      { id: 'gu',  romaji: 'gu',  kana: 'ぐ', script: 'hiragana' },
      { id: 'ge',  romaji: 'ge',  kana: 'げ', script: 'hiragana' },
      { id: 'go',  romaji: 'go',  kana: 'ご', script: 'hiragana' },
    ],
  },
  {
    name: 'S-row',
    script: 'hiragana',
    letters: [
      { id: 'sa',  romaji: 'sa',  kana: 'さ', script: 'hiragana' },
      { id: 'shi', romaji: 'shi', kana: 'し', script: 'hiragana' },
      { id: 'su',  romaji: 'su',  kana: 'す', script: 'hiragana' },
      { id: 'se',  romaji: 'se',  kana: 'せ', script: 'hiragana' },
      { id: 'so',  romaji: 'so',  kana: 'そ', script: 'hiragana' },
    ],
  },
  {
    name: 'Z-row',
    script: 'hiragana',
    letters: [
      { id: 'za',  romaji: 'za',  kana: 'ざ', script: 'hiragana' },
      { id: 'ji',  romaji: 'ji',  kana: 'じ', script: 'hiragana' },
      { id: 'zu',  romaji: 'zu',  kana: 'ず', script: 'hiragana' },
      { id: 'ze',  romaji: 'ze',  kana: 'ぜ', script: 'hiragana' },
      { id: 'zo',  romaji: 'zo',  kana: 'ぞ', script: 'hiragana' },
    ],
  },
  {
    name: 'T-row',
    script: 'hiragana',
    letters: [
      { id: 'ta',  romaji: 'ta',  kana: 'た', script: 'hiragana' },
      { id: 'chi', romaji: 'chi', kana: 'ち', script: 'hiragana' },
      { id: 'tsu', romaji: 'tsu', kana: 'つ', script: 'hiragana' },
      { id: 'te',  romaji: 'te',  kana: 'て', script: 'hiragana' },
      { id: 'to',  romaji: 'to',  kana: 'と', script: 'hiragana' },
    ],
  },
  {
    name: 'D-row',
    script: 'hiragana',
    letters: [
      { id: 'da',  romaji: 'da',  kana: 'だ', script: 'hiragana' },
      { id: 'di',  romaji: 'di',  kana: 'ぢ', script: 'hiragana' },
      { id: 'du',  romaji: 'du',  kana: 'づ', script: 'hiragana' },
      { id: 'de',  romaji: 'de',  kana: 'で', script: 'hiragana' },
      { id: 'do',  romaji: 'do',  kana: 'ど', script: 'hiragana' },
    ],
  },
  {
    name: 'N-row',
    script: 'hiragana',
    letters: [
      { id: 'na',  romaji: 'na',  kana: 'な', script: 'hiragana' },
      { id: 'ni',  romaji: 'ni',  kana: 'に', script: 'hiragana' },
      { id: 'nu',  romaji: 'nu',  kana: 'ぬ', script: 'hiragana' },
      { id: 'ne',  romaji: 'ne',  kana: 'ね', script: 'hiragana' },
      { id: 'no',  romaji: 'no',  kana: 'の', script: 'hiragana' },
    ],
  },
  {
    name: 'H-row',
    script: 'hiragana',
    letters: [
      { id: 'ha',  romaji: 'ha',  kana: 'は', script: 'hiragana' },
      { id: 'hi',  romaji: 'hi',  kana: 'ひ', script: 'hiragana' },
      { id: 'fu',  romaji: 'fu',  kana: 'ふ', script: 'hiragana' },
      { id: 'he',  romaji: 'he',  kana: 'へ', script: 'hiragana' },
      { id: 'ho',  romaji: 'ho',  kana: 'ほ', script: 'hiragana' },
    ],
  },
  {
    name: 'B-row',
    script: 'hiragana',
    letters: [
      { id: 'ba',  romaji: 'ba',  kana: 'ば', script: 'hiragana' },
      { id: 'bi',  romaji: 'bi',  kana: 'び', script: 'hiragana' },
      { id: 'bu',  romaji: 'bu',  kana: 'ぶ', script: 'hiragana' },
      { id: 'be',  romaji: 'be',  kana: 'べ', script: 'hiragana' },
      { id: 'bo',  romaji: 'bo',  kana: 'ぼ', script: 'hiragana' },
    ],
  },
  {
    name: 'P-row',
    script: 'hiragana',
    letters: [
      { id: 'pa',  romaji: 'pa',  kana: 'ぱ', script: 'hiragana' },
      { id: 'pi',  romaji: 'pi',  kana: 'ぴ', script: 'hiragana' },
      { id: 'pu',  romaji: 'pu',  kana: 'ぷ', script: 'hiragana' },
      { id: 'pe',  romaji: 'pe',  kana: 'ぺ', script: 'hiragana' },
      { id: 'po',  romaji: 'po',  kana: 'ぽ', script: 'hiragana' },
    ],
  },
  {
    name: 'M-row',
    script: 'hiragana',
    letters: [
      { id: 'ma',  romaji: 'ma',  kana: 'ま', script: 'hiragana' },
      { id: 'mi',  romaji: 'mi',  kana: 'み', script: 'hiragana' },
      { id: 'mu',  romaji: 'mu',  kana: 'む', script: 'hiragana' },
      { id: 'me',  romaji: 'me',  kana: 'め', script: 'hiragana' },
      { id: 'mo',  romaji: 'mo',  kana: 'も', script: 'hiragana' },
    ],
  },
  {
    name: 'Y-row',
    script: 'hiragana',
    letters: [
      { id: 'ya',  romaji: 'ya',  kana: 'や', script: 'hiragana' },
      { id: 'yu',  romaji: 'yu',  kana: 'ゆ', script: 'hiragana' },
      { id: 'yo',  romaji: 'yo',  kana: 'よ', script: 'hiragana' },
    ],
  },
  {
    name: 'R-row',
    script: 'hiragana',
    letters: [
      { id: 'ra',  romaji: 'ra',  kana: 'ら', script: 'hiragana' },
      { id: 'ri',  romaji: 'ri',  kana: 'り', script: 'hiragana' },
      { id: 'ru',  romaji: 'ru',  kana: 'る', script: 'hiragana' },
      { id: 're',  romaji: 're',  kana: 'れ', script: 'hiragana' },
      { id: 'ro',  romaji: 'ro',  kana: 'ろ', script: 'hiragana' },
    ],
  },
  {
    name: 'W-row',
    script: 'hiragana',
    letters: [
      { id: 'wa',  romaji: 'wa',  kana: 'わ', script: 'hiragana' },
      { id: 'wo',  romaji: 'wo',  kana: 'を', script: 'hiragana' },
    ],
  },
  {
    name: 'N',
    script: 'hiragana',
    letters: [
      { id: 'n',   romaji: 'n',   kana: 'ん', script: 'hiragana' },
    ],
  },
];

// ── Katakana rows (parallel to hiragana) ──────────────────────

export const KATAKANA_ROWS = [
  {
    name: 'Vowels',
    script: 'katakana',
    letters: [
      { id: 'a_k',   romaji: 'a',   kana: 'ア', script: 'katakana' },
      { id: 'i_k',   romaji: 'i',   kana: 'イ', script: 'katakana' },
      { id: 'u_k',   romaji: 'u',   kana: 'ウ', script: 'katakana' },
      { id: 'e_k',   romaji: 'e',   kana: 'エ', script: 'katakana' },
      { id: 'o_k',   romaji: 'o',   kana: 'オ', script: 'katakana' },
    ],
  },
  {
    name: 'K-row',
    script: 'katakana',
    letters: [
      { id: 'ka_k',  romaji: 'ka',  kana: 'カ', script: 'katakana' },
      { id: 'ki_k',  romaji: 'ki',  kana: 'キ', script: 'katakana' },
      { id: 'ku_k',  romaji: 'ku',  kana: 'ク', script: 'katakana' },
      { id: 'ke_k',  romaji: 'ke',  kana: 'ケ', script: 'katakana' },
      { id: 'ko_k',  romaji: 'ko',  kana: 'コ', script: 'katakana' },
    ],
  },
  {
    name: 'G-row',
    script: 'katakana',
    letters: [
      { id: 'ga_k',  romaji: 'ga',  kana: 'ガ', script: 'katakana' },
      { id: 'gi_k',  romaji: 'gi',  kana: 'ギ', script: 'katakana' },
      { id: 'gu_k',  romaji: 'gu',  kana: 'グ', script: 'katakana' },
      { id: 'ge_k',  romaji: 'ge',  kana: 'ゲ', script: 'katakana' },
      { id: 'go_k',  romaji: 'go',  kana: 'ゴ', script: 'katakana' },
    ],
  },
  {
    name: 'S-row',
    script: 'katakana',
    letters: [
      { id: 'sa_k',  romaji: 'sa',  kana: 'サ', script: 'katakana' },
      { id: 'shi_k', romaji: 'shi', kana: 'シ', script: 'katakana' },
      { id: 'su_k',  romaji: 'su',  kana: 'ス', script: 'katakana' },
      { id: 'se_k',  romaji: 'se',  kana: 'セ', script: 'katakana' },
      { id: 'so_k',  romaji: 'so',  kana: 'ソ', script: 'katakana' },
    ],
  },
  {
    name: 'Z-row',
    script: 'katakana',
    letters: [
      { id: 'za_k',  romaji: 'za',  kana: 'ザ', script: 'katakana' },
      { id: 'ji_k',  romaji: 'ji',  kana: 'ジ', script: 'katakana' },
      { id: 'zu_k',  romaji: 'zu',  kana: 'ズ', script: 'katakana' },
      { id: 'ze_k',  romaji: 'ze',  kana: 'ゼ', script: 'katakana' },
      { id: 'zo_k',  romaji: 'zo',  kana: 'ゾ', script: 'katakana' },
    ],
  },
  {
    name: 'T-row',
    script: 'katakana',
    letters: [
      { id: 'ta_k',  romaji: 'ta',  kana: 'タ', script: 'katakana' },
      { id: 'chi_k', romaji: 'chi', kana: 'チ', script: 'katakana' },
      { id: 'tsu_k', romaji: 'tsu', kana: 'ツ', script: 'katakana' },
      { id: 'te_k',  romaji: 'te',  kana: 'テ', script: 'katakana' },
      { id: 'to_k',  romaji: 'to',  kana: 'ト', script: 'katakana' },
    ],
  },
  {
    name: 'D-row',
    script: 'katakana',
    letters: [
      { id: 'da_k',  romaji: 'da',  kana: 'ダ', script: 'katakana' },
      { id: 'di_k',  romaji: 'di',  kana: 'ヂ', script: 'katakana' },
      { id: 'du_k',  romaji: 'du',  kana: 'ヅ', script: 'katakana' },
      { id: 'de_k',  romaji: 'de',  kana: 'デ', script: 'katakana' },
      { id: 'do_k',  romaji: 'do',  kana: 'ド', script: 'katakana' },
    ],
  },
  {
    name: 'N-row',
    script: 'katakana',
    letters: [
      { id: 'na_k',  romaji: 'na',  kana: 'ナ', script: 'katakana' },
      { id: 'ni_k',  romaji: 'ni',  kana: 'ニ', script: 'katakana' },
      { id: 'nu_k',  romaji: 'nu',  kana: 'ヌ', script: 'katakana' },
      { id: 'ne_k',  romaji: 'ne',  kana: 'ネ', script: 'katakana' },
      { id: 'no_k',  romaji: 'no',  kana: 'ノ', script: 'katakana' },
    ],
  },
  {
    name: 'H-row',
    script: 'katakana',
    letters: [
      { id: 'ha_k',  romaji: 'ha',  kana: 'ハ', script: 'katakana' },
      { id: 'hi_k',  romaji: 'hi',  kana: 'ヒ', script: 'katakana' },
      { id: 'fu_k',  romaji: 'fu',  kana: 'フ', script: 'katakana' },
      { id: 'he_k',  romaji: 'he',  kana: 'ヘ', script: 'katakana' },
      { id: 'ho_k',  romaji: 'ho',  kana: 'ホ', script: 'katakana' },
    ],
  },
  {
    name: 'B-row',
    script: 'katakana',
    letters: [
      { id: 'ba_k',  romaji: 'ba',  kana: 'バ', script: 'katakana' },
      { id: 'bi_k',  romaji: 'bi',  kana: 'ビ', script: 'katakana' },
      { id: 'bu_k',  romaji: 'bu',  kana: 'ブ', script: 'katakana' },
      { id: 'be_k',  romaji: 'be',  kana: 'ベ', script: 'katakana' },
      { id: 'bo_k',  romaji: 'bo',  kana: 'ボ', script: 'katakana' },
    ],
  },
  {
    name: 'P-row',
    script: 'katakana',
    letters: [
      { id: 'pa_k',  romaji: 'pa',  kana: 'パ', script: 'katakana' },
      { id: 'pi_k',  romaji: 'pi',  kana: 'ピ', script: 'katakana' },
      { id: 'pu_k',  romaji: 'pu',  kana: 'プ', script: 'katakana' },
      { id: 'pe_k',  romaji: 'pe',  kana: 'ペ', script: 'katakana' },
      { id: 'po_k',  romaji: 'po',  kana: 'ポ', script: 'katakana' },
    ],
  },
  {
    name: 'M-row',
    script: 'katakana',
    letters: [
      { id: 'ma_k',  romaji: 'ma',  kana: 'マ', script: 'katakana' },
      { id: 'mi_k',  romaji: 'mi',  kana: 'ミ', script: 'katakana' },
      { id: 'mu_k',  romaji: 'mu',  kana: 'ム', script: 'katakana' },
      { id: 'me_k',  romaji: 'me',  kana: 'メ', script: 'katakana' },
      { id: 'mo_k',  romaji: 'mo',  kana: 'モ', script: 'katakana' },
    ],
  },
  {
    name: 'Y-row',
    script: 'katakana',
    letters: [
      { id: 'ya_k',  romaji: 'ya',  kana: 'ヤ', script: 'katakana' },
      { id: 'yu_k',  romaji: 'yu',  kana: 'ユ', script: 'katakana' },
      { id: 'yo_k',  romaji: 'yo',  kana: 'ヨ', script: 'katakana' },
    ],
  },
  {
    name: 'R-row',
    script: 'katakana',
    letters: [
      { id: 'ra_k',  romaji: 'ra',  kana: 'ラ', script: 'katakana' },
      { id: 'ri_k',  romaji: 'ri',  kana: 'リ', script: 'katakana' },
      { id: 'ru_k',  romaji: 'ru',  kana: 'ル', script: 'katakana' },
      { id: 're_k',  romaji: 're',  kana: 'レ', script: 'katakana' },
      { id: 'ro_k',  romaji: 'ro',  kana: 'ロ', script: 'katakana' },
    ],
  },
  {
    name: 'W-row',
    script: 'katakana',
    letters: [
      { id: 'wa_k',  romaji: 'wa',  kana: 'ワ', script: 'katakana' },
      { id: 'wo_k',  romaji: 'wo',  kana: 'ヲ', script: 'katakana' },
    ],
  },
  {
    name: 'N',
    script: 'katakana',
    letters: [
      { id: 'n_k',   romaji: 'n',   kana: 'ン', script: 'katakana' },
    ],
  },
];

// ── Combined structures ───────────────────────────────────────

/** All rows, both scripts — used for stats display */
export const ROWS = [...HIRAGANA_ROWS, ...KATAKANA_ROWS];

export const TOTAL_HIRAGANA_ROWS = HIRAGANA_ROWS.length;
export const TOTAL_KATAKANA_ROWS = KATAKANA_ROWS.length;

/** Flat list of all letters with their row index (within their script) attached */
export const ALL_HIRAGANA = HIRAGANA_ROWS.flatMap((row, rowIndex) =>
  row.letters.map((letter) => ({ ...letter, row: rowIndex }))
);

export const ALL_KATAKANA = KATAKANA_ROWS.flatMap((row, rowIndex) =>
  row.letters.map((letter) => ({ ...letter, row: rowIndex }))
);

export const ALL_LETTERS = [...ALL_HIRAGANA, ...ALL_KATAKANA];

/** Quick lookup by id */
export const LETTER_BY_ID = Object.fromEntries(
  ALL_LETTERS.map((l) => [l.id, l])
);

/** Romaji → hiragana kana lookup */
export const ROMAJI_TO_HIRAGANA = Object.fromEntries(
  ALL_HIRAGANA.map((l) => [l.romaji, l.kana])
);

/** Romaji → katakana kana lookup */
export const ROMAJI_TO_KATAKANA = Object.fromEntries(
  ALL_KATAKANA.map((l) => [l.romaji, l.kana])
);

export const TOTAL_KANA = ALL_LETTERS.length;
