import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      [key: string]: (params: any) => Promise<any>
    }
  }
}
