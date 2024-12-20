import { nextTick } from 'vue';
// 滚动到指定id部分
export async function scrollTo(id: string) {
	const targetEl = document.getElementById(id);
	await nextTick();
	targetEl?.scrollIntoView({ behavior: 'smooth' });
}
