import { moment } from 'obsidian';

/**
 * 言語コード
 */
export type Language = 'ja' | 'en';

/**
 * 翻訳キー
 */
export type TranslationKey = 
	| 'command.show-moon-age'
	| 'command.open-moon-age-view'
	| 'ribbon.tooltip'
	| 'settings.title'
	| 'settings.show-status-bar'
	| 'settings.show-status-bar-desc'
	| 'settings.show-percentage'
	| 'settings.show-percentage-desc'
	| 'settings.timezone'
	| 'settings.timezone-desc'
	| 'modal.title'
	| 'modal.age'
	| 'modal.illumination'
	| 'modal.next-new-moon'
	| 'modal.next-full-moon'
	| 'modal.hemisphere'
	| 'modal.hemisphere-north'
	| 'modal.hemisphere-south'
	| 'view.name'
	| 'timezone.system-default';

/**
 * 翻訳テキスト
 */
const translations: Record<Language, Record<TranslationKey, string>> = {
	ja: {
		'command.show-moon-age': '月齢を表示',
		'command.open-moon-age-view': '月齢ビューを開く',
		'ribbon.tooltip': '月齢を表示',
		'settings.title': '月齢プラグイン設定',
		'settings.show-status-bar': 'ステータスバーを表示',
		'settings.show-status-bar-desc': 'ステータスバーに月齢情報を表示します',
		'settings.show-percentage': 'パーセンテージを表示',
		'settings.show-percentage-desc': 'ステータスバーに照度パーセンテージを表示します',
		'settings.timezone': 'タイムゾーン',
		'settings.timezone-desc': 'タイムゾーンを選択してください',
		'modal.title': '月齢情報',
		'modal.age': '月齢',
		'modal.illumination': '照度',
		'modal.next-new-moon': '次の新月',
		'modal.next-full-moon': '次の満月',
		'modal.hemisphere': '半球',
		'modal.hemisphere-north': '北半球',
		'modal.hemisphere-south': '南半球',
		'view.name': '月齢',
		'timezone.system-default': 'システムデフォルト'
	},
	en: {
		'command.show-moon-age': 'Show moon age',
		'command.open-moon-age-view': 'Open moon age view',
		'ribbon.tooltip': 'Show moon age',
		'settings.title': 'Moon Phase Settings',
		'settings.show-status-bar': 'Show status bar',
		'settings.show-status-bar-desc': 'Display moon phase information in the status bar',
		'settings.show-percentage': 'Show percentage',
		'settings.show-percentage-desc': 'Display illumination percentage in the status bar',
		'settings.timezone': 'Timezone',
		'settings.timezone-desc': 'Select your timezone',
		'modal.title': 'Moon Age Information',
		'modal.age': 'Age',
		'modal.illumination': 'Illumination',
		'modal.next-new-moon': 'Next New Moon',
		'modal.next-full-moon': 'Next Full Moon',
		'modal.hemisphere': 'Hemisphere',
		'modal.hemisphere-north': 'Northern Hemisphere',
		'modal.hemisphere-south': 'Southern Hemisphere',
		'view.name': 'Moon Age',
		'timezone.system-default': 'System Default'
	}
};

/**
 * 現在の言語を取得
 * Obsidianの現在の言語（ロケール）は moment.locale() で取得できます
 */
export function getCurrentLanguage(): Language {
	try {
		// Obsidianの現在の言語を取得
		const locale = moment.locale();
		const lang = locale.split('-')[0].toLowerCase();
		
		if (lang === 'ja') {
			return 'ja';
		}
	} catch (e) {
		// エラーが発生した場合は英語固定
		return 'en';
	}
	
	// デフォルトは英語
	return 'en';
}

/**
 * 翻訳テキストを取得
 * @param key 翻訳キー
 * @param lang 言語（省略時は自動検出）
 * @returns 翻訳されたテキスト
 */
export function t(key: TranslationKey, lang?: Language): string {
	const currentLang = lang || getCurrentLanguage();
	return translations[currentLang][key] || translations.en[key];
}

