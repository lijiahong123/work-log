import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import 'dayjs/locale/zh-cn'
import { WorkItem } from '../home'

// 扩展 Day.js 功能
dayjs.extend(weekday)
dayjs.extend(quarterOfYear)
dayjs.locale('zh-cn')

// 获取本周的第一天
export const getFirstDayOfWeek = (): string => {
  return dayjs().weekday(0).format('YYYY-MM-DD')
}

// 获取本月的第一天
export const getFirstMonthDay = (): string => {
  return dayjs().startOf('month').format('YYYY-MM-DD')
}

// 获取本季度的第一天
export const getFirstQuarterDay = (): string => {
  return dayjs().startOf('quarter').format('YYYY-MM-DD')
}

// 获取本年的第一天
export const getFirstYearDay = (): string => {
  return dayjs().startOf('year').format('YYYY-MM-DD')
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true
  }
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true
  }
  return false
}

export function updateProgress(params: WorkItem): void {
  const { progress, status } = params

  if (status === '3') {
    params.progress = 100
    return
  }

  if (status === '2' && progress <= 0) {
    params.progress = 5
    return
  }

  if (status === '999') {
    if (progress === 0) {
      params.status = '1'
      return
    }
    if (progress > 0 && progress < 100) {
      params.status = '2'
      return
    }
    if (progress >= 100) {
      params.status = '3'
    }
  }
}
