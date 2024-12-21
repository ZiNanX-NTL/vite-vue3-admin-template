import { nextTick } from 'vue';
import { guid } from '@/utils';

/** 重载 */
export default function useReload() {
  // 重载的标志
  const uuid = ref(guid());
  /** 触发重载 */
  async function handleReload() {
    uuid.value = guid();
    await nextTick();
  }

  return {
    reloadFlag: uuid,
    handleReload
  };
}
