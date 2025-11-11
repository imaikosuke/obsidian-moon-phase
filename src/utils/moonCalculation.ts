import { MoonAgeInfo, MoonPhase } from '../types';

/**
 * Julian Day（ユリウス日）を計算
 * @param date 日時
 * @returns Julian Day
 */
export function toJulianDay(date: Date): number {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();

	// 日時を小数日として計算
	const decimalDay = day + (hour + minute / 60 + second / 3600) / 24;

	// Meeusのアルゴリズムに基づくJulian Day計算
	let a: number;
	let b: number;
	if (month <= 2) {
		const yearAdj = year - 1;
		const monthAdj = month + 12;
		a = Math.floor(yearAdj / 100);
		b = 2 - a + Math.floor(a / 4);
		return Math.floor(365.25 * (yearAdj + 4716)) +
			Math.floor(30.6001 * (monthAdj + 1)) +
			decimalDay + b - 1524.5;
	} else {
		a = Math.floor(year / 100);
		b = 2 - a + Math.floor(a / 4);
		return Math.floor(365.25 * (year + 4716)) +
			Math.floor(30.6001 * (month + 1)) +
			decimalDay + b - 1524.5;
	}
}

/**
 * Julian DayからDateオブジェクトに変換
 * @param jd Julian Day
 * @returns Dateオブジェクト
 */
export function fromJulianDay(jd: number): Date {
	const jdAdj = jd + 0.5;
	const z = Math.floor(jdAdj);
	const f = jdAdj - z;

	let a: number;
	if (z < 2299161) {
		a = z;
	} else {
		const alpha = Math.floor((z - 1867216.25) / 36524.25);
		a = z + 1 + alpha - Math.floor(alpha / 4);
	}

	const b = a + 1524;
	const c = Math.floor((b - 122.1) / 365.25);
	const d = Math.floor(365.25 * c);
	const e = Math.floor((b - d) / 30.6001);

	const day = b - d - Math.floor(30.6001 * e) + f;
	const month = e < 14 ? e - 1 : e - 13;
	const year = month > 2 ? c - 4716 : c - 4715;

	// 小数部分から時分秒を計算
	const dayFraction = day - Math.floor(day);
	const hour = Math.floor(dayFraction * 24);
	const minute = Math.floor((dayFraction * 24 - hour) * 60);
	const second = Math.floor(((dayFraction * 24 - hour) * 60 - minute) * 60);

	return new Date(year, month - 1, Math.floor(day), hour, minute, second);
}

/**
 * 平均月齢を計算（Meeusのアルゴリズム）
 * @param jd Julian Day
 * @returns 平均月齢（日数）
 */
function meanMoonAge(jd: number): number {
	// 2000年1月1日12時（J2000.0）からの経過日数
	const daysSinceJ2000 = jd - 2451545.0;

	// 平均月齢（日数）
	// 平均朔望月は約29.530588853日
	const meanAge = (daysSinceJ2000 % 29.530588853);
	return meanAge < 0 ? meanAge + 29.530588853 : meanAge;
}

/**
 * 月の位相角を計算（Meeusのアルゴリズム）
 * @param jd Julian Day
 * @returns 位相角（ラジアン）
 */
function moonPhaseAngle(jd: number): number {
	// 2000年1月1日12時（J2000.0）からの経過日数
	const T = (jd - 2451545.0) / 36525.0;

	// 太陽の平均黄経（度）
	const L0 = (280.4665 + 36000.7698 * T) % 360;
	// 月の平均黄経（度）
	const L = (218.3165 + 481267.8813 * T) % 360;
	// 月の平均近点角（度）
	const M = (134.9634 + 477198.8675 * T) % 360;

	// 位相角（度）
	const phaseAngle = (L - L0 - 180) % 360;
	return (phaseAngle < 0 ? phaseAngle + 360 : phaseAngle) * Math.PI / 180;
}

/**
 * 月の照度を計算
 * @param phaseAngle 位相角（ラジアン）
 * @returns 照度（0〜1）
 */
function moonIllumination(phaseAngle: number): number {
	// 位相角から照度を計算
	// 照度 = (1 + cos(位相角)) / 2
	return (1 + Math.cos(phaseAngle)) / 2;
}

/**
 * 月相を判定
 * @param age 月齢（日数）
 * @param illumination 照度（0〜1）
 * @returns 月相
 */
function determineMoonPhase(age: number, illumination: number): MoonPhase {
	// 月齢に基づいて月相を判定
	if (age < 1.0 || age >= 29.0) {
		return MoonPhase.NewMoon;
	} else if (age < 7.4) {
		return MoonPhase.WaxingCrescent;
	} else if (age < 7.4 + 0.1) {
		return MoonPhase.FirstQuarter;
	} else if (age < 14.8) {
		return MoonPhase.WaxingGibbous;
	} else if (age < 15.0) {
		return MoonPhase.FullMoon;
	} else if (age < 22.1) {
		return MoonPhase.WaningGibbous;
	} else if (age < 22.2) {
		return MoonPhase.LastQuarter;
	} else {
		return MoonPhase.WaningCrescent;
	}
}

/**
 * 次の新月の日時を計算
 * @param jd 現在のJulian Day
 * @returns 次の新月のJulian Day
 */
function nextNewMoon(jd: number): number {
	const currentAge = meanMoonAge(jd);
	const daysUntilNewMoon = 29.530588853 - currentAge;
	return jd + daysUntilNewMoon;
}

/**
 * 次の満月の日時を計算
 * @param jd 現在のJulian Day
 * @returns 次の満月のJulian Day
 */
function nextFullMoon(jd: number): number {
	const currentAge = meanMoonAge(jd);
	let daysUntilFullMoon: number;
	if (currentAge < 14.8) {
		// 満月まで
		daysUntilFullMoon = 14.8 - currentAge;
	} else {
		// 次の満月まで
		daysUntilFullMoon = 29.530588853 - currentAge + 14.8;
	}
	return jd + daysUntilFullMoon;
}

/**
 * 指定した日時の月齢情報を計算
 * @param date 日時（省略時は現在）
 * @returns 月齢情報
 */
export function calculateMoonAge(date: Date = new Date()): MoonAgeInfo {
	const jd = toJulianDay(date);
	const age = meanMoonAge(jd);
	const phaseAngle = moonPhaseAngle(jd);
	const illumination = moonIllumination(phaseAngle);
	const phase = determineMoonPhase(age, illumination);

	const nextNewMoonJd = nextNewMoon(jd);
	const nextFullMoonJd = nextFullMoon(jd);

	return {
		age: Math.round(age * 100) / 100,
		illumination: Math.round(illumination * 10000) / 100,
		phase,
		nextNewMoon: fromJulianDay(nextNewMoonJd),
		nextFullMoon: fromJulianDay(nextFullMoonJd)
	};
}

