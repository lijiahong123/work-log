import type { DialogType } from './home.d'
export const dateOptions = {
  '1': '本周',
  '2': '本月',
  '3': '本季度',
  '4': '本年',
}

export const statusOptions = {
  '1': {
    label: '待处理',
    color: '#E6A23C',
  },
  '2': {
    label: '处理中',
    color: '#c82ad1',
  },
  '3': {
    label: '已完成',
    color: '#67C23A',
  },
  '4': {
    label: '已关闭',
    color: '#F56C6C',
  },
}

export const dialogType: DialogType = {
  add: '创建',
  edit: '编辑',
}
