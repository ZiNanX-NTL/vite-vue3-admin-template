import { nextTick } from 'vue';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app-store', {
  state: () => ({
    contentRef: null,
    loadingVisible: false,
    reloadFlag: true,
    siderCollapse: false,
    settingDrawerVisible: false
  }),
  getters: {},
  actions: {
    setContentRef(contentRef) {
      this.contentRef = contentRef;
    },
    setLoadingVisible(visible) {
      this.loadingVisible = visible;
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
    setSiderCollapse(collapse) {
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
    }
  }
});
