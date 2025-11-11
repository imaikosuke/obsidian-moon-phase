import { App, Modal, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { calculateMoonAge } from './src/utils/moonCalculation';
import { MoonAgeInfo, MoonPhase } from './src/types';
import { getPhaseEmoji, getPhaseName } from './src/utils/moonPhaseUtils';
import { MoonAgeView, MOON_AGE_VIEW_TYPE } from './src/ui/MoonAgeView';

interface MoonPhasePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MoonPhasePluginSettings = {
	mySetting: 'default'
}

export default class MoonPhasePlugin extends Plugin {
	settings: MoonPhasePluginSettings;
	statusBarItemEl: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		// リボンアイコンを追加（左サイドバー）
		this.addRibbonIcon('moon', 'Show moon age', (_evt: MouseEvent) => {
			const moonInfo = calculateMoonAge();
			new MoonAgeModal(this.app, moonInfo).open();
		});

		// ステータスバーに月齢を表示
		this.statusBarItemEl = this.addStatusBarItem();
		this.updateStatusBar();

		// 月齢ビューを登録
		this.registerView(
			MOON_AGE_VIEW_TYPE,
			(leaf) => new MoonAgeView(leaf)
		);

		// 月齢を表示するコマンド
		this.addCommand({
			id: 'show-moon-age',
			name: 'Show moon age',
			callback: () => {
				const moonInfo = calculateMoonAge();
				new MoonAgeModal(this.app, moonInfo).open();
			}
		});

		// 月齢ビューを開くコマンド
		this.addCommand({
			id: 'open-moon-age-view',
			name: 'Open moon age view',
			callback: () => {
				this.activateView();
			}
		});

		// 1時間ごとにステータスバーを更新
		this.registerInterval(window.setInterval(() => {
			this.updateStatusBar();
		}, 60 * 60 * 1000));

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MoonPhaseSettingTab(this.app, this));
	}

	onunload() {
		// registerIntervalを使用しているため、自動的にクリーンアップされる
	}

	updateStatusBar() {
		if (this.statusBarItemEl) {
			const moonInfo = calculateMoonAge();
			const emoji = getPhaseEmoji(moonInfo.phase);
			const phaseName = getPhaseName(moonInfo.phase);
			this.statusBarItemEl.setText(`${emoji} ${phaseName} (${moonInfo.illumination}%)`);
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

	constructor(app: App, moonInfo: MoonAgeInfo) {
		super(app);
		this.moonInfo = moonInfo;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		const emoji = getPhaseEmoji(this.moonInfo.phase);
		const phaseName = getPhaseName(this.moonInfo.phase);

		contentEl.createEl('h2', { text: 'Moon Age Information' });

		const infoDiv = contentEl.createDiv();
		infoDiv.createEl('p', { 
			text: `${emoji} ${phaseName}` 
		});
		infoDiv.createEl('p', { 
			text: `Age: ${this.moonInfo.age} days` 
		});
		infoDiv.createEl('p', { 
			text: `Illumination: ${this.moonInfo.illumination}%` 
		});
		infoDiv.createEl('p', { 
			text: `Next New Moon: ${this.moonInfo.nextNewMoon.toLocaleString()}` 
		});
		infoDiv.createEl('p', { 
			text: `Next Full Moon: ${this.moonInfo.nextFullMoon.toLocaleString()}` 
		});
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

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
