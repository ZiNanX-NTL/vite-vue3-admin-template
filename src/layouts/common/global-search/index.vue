<script setup>
import { useBoolean } from '@/hooks';
import { useThemeStore } from '@/store';
import { SearchModal } from './components';

defineOptions({ name: 'GlobalSearch' });

const { bool: show, toggle } = useBoolean();
const theme = useThemeStore();

function handleSearch() {
  toggle();
}
</script>

<template>
  <div>
    <HoverContainer
      class="h-full w-40px"
      tooltip-content="搜索"
      :inverted="theme.header.inverted"
      @click="handleSearch"
    >
      <icon-uil-search class="text-20px" />
    </HoverContainer>
    <SearchModal v-model:value="show" />
  </div>
</template>

<style lang="scss" scoped></style>
