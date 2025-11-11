import { ItemView, WorkspaceLeaf, Plugin } from 'obsidian';
import { calculateMoonAge } from '../utils/moonCalculation';
import { getPhaseEmoji } from '../utils/moonPhaseUtils';
import { t } from '../utils/i18n';
import { MoonPhasePluginSettings } from '../settings';
import { getDateInTimezone } from '../utils/timezoneUtils';

export const MOON_AGE_VIEW_TYPE = 'moon-age-view';

export class MoonAgeView extends ItemView {
	plugin: Plugin;
	settings: MoonPhasePluginSettings;

	constructor(leaf: WorkspaceLeaf, plugin: Plugin, settings: MoonPhasePluginSettings) {
		super(leaf);
		this.plugin = plugin;
		this.settings = settings;
	}

	getViewType(): string {
		return MOON_AGE_VIEW_TYPE;
	}

	getDisplayText(): string {
		return t('view.name');
	}

	getIcon(): string {
		return 'moon';
	}

	async onOpen() {
		this.updateDisplay();
	}

	async onClose() {
		// クリーンアップ処理（必要に応じて追加）
	}

	/**
	 * 設定を更新して表示を再描画
	 */
	updateSettings(newSettings: MoonPhasePluginSettings) {
		this.settings = newSettings;
		// 表示を更新
		this.updateDisplay();
	}

	updateDisplay() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.style.display = 'flex';
		contentEl.style.alignItems = 'center';
		contentEl.style.justifyContent = 'center';
		contentEl.style.height = '100%';

		// タイムゾーンを考慮した日時で月齢を計算
		const date = getDateInTimezone(this.settings.timezone);
		const moonInfo = calculateMoonAge(date);
		const emoji = getPhaseEmoji(moonInfo.phase);

		// 月相絵文字だけを大きく表示
		const emojiEl = contentEl.createDiv('moon-phase-emoji');
		emojiEl.style.fontSize = '8em';
		emojiEl.style.textAlign = 'center';
		emojiEl.textContent = emoji;
	}

}

