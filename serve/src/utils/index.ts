import * as dayjs from 'dayjs';
import * as weekday from 'dayjs/plugin/weekday';
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear';
import 'dayjs/locale/zh-cn';

// 扩展 Day.js 功能
dayjs.extend(weekday);
dayjs.extend(quarterOfYear);
dayjs.locale('zh-cn');

// 获取本周的第一天
export const getFirstDayOfWeek = () => {
  return dayjs().weekday(0).format('YYYY-MM-DD');
};

// 获取本月的第一天
export const getFirstMonthDay = () => {
  return dayjs().startOf('month').format('YYYY-MM-DD');
};

// 获取本季度的第一天
export const getFirstQuarterDay = () => {
  return dayjs().startOf('quarter').format('YYYY-MM-DD');
};

// 获取本年的第一天
export const getFirstYearDay = () => {
  return dayjs().startOf('year').format('YYYY-MM-DD');
};
