import { getTimezoneInfo } from '../settings';

/**
 * タイムゾーンと言語設定から適切なロケールを取得
 * @param timezoneId タイムゾーンID
 * @param lang 言語設定（'auto'の場合はタイムゾーンに基づいて決定、省略時は自動検出）
 * @returns ロケール文字列（'ja-JP' または 'en-US'）
 */
function getLocaleFromTimezone(timezoneId: string, lang?: 'auto' | 'ja' | 'en'): string {
	// 言語設定が明示的に指定されている場合（'auto'以外）は、それを優先
	if (lang && lang !== 'auto') {
		return lang === 'ja' ? 'ja-JP' : 'en-US';
	}

	// 'auto' の場合はタイムゾーンに基づいて決定
	if (timezoneId === 'system') {
		// システムデフォルトの場合は、ブラウザのロケールを使用
		// 日本語環境の場合は 'ja-JP'、それ以外は 'en-US'
		try {
			const browserLocale = navigator.language || navigator.languages?.[0] || 'en-US';
			if (browserLocale.startsWith('ja')) {
				return 'ja-JP';
			}
		} catch (e) {
			// エラーが発生した場合は英語をデフォルトとする
		}
		return 'en-US';
	}

	const tzInfo = getTimezoneInfo(timezoneId);
	if (!tzInfo || !tzInfo.timezone) {
		return 'en-US';
	}

	// 日本系のタイムゾーンの場合は日本語ロケールを使用
	const japaneseTimezones = ['Asia/Tokyo'];
	if (japaneseTimezones.includes(tzInfo.timezone)) {
		return 'ja-JP';
	}

	// その他のタイムゾーンは英語ロケールを使用
	return 'en-US';
}

/**
 * ロケールに応じた日時フォーマットオプションを取得
 * @param locale ロケール（'ja-JP' または 'en-US'）
 * @param timeZone タイムゾーン（オプション）
 * @returns 日時フォーマットオプション
 */
function getDateFormatOptions(locale: string, timeZone?: string): Intl.DateTimeFormatOptions {
	const baseOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	};

	if (locale === 'ja-JP') {
		return {
			...baseOptions,
			month: 'long',
			hour12: false,
			...(timeZone && { timeZone }),
		};
	} else {
		return {
			...baseOptions,
			month: 'short',
			hour12: true,
			...(timeZone && { timeZone }),
		};
	}
}

/**
 * 指定されたタイムゾーンIDに基づいてDateオブジェクトを取得
 * @param timezoneId タイムゾーンID（'system'の場合はシステムデフォルト）
 * @returns Dateオブジェクト
 */
export function getDateInTimezone(timezoneId: string): Date {
	if (timezoneId === 'system') {
		return new Date();
	}

	const tzInfo = getTimezoneInfo(timezoneId);
	if (!tzInfo || !tzInfo.timezone) {
		return new Date();
	}

	// タイムゾーンを考慮した日時を取得
	// 注意: ブラウザ環境では完全なタイムゾーン変換は制限があるため、
	// ここでは基本的な実装を行います
	const now = new Date();
	
	// Intl.DateTimeFormatを使用してタイムゾーン情報を取得
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: tzInfo.timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});

		const parts = formatter.formatToParts(now);
		const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
		const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
		const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
		const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
		const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
		const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

		return new Date(year, month, day, hour, minute, second);
	} catch (e) {
		// エラーが発生した場合はシステム時刻を返す
		// エラーの詳細はコンソールに記録（開発時のみ）
		if (typeof console !== 'undefined' && console.error) {
			console.error('Error getting date in timezone:', e);
		}
		return new Date();
	}
}

/**
 * 指定されたタイムゾーンで日時をフォーマット
 * @param date 日時
 * @param timezoneId タイムゾーンID
 * @param lang 言語設定（'auto'の場合はタイムゾーンに基づいて決定、省略時は自動検出）
 * @returns フォーマットされた日時文字列
 */
export function formatDateInTimezone(date: Date, timezoneId: string, lang?: 'auto' | 'ja' | 'en'): string {
	const locale = getLocaleFromTimezone(timezoneId, lang);
	
	if (timezoneId === 'system') {
		// システムデフォルトの場合はタイムゾーンに応じたロケールを使用
		const options = getDateFormatOptions(locale);
		try {
			return date.toLocaleString(locale, options);
		} catch (e) {
			return date.toLocaleString();
		}
	}

	const tzInfo = getTimezoneInfo(timezoneId);
	if (!tzInfo || !tzInfo.timezone) {
		// タイムゾーン情報がない場合もタイムゾーンに応じたロケールを使用
		const options = getDateFormatOptions(locale);
		try {
			return date.toLocaleString(locale, options);
		} catch (e) {
			return date.toLocaleString();
		}
	}

	try {
		const options = getDateFormatOptions(locale, tzInfo.timezone);
		return date.toLocaleString(locale, options);
	} catch (e) {
		// エラーが発生した場合はデフォルトのロケール文字列を返す
		// エラーの詳細はコンソールに記録（開発時のみ）
		if (typeof console !== 'undefined' && console.error) {
			console.error('Error formatting date in timezone:', e);
		}
		try {
			return date.toLocaleString(locale);
		} catch (fallbackError) {
			// フォールバックも失敗した場合は、ISO文字列を返す
			return date.toISOString();
		}
	}
}

