import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import type { AnyColor, Colord, HsvColor } from 'colord';

extend([mixPlugin]);

/** 色相阶梯 */
const hueStep = 2;
/** 饱和度阶梯，浅色部分 */
const saturationStep = 16;
/** 饱和度阶梯，深色部分 */
const saturationStep2 = 5;
/** 亮度阶梯，浅色部分 */
const brightnessStep1 = 5;
/** 亮度阶梯，深色部分 */
const brightnessStep2 = 15;
/** 浅色数量，主色上 */
const lightColorCount = 5;
/** 深色数量，主色下 */
const darkColorCount = 4;

/**
 * 调色板的颜色索引
 *
 * 从左至右颜色从浅到深，6为主色号
 */
type ColorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** 暗色主题颜色映射关系表 */
const darkColorMap = [
	{ index: 1, ratio: 0.8 },
	{ index: 2, ratio: 0.77 },
	{ index: 3, ratio: 0.74 },
	{ index: 4, ratio: 0.71 },
	{ index: 5, ratio: 0.68 },
	{ index: 6, ratio: 0.65 },
	{ index: 7, ratio: 0.45 },
	{ index: 8, ratio: 0.3 },
	{ index: 9, ratio: 0.25 },
	{ index: 10, ratio: 0.15 }
];

/**
 * 根据传入颜色返回暗色主体颜色
 *
 * @param color - 颜色
 * @param ratio - 所占比例(0 - 1),默认0.65
 */
export function getDarkColor(color: AnyColor | Colord, ratio = 0.65) {
	/** 暗黑主题的混合颜色 */
	const darkThemeMixColor = colord(color).isLight() ? '#141414' : '#fafafa';
	const darkColor = colord(darkThemeMixColor).mix(color, ratio);

	return darkColor;
}

/**
 * 根据颜色获取调色板颜色(从左至右颜色从浅到深，6为主色号)
 *
 * @param color - 颜色
 * @param index - 调色板的对应的色号(6为主色号)
 * @param darkTheme - 暗黑主题的颜色
 * @returns 返回hex格式的颜色
 */
export function getColorPalette(color: AnyColor, index: ColorIndex, darkTheme = false): string {
	const transformColor = colord(color);

	if (!transformColor.isValid()) {
		throw new Error('invalid input color value');
	}

	if (index === 6) {
		if (darkTheme) {
			return getDarkColor(transformColor).toHex();
		}
		return colord(transformColor).toHex();
	}

	const isLight = index < 6;
	const hsv = transformColor.toHsv();
	const i = isLight ? lightColorCount + 1 - index : index - lightColorCount - 1;

	const newHsv: HsvColor = {
		h: getHue(hsv, i, isLight),
		s: getSaturation(hsv, i, isLight),
		v: getValue(hsv, i, isLight)
	};

	if (darkTheme) {
		return getDarkColor(newHsv, darkColorMap.find(item => item.index === index)?.ratio).toHex();
	}
	return colord(newHsv).toHex();
}

/**
 * 根据颜色获取调色板颜色所有颜色
 *
 * @param color - 颜色
 * @param darkTheme - 暗黑主题的调色板颜色
 */
export function getColorPalettes(color: AnyColor, darkTheme = false): string[] {
	const indexes: ColorIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	const patterns = indexes.map(index => getColorPalette(color, index));

	if (darkTheme) {
		const darkPatterns = darkColorMap.map(({ index, ratio }) => {
			const darkColor = getDarkColor(patterns[index - 1], ratio);

			return darkColor;
		});

		return darkPatterns.map(item => colord(item).toHex());
	}

	return patterns;
}

/**
 * 获取色相渐变
 *
 * @param hsv - hsv格式颜色值
 * @param i - 与6的相对距离
 * @param isLight - 是否是亮颜色
 */
function getHue(hsv: HsvColor, i: number, isLight: boolean) {
	let hue;

	const hsvH = Math.round(hsv.h);

	if (hsvH >= 60 && hsvH <= 240) {
		// 冷色调
		// 减淡变亮 色相顺时针旋转 更暖
		// 加深变暗 色相逆时针旋转 更冷
		hue = isLight ? hsvH - hueStep * i : hsvH + hueStep * i;
	} else {
		// 暖色调
		// 减淡变亮 色相逆时针旋转 更暖
		// 加深变暗 色相顺时针旋转 更冷
		hue = isLight ? hsvH + hueStep * i : hsvH - hueStep * i;
	}

	if (hue < 0) {
		hue += 360;
	}

	if (hue >= 360) {
		hue -= 360;
	}

	return hue;
}

/**
 * 获取饱和度渐变
 *
 * @param hsv - hsv格式颜色值
 * @param i - 与6的相对距离
 * @param isLight - 是否是亮颜色
 */
function getSaturation(hsv: HsvColor, i: number, isLight: boolean) {
	// 灰色不渐变
	if (hsv.h === 0 && hsv.s === 0) {
		return hsv.s;
	}

	let saturation;

	if (isLight) {
		saturation = hsv.s - saturationStep * i;
	} else if (i === darkColorCount) {
		saturation = hsv.s + saturationStep;
	} else {
		saturation = hsv.s + saturationStep2 * i;
	}

	if (saturation > 100) {
		saturation = 100;
	}

	if (isLight && i === lightColorCount && saturation > 10) {
		saturation = 10;
	}

	if (saturation < 6) {
		saturation = 6;
	}

	return saturation;
}

/**
 * 获取明度渐变
 *
 * @param hsv - hsv格式颜色值
 * @param i - 与6的相对距离
 * @param isLight - 是否是亮颜色
 */
function getValue(hsv: HsvColor, i: number, isLight: boolean) {
	let value;

	if (isLight) {
		value = hsv.v + brightnessStep1 * i;
	} else {
		value = hsv.v - brightnessStep2 * i;
	}

	if (value > 100) {
		value = 100;
	}

	return value;
}

/**
 * 给颜色加透明度
 *
 * @param color - 颜色
 * @param alpha - 透明度(0 - 1)
 */
export function addColorAlpha(color: string, alpha: number) {
	return colord(color).alpha(alpha).toHex();
}

/**
 * 颜色混合
 *
 * @param firstColor - 第一个颜色
 * @param secondColor - 第二个颜色
 * @param ratio - 第二个颜色占比
 */
export function mixColor(firstColor: string, secondColor: string, ratio: number) {
	return colord(firstColor).mix(secondColor, ratio).toHex();
}

/**
 * 是否是白颜色
 *
 * @param color - 颜色
 */
export function isWhiteColor(color: string) {
	return colord(color).isEqual('#ffffff');
}

/**
 * 获取颜色的rgb值
 *
 * @param color 颜色
 * @param darkTheme - 暗黑主题的颜色
 */
export function getRgbOfColor(color: string, darkTheme = false) {
	if (darkTheme) {
		return getDarkColor(color).toRgb();
	}
	return colord(color).toRgb();
}

/**
 * 将颜色的过渡应用到数值上
 *
 * @param startColor 开始颜色
 * @param endColor 结束颜色
 * @param value 数值，范围在 0 到 1 之间
 * @returns 过渡后的颜色
 */
export function applyColorTransition(startColor: string, endColor: string, value: number): string {
	if (value < 0 || value > 1) {
		throw new Error('Value must be between 0 and 1');
	}

	const start = colord(startColor);
	const end = colord(endColor);
	const { r: sr, g: sg, b: sb } = start.toRgb();
	const { r: er, g: eg, b: eb } = end.toRgb();

	const r = Math.round(sr + (er - sr) * value);
	const g = Math.round(sg + (eg - sg) * value);
	const b = Math.round(sb + (eb - sb) * value);

	return colord({ r, g, b }).toHex();
}

/** 根据颜色获取配色方案 */
export function generateColorScheme(color: string): string[] {
	const baseColor = colord(color);

	// 生成互补色
	const complementaryColor = baseColor.rotate(180).toHex();

	// 生成类似色（±30°）
	const analogousColor1 = baseColor.rotate(30).toHex();
	const analogousColor2 = baseColor.rotate(-30).toHex();

	// 生成分裂互补色（互补色的类似色）
	const splitComplementaryColor1 = baseColor.rotate(150).toHex();
	const splitComplementaryColor2 = baseColor.rotate(-150).toHex();

	// 生成三文鱼色（±120°）
	const triadicColor1 = baseColor.rotate(120).toHex();
	const triadicColor2 = baseColor.rotate(-120).toHex();

	// 生成四色和谐（±90°）
	const tetradicColor1 = baseColor.rotate(90).toHex();
	const tetradicColor2 = baseColor.rotate(180).toHex();
	const tetradicColor3 = baseColor.rotate(270).toHex();

	return [
		baseColor.toHex(),
		complementaryColor,
		analogousColor1,
		analogousColor2,
		splitComplementaryColor1,
		splitComplementaryColor2,
		triadicColor1,
		triadicColor2,
		tetradicColor1,
		tetradicColor2,
		tetradicColor3
	];
}
