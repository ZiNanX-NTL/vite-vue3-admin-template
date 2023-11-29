import { ref } from 'vue';
import useBoolean from './useBoolean';

export default function useLoading(initValue = false, delay = 0) {
  const { bool: loading, setTrue, setFalse } = useBoolean(initValue);
  const timer = ref(0);
  const startLoading = () => {
    setTrue();
    timer.value = new Date().getTime();
  };
  const endLoading = () => {
    const now = new Date().getTime();
    const diff = now - timer.value;
    if (diff < delay) return setTimeout(setFalse, delay - diff);
    return setFalse();
  };

  return {
    loading,
    startLoading,
    endLoading
  };
}
