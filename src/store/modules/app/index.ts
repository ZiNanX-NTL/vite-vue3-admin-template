import { nextTick } from 'vue';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app-store', {
  state: () => ({
    /** n-content引用 */
    contentRef: null,
    /** 全局loading显示 */
    loadingVisible: false,
    /** 全局loading标题 */
    loadingTitle: '加载中...',
    /** 重载页面(控制页面的显示) */
    reloadFlag: true,
    /** 侧边栏折叠状态 */
    siderCollapse: false,
    /** 项目配置的抽屉可见状态 */
    settingDrawerVisible: false,
    /** 主体内容全屏 */
    contentFull: false
  }),
  getters: {},
  actions: {
    setContentRef(contentRef: any) {
      this.contentRef = contentRef;
    },
    setLoadingVisible(visible: boolean) {
      this.loadingVisible = visible;
    },
    setLoadingTitle(title: string) {
      this.loadingTitle = title;
    },
    /**
     * 重载页面
     * @param duration - 重载的延迟时间(ms)
     */
    async reloadPage(duration = 0) {
      this.reloadFlag = false;
      await nextTick();
      if (duration) {
        setTimeout(() => {
          this.reloadFlag = true;
        }, duration);
      } else {
        this.reloadFlag = true;
      }
    },
    /** 设置侧边栏折叠状态 */
    setSiderCollapse(collapse: boolean) {
      this.siderCollapse = collapse;
    },
    /** 折叠/展开 侧边栏折叠状态 */
    toggleSiderCollapse() {
      this.siderCollapse = !this.siderCollapse;
    },
    /** 打开设置抽屉 */
    openSettingDrawer() {
      this.settingDrawerVisible = true;
    },
    /** 关闭设置抽屉 */
    closeSettingDrawer() {
      this.settingDrawerVisible = false;
    },
    /** 切换抽屉可见状态 */
    toggleSettingDrawerVisible() {
      this.settingDrawerVisible = !this.settingDrawerVisible;
    },
    /** 设置主体内容全屏 */
    setContentFull(full: boolean) {
      this.contentFull = full;
    }
  }
});
