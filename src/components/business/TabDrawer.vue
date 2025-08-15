<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
const visibleModel = defineModel<boolean>();
const {
  visible = undefined,
  showFold = true,
  showTrigger = true,
  appear = true,
  selectMode = false,
  clickOutside = false,
  position = 'left',
  triggerWrapClass = '',
  triggerClass = '',
  wrapperClass = '',
  contentClass = '',
  hiddenTriggerClass = '',
  hoverProps = {},
  loading = false
} = defineProps<{
  visible?: boolean;
  showFold?: boolean;
  /** 是否显示触发器 */
  showTrigger?: boolean;
  /** 出现时过渡 */
  appear?: boolean;
  selectMode?: boolean;
  clickOutside?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  triggerWrapClass?: string;
  triggerClass?: string;
  wrapperClass?: string;
  contentClass?: string;
  hiddenTriggerClass?: string;
  /** Hover 配置 */
  hoverProps?: {
    inverted?: boolean;
    tooltipContent?: string;
    placement?: string;
  };
  /** 加载状态 */
  loading?: boolean;
}>();
const emit = defineEmits<{
  'update:value': [value: boolean | undefined];
  afterEnter: [];
}>();

// 受控与非受控模式
const visibleProp = ref(visible);
const isVisible = computed({
  get: () => {
    if (visible !== undefined) return visibleProp.value;
    return visibleModel.value;
  },
  set: val => {
    if (visible !== undefined) {
      visibleProp.value = val;
      emit('update:value', val);
    } else {
      visibleModel.value = val;
    }
  }
});

// 位置配置映射
const positionConfig = {
  left: {
    triggerWrap: 'top-10px left-0',
    trigger: 'p-[10px_15px_10px_20px] rounded-r-full',
    wrapper: 'flex items-start',
    content: 'flex-y-center mt-10px',
    hiddenTrigger: 'rounded-r-4px p-[15px_5px_15px_5px]'
  },
  right: {
    triggerWrap: 'top-10px right-0',
    trigger: 'p-[10px_20px_10px_15px] rounded-l-full',
    wrapper: 'flex items-start flex-row-reverse',
    content: 'flex-y-center flex-row-reverse mt-10px',
    hiddenTrigger: 'rounded-l-4px p-[15px_5px_15px_5px]'
  },
  top: {
    triggerWrap: 'top-0 left-10px',
    trigger: 'p-12px rounded-b-full',
    wrapper: 'flex-vertical items-start',
    content: 'flex-vertical items-center ml-10px mt-10px',
    hiddenTrigger: 'rounded-b-4px p-[5px_15px_5px_15px]'
  },
  bottom: {
    triggerWrap: 'bottom-0 left-0 right-0 mx-auto w-[fit-content]',
    trigger: 'p-12px rounded-t-full',
    wrapper: 'flex-vertical items-start flex-col-reverse',
    content: 'flex-vertical items-center flex-col-reverse mb-10px ml-10px',
    hiddenTrigger: 'rounded-t-4px p-[5px_15px_5px_15px]'
  }
} as const;

// 选择模式样式
const selectModeClasses = computed(() => {
  if (!selectMode) return '';
  if (isVisible.value) return ' !bg-primary_3 !text-#fff translate-x-0';
  if (position === 'left') return '-translate-x-10px';
  if (position === 'right') return 'translate-x-10px';
  return '';
});

// 计算最终样式类
const config = computed(() => positionConfig[position]);

const transitionName = computed(() => `fade-slide-${position}`);

const resultTriggerWrapClass = computed(() => `${config.value.triggerWrap} ${triggerWrapClass}`.trim());

const resultTriggerClass = computed(() =>
  `${config.value.trigger} ${selectModeClasses.value} ${triggerClass} ${loading ? '!cursor-wait' : ''}`.trim()
);

const resultWrapperClass = computed(() => `${config.value.wrapper} ${wrapperClass}`.trim());

const resultContentClass = computed(() => {
  let marginClass = '';
  if (position === 'left') {
    marginClass = selectMode ? 'ml-60px' : 'ml-10px';
  } else if (position === 'right') {
    marginClass = selectMode ? 'mr-60px' : 'mr-10px';
  }

  const baseContent = config.value.content;
  // 对于 top 和 bottom 位置，不应用水平边距
  const finalContent = position === 'top' || position === 'bottom' ? baseContent : `${baseContent} ${marginClass}`;
  return `${finalContent} ${contentClass}`.trim();
});

const resultHiddenTriggerClass = computed(() => `${config.value.hiddenTrigger} ${hiddenTriggerClass}`.trim());

// 箭头图标映射
const arrowIconMap = {
  left: 'ep-arrow-left-bold',
  right: 'ep-arrow-right-bold',
  top: 'ep-arrow-up-bold',
  bottom: 'ep-arrow-down-bold'
} as const;

// 获取当前位置的箭头图标组件
const ArrowIcon = computed(() => arrowIconMap[position]);

watch(
  () => loading,
  (val: boolean) => {
    if (val) {
      isVisible.value = false;
    }
  }
);

function handleToggleVisible(contentVisible: boolean = isVisible.value as boolean) {
  if (loading) return;
  isVisible.value = !contentVisible;
}

// 点击外部关闭
const content = useTemplateRef('contentRef');
onClickOutside(content, () => {
  if (clickOutside) {
    isVisible.value = false;
  }
});
</script>

<template>
  <Transition :name="transitionName" :appear="appear">
    <DarkModeContainer
      v-show="selectMode || (showTrigger && !isVisible)"
      class="transition-base absolute z-1000"
      :class="resultTriggerWrapClass"
    >
      <HoverContainer
        :content-class="`bg-#fff text-icon shadow-[0_1px_2px_rgba(0,21,41,0.08)] dark:bg-dark hover:text-primary  transition-base ${resultTriggerClass}`"
        v-bind="hoverProps"
        @click="handleToggleVisible()"
      >
        <slot v-if="!loading" name="trigger">
          <icon-ic-round-search />
        </slot>
        <NSpin v-else :size="20" class="!translate-0 !static" />
      </HoverContainer>
    </DarkModeContainer>
  </Transition>
  <Transition :name="transitionName" :appear="appear" @after-enter="emit('afterEnter')">
    <div
      v-show="isVisible"
      ref="contentRef"
      class="m-0 size-full pointer-events-none absolute-lt z-1000"
      :class="resultWrapperClass"
    >
      <div class="w-[fit-content] pointer-events-auto" :class="resultContentClass">
        <slot></slot>
        <DarkModeContainer
          v-if="showFold && !selectMode"
          class="group bg-#fff cursor-pointer transition-base dark:bg-dark"
          :class="resultHiddenTriggerClass"
          @click="isVisible = false"
        >
          <SvgIcon :icon="ArrowIcon" class="text-icon transition-base group-hover:text-primary" />
        </DarkModeContainer>
      </div>
    </div>
  </Transition>
</template>

<style scoped></style>
