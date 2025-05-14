import { ipcRenderer } from 'electron'

export const betterSqlite = {
  insertWorkLog: (log: { date: string; status: string; content: string }): Promise<number> =>
    ipcRenderer.invoke('insert-work-log', log),
  getWorkLogs: (): Promise<Array<{ id: number; date: string; status: string; content: string }>> =>
    ipcRenderer.invoke('get-work-logs'),
  updateWorkLog: (log: {
    id: number
    date: string
    status: string
    content: string
  }): Promise<void> => ipcRenderer.invoke('update-work-log', log),
  deleteWorkLog: (id: number): Promise<void> => ipcRenderer.invoke('delete-work-log', id)
}
