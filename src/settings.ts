/**
 * タイムゾーン情報
 */
export interface TimezoneInfo {
	id: string;
	name: string;
	timezone: string;
	hemisphere: 'north' | 'south';
}

/**
 * プラグイン設定
 */
export interface MoonPhasePluginSettings {
	/** ステータスバー表示のON/OFF */
	showStatusBar: boolean;
	/** パーセンテージ表示のON/OFF */
	showPercentage: boolean;
	/** 選択されたタイムゾーンID（'system'の場合はシステムデフォルト） */
	timezone: string;
	/** 言語設定（'auto'の場合はObsidianの言語設定に従う） */
	language: 'auto' | 'ja' | 'en';
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: MoonPhasePluginSettings = {
	showStatusBar: true,
	showPercentage: true,
	timezone: 'system',
	language: 'auto'
};

/**
 * 対応タイムゾーンリスト
 */
export const TIMEZONES: TimezoneInfo[] = [
	{ id: 'system', name: 'System Default', timezone: '', hemisphere: 'north' },
	{ id: 'japan', name: 'Japan', timezone: 'Asia/Tokyo', hemisphere: 'north' },
	{ id: 'us', name: 'United States', timezone: 'America/New_York', hemisphere: 'north' },
	{ id: 'uk', name: 'United Kingdom', timezone: 'Europe/London', hemisphere: 'north' },
	{ id: 'germany', name: 'Germany', timezone: 'Europe/Berlin', hemisphere: 'north' },
	{ id: 'france', name: 'France', timezone: 'Europe/Paris', hemisphere: 'north' },
	{ id: 'australia', name: 'Australia', timezone: 'Australia/Sydney', hemisphere: 'south' },
	{ id: 'china', name: 'China', timezone: 'Asia/Shanghai', hemisphere: 'north' },
	{ id: 'india', name: 'India', timezone: 'Asia/Kolkata', hemisphere: 'north' },
	{ id: 'brazil', name: 'Brazil', timezone: 'America/Sao_Paulo', hemisphere: 'south' },
	{ id: 'canada', name: 'Canada', timezone: 'America/Toronto', hemisphere: 'north' },
	{ id: 'mexico', name: 'Mexico', timezone: 'America/Mexico_City', hemisphere: 'north' },
	{ id: 'korea', name: 'Korea', timezone: 'Asia/Seoul', hemisphere: 'north' },
	{ id: 'singapore', name: 'Singapore', timezone: 'Asia/Singapore', hemisphere: 'north' },
	{ id: 'new-zealand', name: 'New Zealand', timezone: 'Pacific/Auckland', hemisphere: 'south' },
	{ id: 'south-africa', name: 'South Africa', timezone: 'Africa/Johannesburg', hemisphere: 'south' },
	{ id: 'russia', name: 'Russia', timezone: 'Europe/Moscow', hemisphere: 'north' }
];

/**
 * タイムゾーンIDからタイムゾーン情報を取得
 */
export function getTimezoneInfo(timezoneId: string): TimezoneInfo | undefined {
	return TIMEZONES.find(tz => tz.id === timezoneId);
}

/**
 * タイムゾーンIDから半球を取得
 */
export function getHemisphere(timezoneId: string): 'north' | 'south' {
	const tzInfo = getTimezoneInfo(timezoneId);
	return tzInfo ? tzInfo.hemisphere : 'north';
}

