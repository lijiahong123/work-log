import { FilterWorkType, WorkItem } from '../home'
import { ipcRenderer } from 'electron'

export const betterSqlite = {
  getWorkLogs: <T>(params: FilterWorkType): Promise<T[]> =>
    ipcRenderer.invoke('get-work-logs', params),
  insertWorkLog: (params: WorkItem): Promise<number> =>
    ipcRenderer.invoke('insert-work-log', params),
  editWorkLog: (params: WorkItem): Promise<number> => ipcRenderer.invoke('update-work-log', params)
}
