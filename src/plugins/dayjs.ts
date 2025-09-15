import dayjs, { extend } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

export function setupDayjs() {
  dayjs.locale('zh-cn');
  extend(localeData);
  extend(relativeTime);
}
