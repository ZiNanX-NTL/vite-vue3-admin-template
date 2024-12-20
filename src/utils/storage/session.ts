import { decrypto, encrypto } from '../crypto';

/** localStorage的存储数据的类型 */
interface Session {
	/** 主题颜色 */
	themeColor: string;
	/** 主题配置 */
	themeSettings: any;
}
function createSessionStorage<T extends Session = Session>(isEncryption = false) {
	function set<K extends keyof T>(key: K, value: T[K]) {
		let json;
		if (isEncryption) {
			json = encrypto(value);
		} else {
			json = JSON.stringify(value);
		}
		sessionStorage.setItem(key as string, json);
	}
	function get<K extends keyof T>(key: K) {
		const json = sessionStorage.getItem(key as string);
		let data: T[K] | null = null;
		if (json) {
			try {
				if (isEncryption) {
					data = decrypto(json);
				} else {
					data = JSON.parse(json);
				}
			} catch {
				// 防止解析失败
			}
		}
		return data;
	}
	function remove(key: keyof T) {
		window.sessionStorage.removeItem(key as string);
	}
	function clear() {
		window.sessionStorage.clear();
	}

	return {
		set,
		get,
		remove,
		clear
	};
}

export const sessionStg = createSessionStorage(false);
