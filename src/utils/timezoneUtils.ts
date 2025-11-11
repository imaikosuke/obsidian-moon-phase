import { getTimezoneInfo } from '../settings';

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
 * @returns フォーマットされた日時文字列
 */
export function formatDateInTimezone(date: Date, timezoneId: string): string {
	if (timezoneId === 'system') {
		return date.toLocaleString();
	}

	const tzInfo = getTimezoneInfo(timezoneId);
	if (!tzInfo || !tzInfo.timezone) {
		return date.toLocaleString();
	}

	try {
		return date.toLocaleString('en-US', {
			timeZone: tzInfo.timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	} catch (e) {
		// エラーが発生した場合はデフォルトのロケール文字列を返す
		// エラーの詳細はコンソールに記録（開発時のみ）
		if (typeof console !== 'undefined' && console.error) {
			console.error('Error formatting date in timezone:', e);
		}
		try {
			return date.toLocaleString();
		} catch (fallbackError) {
			// フォールバックも失敗した場合は、ISO文字列を返す
			return date.toISOString();
		}
	}
}

