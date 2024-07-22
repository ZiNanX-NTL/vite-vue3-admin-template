import dayjs, { extend } from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';

export function setupDayjs() {
  dayjs.locale('zh-cn');
  extend(localeData);
  extend(relativeTime);
}
