import { ItemView, WorkspaceLeaf } from 'obsidian';
import { calculateMoonAge } from '../utils/moonCalculation';
import { getPhaseEmoji, getPhaseName } from '../utils/moonPhaseUtils';
import { t } from '../utils/i18n';

export const MOON_AGE_VIEW_TYPE = 'moon-age-view';

export class MoonAgeView extends ItemView {
	intervalId: number | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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
		// 1時間ごとに更新
		this.intervalId = window.setInterval(() => {
			this.updateDisplay();
		}, 60 * 60 * 1000);
	}

	async onClose() {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	updateDisplay() {
		const { contentEl } = this;
		contentEl.empty();

		const moonInfo = calculateMoonAge();
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

