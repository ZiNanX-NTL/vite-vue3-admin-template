declare namespace NaiveUI {
  /** 表格操作栏对其方式 */
  type Align = 'stretch' | 'baseline' | 'start' | 'end' | 'center' | 'flex-end' | 'flex-start';
  /** 表格列勾选项 */
  interface TableColumnCheck {
    key: string;
    title: string;
    checked: boolean;
  }
}
