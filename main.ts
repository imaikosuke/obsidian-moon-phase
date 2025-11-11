import { App, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { calculateMoonAge } from './src/utils/moonCalculation';
import { MoonAgeInfo, MoonPhase } from './src/types';

interface MoonPhasePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MoonPhasePluginSettings = {
	mySetting: 'default'
}

export default class MoonPhasePlugin extends Plugin {
	settings: MoonPhasePluginSettings;

	async onload() {
		await this.loadSettings();

		// 月齢を表示するコマンド
		this.addCommand({
			id: 'show-moon-age',
			name: 'Show moon age',
			callback: () => {
				const moonInfo = calculateMoonAge();
				new MoonAgeModal(this.app, moonInfo).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MoonPhaseSettingTab(this.app, this));
	}

	onunload() {

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

		// 月相名のマッピング
		const phaseNames: Record<MoonPhase, string> = {
			[MoonPhase.NewMoon]: 'New Moon (新月)',
			[MoonPhase.WaxingCrescent]: 'Waxing Crescent (三日月)',
			[MoonPhase.FirstQuarter]: 'First Quarter (上弦)',
			[MoonPhase.WaxingGibbous]: 'Waxing Gibbous (十三夜)',
			[MoonPhase.FullMoon]: 'Full Moon (満月)',
			[MoonPhase.WaningGibbous]: 'Waning Gibbous (十六夜)',
			[MoonPhase.LastQuarter]: 'Last Quarter (下弦)',
			[MoonPhase.WaningCrescent]: 'Waning Crescent (有明)'
		};

		// 月相絵文字のマッピング
		const phaseEmojis: Record<MoonPhase, string> = {
			[MoonPhase.NewMoon]: '🌑',
			[MoonPhase.WaxingCrescent]: '🌒',
			[MoonPhase.FirstQuarter]: '🌓',
			[MoonPhase.WaxingGibbous]: '🌔',
			[MoonPhase.FullMoon]: '🌕',
			[MoonPhase.WaningGibbous]: '🌖',
			[MoonPhase.LastQuarter]: '🌗',
			[MoonPhase.WaningCrescent]: '🌘'
		};

		contentEl.createEl('h2', { text: 'Moon Age Information' });

		const infoDiv = contentEl.createDiv();
		infoDiv.createEl('p', { 
			text: `${phaseEmojis[this.moonInfo.phase]} ${phaseNames[this.moonInfo.phase]}` 
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
