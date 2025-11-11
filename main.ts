import { App, Modal, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { calculateMoonAge } from './src/utils/moonCalculation';
import { MoonAgeInfo } from './src/types';
import { getPhaseEmoji, getPhaseName } from './src/utils/moonPhaseUtils';
import { MoonAgeView, MOON_AGE_VIEW_TYPE } from './src/ui/MoonAgeView';
import { MoonPhasePluginSettings, DEFAULT_SETTINGS, TIMEZONES, getTimezoneInfo } from './src/settings';
import { getDateInTimezone, formatDateInTimezone } from './src/utils/timezoneUtils';
import { t } from './src/utils/i18n';

export default class MoonPhasePlugin extends Plugin {
	settings: MoonPhasePluginSettings;
	statusBarItemEl: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		// リボンアイコンを追加（左サイドバー）
		this.addRibbonIcon('moon', t('ribbon.tooltip', this.settings.language), (_evt: MouseEvent) => {
			const date = getDateInTimezone(this.settings.timezone);
			const moonInfo = calculateMoonAge(date);
			new MoonAgeModal(this.app, moonInfo, this.settings).open();
		});

		// ステータスバーに月齢を表示（設定に基づく）
		if (this.settings.showStatusBar) {
			this.statusBarItemEl = this.addStatusBarItem();
			this.statusBarItemEl.addClass('moon-phase-status-bar');
			this.updateStatusBar();
		}

		// 月齢ビューを登録
		this.registerView(
			MOON_AGE_VIEW_TYPE,
			(leaf) => new MoonAgeView(leaf, this, this.settings)
		);

		// 月齢を表示するコマンド
		this.addCommand({
			id: 'show-moon-age',
			name: t('command.show-moon-age', this.settings.language),
			callback: () => {
				const date = getDateInTimezone(this.settings.timezone);
				const moonInfo = calculateMoonAge(date);
				new MoonAgeModal(this.app, moonInfo, this.settings).open();
			}
		});

		// 月齢ビューを開くコマンド
		this.addCommand({
			id: 'open-moon-age-view',
			name: t('command.open-moon-age-view', this.settings.language),
			callback: () => {
				this.activateView();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MoonPhaseSettingTab(this.app, this));
	}

	onunload() {
		// クリーンアップ処理（必要に応じて追加）
	}

	updateStatusBar() {
		if (this.statusBarItemEl && this.settings.showStatusBar) {
			const date = getDateInTimezone(this.settings.timezone);
			const moonInfo = calculateMoonAge(date);
			const emoji = getPhaseEmoji(moonInfo.phase);
			const phaseName = getPhaseName(moonInfo.phase, this.settings.language);
			
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
		// 設定変更時に開いているビューを更新
		this.updateAllViews();
	}

	/**
	 * 開いているすべてのビューを更新
	 */
	updateAllViews() {
		const leaves = this.app.workspace.getLeavesOfType(MOON_AGE_VIEW_TYPE);
		leaves.forEach(leaf => {
			const view = leaf.view as MoonAgeView;
			if (view && typeof view.updateSettings === 'function') {
				view.updateSettings(this.settings);
			}
		});
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
		contentEl.addClass('moon-phase-modal-content');

		const emoji = getPhaseEmoji(this.moonInfo.phase);
		const phaseName = getPhaseName(this.moonInfo.phase, this.settings.language);

		// ヘッダーセクション
		const headerSection = contentEl.createDiv('moon-phase-modal-header');
		headerSection.createEl('h2', { 
			text: t('modal.title', this.settings.language),
			cls: 'moon-phase-modal-title'
		});

		// ダッシュボードグリッドコンテナ（縦3行）
		const dashboardGrid = contentEl.createDiv('moon-phase-dashboard-grid');

		// 上行：現在の月齢（月相表示）
		const topRow = dashboardGrid.createDiv('moon-phase-row moon-phase-top-row');
		const emojiContainer = topRow.createDiv('moon-phase-emoji-container');
		const emojiEl = emojiContainer.createDiv('moon-phase-emoji-large');
		emojiEl.textContent = emoji;
		const phaseNameEl = topRow.createDiv('moon-phase-name');
		phaseNameEl.textContent = phaseName;

		// 中央行：AGEとILLUMINATION（横2列）
		const centerRow = dashboardGrid.createDiv('moon-phase-row moon-phase-center-row');
		
		// AGEカード
		const ageCard = centerRow.createDiv('moon-phase-stat-card');
		ageCard.createDiv('moon-phase-stat-label').textContent = t('modal.age', this.settings.language);
		const ageValue = ageCard.createDiv('moon-phase-stat-value');
		ageValue.textContent = `${this.moonInfo.age.toFixed(2)} days`;

		// ILLUMINATIONカード（進捗バー付き）
		const illuminationCard = centerRow.createDiv('moon-phase-stat-card');
		illuminationCard.createDiv('moon-phase-stat-label').textContent = t('modal.illumination', this.settings.language);
		const illuminationValue = illuminationCard.createDiv('moon-phase-stat-value');
		illuminationValue.textContent = `${this.moonInfo.illumination.toFixed(1)}%`;
		const progressBar = illuminationCard.createDiv('moon-phase-progress-container');
		const progressFill = progressBar.createDiv('moon-phase-progress-fill');
		progressFill.style.width = `${this.moonInfo.illumination}%`;

		// タイムゾーンを考慮した日時表示
		const nextNewMoonStr = formatDateInTimezone(this.moonInfo.nextNewMoon, this.settings.timezone);
		const nextFullMoonStr = formatDateInTimezone(this.moonInfo.nextFullMoon, this.settings.timezone);
		
		// 3行目：NEXT NEW MOON（1列目）
		const newMoonRow = dashboardGrid.createDiv('moon-phase-row moon-phase-event-row');
		const newMoonCard = newMoonRow.createDiv('moon-phase-event-card');
		newMoonCard.createDiv('moon-phase-event-icon').textContent = '🌑';
		const newMoonInfo = newMoonCard.createDiv('moon-phase-event-info');
		newMoonInfo.createDiv('moon-phase-event-label').textContent = t('modal.next-new-moon', this.settings.language);
		newMoonInfo.createDiv('moon-phase-event-date').textContent = nextNewMoonStr;

		// 4行目：NEXT FULL MOON（2列目）
		const fullMoonRow = dashboardGrid.createDiv('moon-phase-row moon-phase-event-row');
		const fullMoonCard = fullMoonRow.createDiv('moon-phase-event-card');
		fullMoonCard.createDiv('moon-phase-event-icon').textContent = '🌕';
		const fullMoonInfo = fullMoonCard.createDiv('moon-phase-event-info');
		fullMoonInfo.createDiv('moon-phase-event-label').textContent = t('modal.next-full-moon', this.settings.language);
		fullMoonInfo.createDiv('moon-phase-event-date').textContent = nextFullMoonStr;

		// 5行目：HEMISPHERE（3列目）
		const tzInfo = getTimezoneInfo(this.settings.timezone);
		if (tzInfo) {
			const hemisphere = tzInfo.hemisphere === 'north' ? t('modal.hemisphere-north', this.settings.language) : t('modal.hemisphere-south', this.settings.language);
			const hemisphereRow = dashboardGrid.createDiv('moon-phase-row moon-phase-event-row');
			const hemisphereCard = hemisphereRow.createDiv('moon-phase-event-card');
			hemisphereCard.createDiv('moon-phase-event-icon').textContent = '🌍';
			const hemisphereInfo = hemisphereCard.createDiv('moon-phase-event-info');
			hemisphereInfo.createDiv('moon-phase-event-label').textContent = t('modal.hemisphere', this.settings.language);
			hemisphereInfo.createDiv('moon-phase-event-date').textContent = hemisphere;
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

		containerEl.createEl('h2', { text: t('settings.title', this.plugin.settings.language) });

		// 言語選択
		new Setting(containerEl)
			.setName(t('settings.language', this.plugin.settings.language))
			.setDesc(t('settings.language-desc', this.plugin.settings.language))
			.addDropdown(dropdown => {
				dropdown.addOption('auto', t('settings.language-auto', this.plugin.settings.language));
				dropdown.addOption('ja', '日本語');
				dropdown.addOption('en', 'English');
				dropdown.setValue(this.plugin.settings.language);
				dropdown.onChange(async (value) => {
					this.plugin.settings.language = value as 'auto' | 'ja' | 'en';
					await this.plugin.saveData(this.plugin.settings);
					// 設定画面を再描画して言語を反映
					this.display();
				});
			});

		// ステータスバー表示のON/OFF
		new Setting(containerEl)
			.setName(t('settings.show-status-bar', this.plugin.settings.language))
			.setDesc(t('settings.show-status-bar-desc', this.plugin.settings.language))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showStatusBar)
				.onChange(async (value) => {
					this.plugin.settings.showStatusBar = value;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.updateAllViews();
					
					// ステータスバーの表示/非表示を切り替え
					if (value && !this.plugin.statusBarItemEl) {
						this.plugin.statusBarItemEl = this.plugin.addStatusBarItem();
						this.plugin.statusBarItemEl.addClass('moon-phase-status-bar');
						this.plugin.updateStatusBar();
					} else if (!value && this.plugin.statusBarItemEl) {
						this.plugin.statusBarItemEl.setText('');
					} else if (value) {
						this.plugin.updateStatusBar();
					}
				}));

		// パーセンテージ表示のON/OFF
		new Setting(containerEl)
			.setName(t('settings.show-percentage', this.plugin.settings.language))
			.setDesc(t('settings.show-percentage-desc', this.plugin.settings.language))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showPercentage)
				.onChange(async (value) => {
					this.plugin.settings.showPercentage = value;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.updateStatusBar();
					this.plugin.updateAllViews();
				}));

		// タイムゾーン選択
		new Setting(containerEl)
			.setName(t('settings.timezone', this.plugin.settings.language))
			.setDesc(t('settings.timezone-desc', this.plugin.settings.language))
			.addDropdown(dropdown => {
				TIMEZONES.forEach(tz => {
					// システムデフォルトの表示名を多言語対応
					const displayName = tz.id === 'system' ? t('timezone.system-default', this.plugin.settings.language) : tz.name;
					dropdown.addOption(tz.id, displayName);
				});
				dropdown.setValue(this.plugin.settings.timezone);
				dropdown.onChange(async (value) => {
					this.plugin.settings.timezone = value;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.updateStatusBar();
					this.plugin.updateAllViews();
				});
			});
	}
}

