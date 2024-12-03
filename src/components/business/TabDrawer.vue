<template>
  <transition :name="transitionName" :appear="appear">
    <dark-mode-container
      v-show="showTrigger && !isVisible"
      class="absolute z-1000 transition-base"
      :class="resultTriggerWrapClass"
    >
      <hover-container
        :content-class="`bg-#fff text-icon shadow-[0_1px_2px_rgba(0,21,41,0.08)] dark:bg-dark hover:text-primary ${resultTriggerClass}`"
        v-bind="hoverProps"
        @click="!loading && (isVisible = true)"
      >
        <slot v-if="!loading" name="trigger">
          <icon-ic-round-search />
        </slot>
        <n-spin v-else :size="20" class="!static !translate-0" />
      </hover-container>
    </dark-mode-container>
  </transition>
  <transition :name="transitionName" :appear="appear" @after-enter="emit('afterEnter')">
    <div v-show="isVisible" class="pointer-events-none absolute-lt z-1000 m-0 size-full" :class="resultWrapperClass">
      <div class="pointer-events-auto w-[fit-content]" :class="resultContentClass">
        <slot></slot>
        <dark-mode-container
          v-if="showFold"
          class="group cursor-pointer bg-#fff transition-base dark:bg-dark"
          :class="resultHiddenTriggerClass"
          @click="isVisible = false"
        >
          <icon-ep-arrow-left-bold
            v-if="position === 'left'"
            class="text-icon transition-base group-hover:text-primary"
          />
          <icon-ep-arrow-right-bold
            v-if="position === 'right'"
            class="text-icon transition-base group-hover:text-primary"
          />
          <icon-ep-arrow-up-bold v-if="position === 'top'" class="text-icon transition-base group-hover:text-primary" />
          <icon-ep-arrow-down-bold
            v-if="position === 'bottom'"
            class="text-icon transition-base group-hover:text-primary"
          />
        </dark-mode-container>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const visibleModel = defineModel<boolean>();
const {
  visible = undefined,
  showFold = true,
  showTrigger = true,
  appear = true,
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

const classPatterns = [
  {
    name: 'left',
    defaultTriggerWrapClass: 'top-10px left-0 ',
    defaultTriggerClass: 'p-[10px_15px_10px_20px] rounded-r-full',
    defaultWrapperClass: 'flex items-start',
    defaultContentClass: 'flex-y-center ml-10px mt-10px',
    defaultHiddenTriggerClass: 'rounded-r-4px p-[15px_5px_15px_5px]'
  },
  {
    name: 'right',
    defaultTriggerWrapClass: 'top-10px right-0',
    defaultTriggerClass: 'p-[10px_20px_10px_15px]  rounded-l-full',
    defaultWrapperClass: 'flex items-start flex-row-reverse',
    defaultContentClass: 'flex-y-center flex-row-reverse mr-10px mt-10px',
    defaultHiddenTriggerClass: 'rounded-l-4px p-[15px_5px_15px_5px]'
  },
  {
    name: 'top',
    defaultTriggerWrapClass: 'top-0 left-10px',
    defaultTriggerClass: 'p-12px rounded-b-full',
    defaultWrapperClass: 'flex-vertical items-start',
    defaultContentClass: 'flex-vertical items-center ml-10px mt-10px',
    defaultHiddenTriggerClass: 'rounded-b-4px p-[5px_15px_5px_15px]'
  },
  {
    name: 'bottom',
    defaultTriggerWrapClass: 'bottom-0 left-0 right-0 mx-auto w-[fit-content]',
    defaultTriggerClass: 'p-12px rounded-t-full',
    defaultWrapperClass: 'flex-vertical items-start flex-col-reverse',
    defaultContentClass: 'flex-vertical items-center flex-col-reverse mb-10px ml-10px',
    defaultHiddenTriggerClass: 'rounded-t-4px p-[5px_15px_5px_15px]'
  }
];

const transitionName = computed(() => `fade-slide-${position}`);
const resultTriggerWrapClass = computed(
  () => `${classPatterns.find(i => i.name === position)?.defaultTriggerWrapClass} ${triggerWrapClass} `
);
const resultTriggerClass = computed(
  () =>
    `${classPatterns.find(i => i.name === position)?.defaultTriggerClass} ${triggerClass} ${
      loading ? '!cursor-wait' : ''
    }`
);
const resultWrapperClass = computed(
  () => `${classPatterns.find(i => i.name === position)?.defaultWrapperClass} ${wrapperClass} `
);
const resultContentClass = computed(
  () => `${classPatterns.find(i => i.name === position)?.defaultContentClass} ${contentClass} `
);
const resultHiddenTriggerClass = computed(
  () => `${classPatterns.find(i => i.name === position)?.defaultHiddenTriggerClass} ${hiddenTriggerClass} `
);

watch(
  () => loading,
  val => {
    if (val) {
      isVisible.value = false;
    }
  }
);
</script>

<style scoped></style>
