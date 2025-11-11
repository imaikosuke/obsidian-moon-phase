import { MoonPhase } from '../types';
import { getCurrentLanguage, Language } from './i18n';

/**
 * 月相名のマッピング（英語・日本語）
 */
export const phaseNames: Record<MoonPhase, { en: string; ja: string }> = {
	[MoonPhase.NewMoon]: { en: 'New Moon', ja: '新月' },
	[MoonPhase.WaxingCrescent]: { en: 'Waxing Crescent', ja: '三日月' },
	[MoonPhase.FirstQuarter]: { en: 'First Quarter', ja: '上弦' },
	[MoonPhase.WaxingGibbous]: { en: 'Waxing Gibbous', ja: '十三夜' },
	[MoonPhase.FullMoon]: { en: 'Full Moon', ja: '満月' },
	[MoonPhase.WaningGibbous]: { en: 'Waning Gibbous', ja: '十六夜' },
	[MoonPhase.LastQuarter]: { en: 'Last Quarter', ja: '下弦' },
	[MoonPhase.WaningCrescent]: { en: 'Waning Crescent', ja: '有明' }
};

/**
 * 月相絵文字のマッピング
 */
export const phaseEmojis: Record<MoonPhase, string> = {
	[MoonPhase.NewMoon]: '🌑',
	[MoonPhase.WaxingCrescent]: '🌒',
	[MoonPhase.FirstQuarter]: '🌓',
	[MoonPhase.WaxingGibbous]: '🌔',
	[MoonPhase.FullMoon]: '🌕',
	[MoonPhase.WaningGibbous]: '🌖',
	[MoonPhase.LastQuarter]: '🌗',
	[MoonPhase.WaningCrescent]: '🌘'
};

/**
 * 言語に応じた月相名を取得
 * @param phase 月相
 * @param lang 言語設定（'auto'の場合はObsidianの設定に従う、省略時は自動検出）
 * @returns 月相名
 */
export function getPhaseName(phase: MoonPhase, lang?: 'auto' | 'ja' | 'en'): string {
	const currentLang: Language = getCurrentLanguage(lang);
	return phaseNames[phase][currentLang];
}

/**
 * 月相絵文字を取得
 * @param phase 月相
 * @returns 月相絵文字
 */
export function getPhaseEmoji(phase: MoonPhase): string {
	return phaseEmojis[phase];
}

