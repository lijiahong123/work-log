import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { betterSqlite } from './sqlite3'

// Custom APIs for renderer
const api = {
  ...betterSqlite
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
