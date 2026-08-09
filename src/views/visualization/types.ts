import type { EarthViewKey } from './config/earthViews';

export type ScrollShowcaseChangeSource = 'scroll' | 'navigation';

export interface ScrollShowcaseItem {
  id: string;
  label: string;
  title: string;
  description?: string;
  earthView?: EarthViewKey;
  /** When true, the section renders its slot directly without the contentRef
   *  animation wrapper. Use for sections that manage their own scroll-driven
   *  layout (e.g. a pinned horizontal rail). */
  standalone?: boolean;
}
