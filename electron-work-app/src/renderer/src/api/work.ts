import type { WorkItem } from '@renderer/views/Home/home'
import request from './request'

type FilterWorkType = {
  date: string
  status: string
}

// 创建
export const saveWork = (data: WorkItem) => request({ method: 'post', url: '/work/create', data })
// 编辑
export const editWork = (data: WorkItem) => request({ method: 'post', url: '/work/update', data })
// 查询
export const getWorkList = (params: FilterWorkType) =>
  request({ method: 'get', url: '/work/list', params })
// 删除
export const deleteWork = (_id: string) =>
  request({ method: 'post', url: '/work/delete', data: { _id } })
