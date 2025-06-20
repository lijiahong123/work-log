import path from 'path'
import { app, BrowserWindow, Menu, Tray } from 'electron'
import { mainTitle } from '../../conf/app.config.json'

export function createTray(win: BrowserWindow | null, setQuiting: (boolean) => void): Tray {
  // 托盘图标尺寸， 这里为20px
  const iconPath = path.resolve('resources/icon-tray.png')

  const tray = new Tray(iconPath)
  tray.on('click', () => (win?.isVisible() ? win?.hide() : win?.show()))

  const contentMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        win?.isVisible() ? win?.hide() : win?.show()
      }
    },
    {
      label: '退出',
      click: () => {
        setQuiting(true)
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contentMenu)
  tray.setToolTip(mainTitle)
  tray.on('double-click', () => {
    if (win) {
      win.show()
    }
  })

  return tray
}
