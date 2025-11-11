/**
 * 月相の種類
 */
export enum MoonPhase {
	NewMoon = 'new',           // 新月
	WaxingCrescent = 'waxing-crescent',  // 三日月
	FirstQuarter = 'first-quarter',      // 上弦
	WaxingGibbous = 'waxing-gibbous',    // 十三夜
	FullMoon = 'full',         // 満月
	WaningGibbous = 'waning-gibbous',    // 十六夜
	LastQuarter = 'last-quarter',        // 下弦
	WaningCrescent = 'waning-crescent'   // 有明
}

/**
 * 月齢情報
 */
export interface MoonAgeInfo {
	/** 月齢（日数、0〜29.53） */
	age: number;
	/** 月の照度パーセンテージ（0〜100） */
	illumination: number;
	/** 月相 */
	phase: MoonPhase;
	/** 次の新月の日時 */
	nextNewMoon: Date;
	/** 次の満月の日時 */
	nextFullMoon: Date;
}

