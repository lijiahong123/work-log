import type { WorkItem, FilterWorkType } from '../../../home'
import request from './request'

// 创建
export const saveWork = (params: WorkItem): Promise<number> =>
  request<number>({ method: 'insertWorkLog', params })
// 编辑
// export const editWork = (data: WorkItem) => request({ method: 'post', url: '/work/update', data })
// 查询
export const getWorkList = async (params: FilterWorkType): Promise<Array<WorkItem>> =>
  request<Array<WorkItem>>({ method: 'getWorkLogs', params })

// 删除
// export const deleteWork = (_id: string) =>
  // request({ method: 'post', url: '/work/delete', data: { _id } })
