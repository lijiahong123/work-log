import type { WorkItem, FilterWorkType } from '../../../home'
import request from './request'

console.log('++++++++window.api===========', window.api)

// 创建
export const saveWork = (params: WorkItem): Promise<{ code: number; data: number }> =>
  request<number>({ method: 'insertWorkLog', params })
// 编辑
export const editWork = (params: WorkItem): Promise<{ code: number; data: string }> =>
  request<string>({ method: 'editWorkLog', params })
// 查询
export const getWorkList = async (
  params: FilterWorkType
): Promise<{ code: number; data: Array<WorkItem>; msg?: string }> =>
  request<Array<WorkItem>>({ method: 'getWorkLogs', params })

// 删除
// export const deleteWork = (_id: string) => request({ method: 'post', url: '/work/delete', data: { _id } })
