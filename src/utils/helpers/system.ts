/** 项目信息 */
export function getAppInfo() {
	const { VITE_APP_NAME: name, VITE_APP_TITLE: title } = import.meta.env;

	return {
		name,
		title
	};
}
