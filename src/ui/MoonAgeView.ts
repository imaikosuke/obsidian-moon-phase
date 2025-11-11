import { ItemView, WorkspaceLeaf, Plugin } from 'obsidian';
import { calculateMoonAge } from '../utils/moonCalculation';
import { getPhaseEmoji, getPhaseName } from '../utils/moonPhaseUtils';
import { t } from '../utils/i18n';
import { MoonPhasePluginSettings } from '../settings';
import { getDateInTimezone } from '../utils/timezoneUtils';

export const MOON_AGE_VIEW_TYPE = 'moon-age-view';

export class MoonAgeView extends ItemView {
	intervalId: number | null = null;
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
		// 設定された間隔で更新
		this.startUpdateInterval();
	}

	async onClose() {
		this.stopUpdateInterval();
	}

	startUpdateInterval() {
		this.stopUpdateInterval();
		const intervalMs = this.settings.updateInterval * 60 * 1000;
		// registerIntervalを使用すると、プラグインのアンロード時に自動的にクリーンアップされる
		this.intervalId = this.plugin.registerInterval(window.setInterval(() => {
			this.updateDisplay();
		}, intervalMs));
	}

	stopUpdateInterval() {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	/**
	 * 設定を更新して表示を再描画
	 */
	updateSettings(newSettings: MoonPhasePluginSettings) {
		this.settings = newSettings;
		// 更新間隔が変更された場合は再設定
		this.startUpdateInterval();
		// 表示を更新
		this.updateDisplay();
	}

	updateDisplay() {
		const { contentEl } = this;
		contentEl.empty();

		// タイムゾーンを考慮した日時で月齢を計算
		const date = getDateInTimezone(this.settings.timezone);
		const moonInfo = calculateMoonAge(date);
		const emoji = getPhaseEmoji(moonInfo.phase);
		const phaseName = getPhaseName(moonInfo.phase);

		// 月相絵文字を大きく表示
		const emojiEl = contentEl.createDiv('moon-phase-emoji');
		emojiEl.style.fontSize = '4em';
		emojiEl.style.textAlign = 'center';
		emojiEl.style.padding = '20px';
		emojiEl.textContent = emoji;

		// 月相名を表示
		const nameEl = contentEl.createDiv('moon-phase-name');
		nameEl.style.textAlign = 'center';
		nameEl.style.fontSize = '1.2em';
		nameEl.style.fontWeight = 'bold';
		nameEl.textContent = phaseName;

		// 月齢情報を表示
		const infoEl = contentEl.createDiv('moon-phase-info');
		infoEl.style.textAlign = 'center';
		infoEl.style.padding = '10px';
		infoEl.createEl('p', { text: `${t('modal.age')}: ${moonInfo.age} days` });
		infoEl.createEl('p', { text: `${t('modal.illumination')}: ${moonInfo.illumination}%` });
	}

}

