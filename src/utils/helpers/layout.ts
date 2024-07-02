import { computed, watch } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useAppStore, useThemeStore } from "@/store";

interface Props {
	layoutProps: {
		showHeader: boolean,
		showMixHeader: boolean,
		showSider: boolean,
		showMixSider: boolean,
	},
	headerProps: {
		showLogo: boolean,
		showHeaderMenu: boolean,
		showMenuCollapse: boolean,
	},
	siderProps: {
		showLogo: boolean,
	}
}
interface Layout {
	vertical: Props,
	'vertical-mix': Props,
	horizontal: Props,
}

export function useBasicLayout() {
	const theme = useThemeStore();

	const mode = computed<'vertical' | 'vertical-mix' | 'horizontal'>(() => {
		return theme.layout.mode;
	});

	// 各种布局的布局参数
	const layout: Layout = {
		vertical: {
			layoutProps: {
				showHeader: false,
				showMixHeader: true,
				showSider: true,
				showMixSider: false,
			},
			headerProps: {
				showLogo: false,
				showHeaderMenu: false,
				showMenuCollapse: true,
			},
			siderProps: {
				showLogo: true,
			},
		},
		"vertical-mix": {
			layoutProps: {
				showHeader: true,
				showMixHeader: false,
				showSider: false,
				showMixSider: true,
			},
			headerProps: {
				showLogo: true,
				showHeaderMenu: false,
				showMenuCollapse: true,
			},
			siderProps: {
				showLogo: false,
			},
		},
		horizontal: {
			layoutProps: {
				showHeader: true,
				showMixHeader: false,
				showSider: false,
				showMixSider: false,
			},
			headerProps: {
				showLogo: true,
				showHeaderMenu: true,
				showMenuCollapse: false,
			},
			siderProps: {
				showLogo: false,
			},
		},
	};
	const layoutProps = computed<Props['layoutProps']>(() => layout[mode.value].layoutProps);
	const headerProps = computed<Props['headerProps']>(() => layout[mode.value].headerProps);
	const siderProps = computed<Props['siderProps']>(() => layout[mode.value].siderProps);

	return {
		mode,
		layoutProps,
		headerProps,
		siderProps,
	};
}

export function useIsMobile() {
	const app = useAppStore();
	const breakpoints = useBreakpoints(breakpointsTailwind);

	const isMobile = breakpoints.smaller("sm");

	watch(
		isMobile,
		(newValue) => {
			if (newValue) {
				app.setSiderCollapse(true);
			}
		},
		{ immediate: true }
	);

	return isMobile;
}
