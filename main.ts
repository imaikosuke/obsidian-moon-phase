import { App, Modal, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { calculateMoonAge } from './src/utils/moonCalculation';
import { MoonAgeInfo, MoonPhase } from './src/types';
import { getPhaseEmoji, getPhaseName } from './src/utils/moonPhaseUtils';
import { MoonAgeView, MOON_AGE_VIEW_TYPE } from './src/ui/MoonAgeView';
import { MoonPhasePluginSettings, DEFAULT_SETTINGS, TIMEZONES, getTimezoneInfo } from './src/settings';
import { getDateInTimezone, formatDateInTimezone } from './src/utils/timezoneUtils';
import { t } from './src/utils/i18n';

export default class MoonPhasePlugin extends Plugin {
	settings: MoonPhasePluginSettings;
	statusBarItemEl: HTMLElement | null = null;
	updateIntervalId: number | null = null;

	async onload() {
		await this.loadSettings();

		// リボンアイコンを追加（左サイドバー）
		this.addRibbonIcon('moon', t('ribbon.tooltip'), (_evt: MouseEvent) => {
			const date = getDateInTimezone(this.settings.timezone);
			const moonInfo = calculateMoonAge(date);
			new MoonAgeModal(this.app, moonInfo, this.settings).open();
		});

		// ステータスバーに月齢を表示（設定に基づく）
		if (this.settings.showStatusBar) {
			this.statusBarItemEl = this.addStatusBarItem();
			this.updateStatusBar();
		}

		// 月齢ビューを登録
		this.registerView(
			MOON_AGE_VIEW_TYPE,
			(leaf) => new MoonAgeView(leaf)
		);

		// 月齢を表示するコマンド
		this.addCommand({
			id: 'show-moon-age',
			name: t('command.show-moon-age'),
			callback: () => {
				const date = getDateInTimezone(this.settings.timezone);
				const moonInfo = calculateMoonAge(date);
				new MoonAgeModal(this.app, moonInfo, this.settings).open();
			}
		});

		// 月齢ビューを開くコマンド
		this.addCommand({
			id: 'open-moon-age-view',
			name: t('command.open-moon-age-view'),
			callback: () => {
				this.activateView();
			}
		});

		// 設定された間隔でステータスバーを更新
		this.startUpdateInterval();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MoonPhaseSettingTab(this.app, this));
	}

	onunload() {
		// インターバルをクリーンアップ
		this.stopUpdateInterval();
	}

	startUpdateInterval() {
		this.stopUpdateInterval();
		const intervalMs = this.settings.updateInterval * 60 * 1000;
		// registerIntervalを使用すると、プラグインのアンロード時に自動的にクリーンアップされる
		this.updateIntervalId = this.registerInterval(window.setInterval(() => {
			this.updateStatusBar();
		}, intervalMs));
	}

	stopUpdateInterval() {
		if (this.updateIntervalId !== null) {
			window.clearInterval(this.updateIntervalId);
			this.updateIntervalId = null;
		}
	}

	updateStatusBar() {
		if (this.statusBarItemEl && this.settings.showStatusBar) {
			const date = getDateInTimezone(this.settings.timezone);
			const moonInfo = calculateMoonAge(date);
			const emoji = getPhaseEmoji(moonInfo.phase);
			const phaseName = getPhaseName(moonInfo.phase);
			
			let text = `${emoji} ${phaseName}`;
			if (this.settings.showPercentage) {
				text += ` (${moonInfo.illumination}%)`;
			}
			this.statusBarItemEl.setText(text);
		} else if (this.statusBarItemEl && !this.settings.showStatusBar) {
			// ステータスバーを非表示にする
			this.statusBarItemEl.setText('');
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(MOON_AGE_VIEW_TYPE);

		if (leaves.length > 0) {
			// 既にビューが開いている場合はそれをアクティブにする
			leaf = leaves[0];
		} else {
			// 新しいビューを作成
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: MOON_AGE_VIEW_TYPE, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MoonAgeModal extends Modal {
	moonInfo: MoonAgeInfo;
	settings: MoonPhasePluginSettings;

	constructor(app: App, moonInfo: MoonAgeInfo, settings: MoonPhasePluginSettings) {
		super(app);
		this.moonInfo = moonInfo;
		this.settings = settings;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		const emoji = getPhaseEmoji(this.moonInfo.phase);
		const phaseName = getPhaseName(this.moonInfo.phase);

		contentEl.createEl('h2', { text: t('modal.title') });

		const infoDiv = contentEl.createDiv();
		infoDiv.createEl('p', { 
			text: `${emoji} ${phaseName}` 
		});
		infoDiv.createEl('p', { 
			text: `${t('modal.age')}: ${this.moonInfo.age} days` 
		});
		infoDiv.createEl('p', { 
			text: `${t('modal.illumination')}: ${this.moonInfo.illumination}%` 
		});
		// タイムゾーンを考慮した日時表示
		const nextNewMoonStr = formatDateInTimezone(this.moonInfo.nextNewMoon, this.settings.timezone);
		const nextFullMoonStr = formatDateInTimezone(this.moonInfo.nextFullMoon, this.settings.timezone);
		
		infoDiv.createEl('p', { 
			text: `${t('modal.next-new-moon')}: ${nextNewMoonStr}` 
		});
		infoDiv.createEl('p', { 
			text: `${t('modal.next-full-moon')}: ${nextFullMoonStr}` 
		});

		// 半球情報を表示
		const tzInfo = getTimezoneInfo(this.settings.timezone);
		if (tzInfo) {
			const hemisphere = tzInfo.hemisphere === 'north' ? t('modal.hemisphere-north') : t('modal.hemisphere-south');
			infoDiv.createEl('p', { 
				text: `${t('modal.hemisphere')}: ${hemisphere}` 
			});
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class MoonPhaseSettingTab extends PluginSettingTab {
	plugin: MoonPhasePlugin;

	constructor(app: App, plugin: MoonPhasePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: t('settings.title') });

		// ステータスバー表示のON/OFF
		new Setting(containerEl)
			.setName(t('settings.show-status-bar'))
			.setDesc(t('settings.show-status-bar-desc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showStatusBar)
				.onChange(async (value) => {
					this.plugin.settings.showStatusBar = value;
					await this.plugin.saveSettings();
					
					// ステータスバーの表示/非表示を切り替え
					if (value && !this.plugin.statusBarItemEl) {
						this.plugin.statusBarItemEl = this.plugin.addStatusBarItem();
						this.plugin.updateStatusBar();
					} else if (!value && this.plugin.statusBarItemEl) {
						this.plugin.statusBarItemEl.setText('');
					} else if (value) {
						this.plugin.updateStatusBar();
					}
				}));

		// パーセンテージ表示のON/OFF
		new Setting(containerEl)
			.setName(t('settings.show-percentage'))
			.setDesc(t('settings.show-percentage-desc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showPercentage)
				.onChange(async (value) => {
					this.plugin.settings.showPercentage = value;
					await this.plugin.saveSettings();
					this.plugin.updateStatusBar();
				}));

		// 更新間隔の設定
		new Setting(containerEl)
			.setName(t('settings.update-interval'))
			.setDesc(t('settings.update-interval-desc'))
			.addText(text => text
				.setPlaceholder('60')
				.setValue(this.plugin.settings.updateInterval.toString())
				.onChange(async (value) => {
					const interval = parseInt(value);
					if (!isNaN(interval) && interval > 0) {
						this.plugin.settings.updateInterval = interval;
						await this.plugin.saveSettings();
						this.plugin.startUpdateInterval();
					}
				}));

		// タイムゾーン選択
		new Setting(containerEl)
			.setName(t('settings.timezone'))
			.setDesc(t('settings.timezone-desc'))
			.addDropdown(dropdown => {
				TIMEZONES.forEach(tz => {
					// システムデフォルトの表示名を多言語対応
					const displayName = tz.id === 'system' ? t('timezone.system-default') : tz.name;
					dropdown.addOption(tz.id, displayName);
				});
				dropdown.setValue(this.plugin.settings.timezone);
				dropdown.onChange(async (value) => {
					this.plugin.settings.timezone = value;
					await this.plugin.saveSettings();
					this.plugin.updateStatusBar();
				});
			});
	}
}

