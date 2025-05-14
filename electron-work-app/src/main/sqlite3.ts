import Database from 'better-sqlite3' // 用于操作 SQLite 数据库的库
import { app, ipcMain } from 'electron' // 用于 Electron 应用的全局功能
import path from 'path' // 用于处理和操作文件路径的模块
import fs from 'fs'
import { WorkItem ,ResData} from '../home'



// 1. 观察环境创建数据库
// 判断当前环境是否是开发环境
const databasePath = path.join(app.getPath('userData'), 'database')
// 确保数据库文件夹存在，如果不存在则创建它
if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(databasePath, { recursive: true })
}

/// 初始化数据库
const db = new Database(path.join(databasePath, 'worklog.db'), {
  verbose: console.log,
  timeout: 100000 // 100毫秒超时
})

// 设置数据库的日志模式为 WAL（写时日志）模式，提高性能
db.pragma('journal_mode = WAL')

function resData<T>(data: T): ResData<T> {
  if (data instanceof Error) {
    console.error(data)
    return {
      code: 1,
      data,
      msg: data?.message || '系统异常'
    }
  }
  return {
    code: 0,
    data,
    msg: 'ok'
  }
}

// 2. 创建版本表/获取版本/更新数据库

// 创建工作日志表
function createTables(): void {
  const createWorkTableQuery = `
    CREATE TABLE IF NOT EXISTS work_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT COMMENT '主键ID',
      date CHAR(10) UNIQUE NOT NULL COMMENT '日期',
      status CHAR(3) NOT NULL COMMENT '1-待处理 2-处理中 3-已完成 4-已关闭',
      content TEXT NOT NULL COMMENT '工作内容',
      created_at DATETIME NOT NULL COMMENT '创建时间',
      update_at DATETIME COMMENT '更新日期'
    ) COMMENT 工作日志表;
  `
  db.prepare(createWorkTableQuery).run()
}

// 初始化数据库
export function initDatabase(): void {
  createTables()
}

// 插入日志
export function insertWorkLog(log: {
  date: string
  status: string
  content: string
}): ResData<number | Error> {
  try {
    // 检查当前date是否存在
    const row = db.prepare('SELECT date from work_logs WHERE  date=?;').get(log.date.trim())
    console.log('-------', row)

    if (row) throw new Error('已存在相同日期的记录！')
    const insertQuery = `
    INSERT INTO work_logs (date, status, content, created_at)
    VALUES (?, ?, ?, ?);
  `
    const stmt = db.prepare(insertQuery)
    const result = stmt.run(log.date, log.status, JSON.stringify(log.content), new Date())
    return resData<number>(result.lastInsertRowid as number)
  } catch (error) {
    return resData<Error>(error as Error)
  }
}

// 查询日志
export function getWorkLogs(): Array<WorkItem> {
  const selectQuery = `SELECT * FROM work_logs ORDER BY date DESC;`
  const res = db.prepare<WorkItem[], WorkItem>(selectQuery).all()
  console.log('================', res)

  return resData<WorkItem[]>(res)
}

// // 更新日志
// export function updateWorkLog(log: {
//   id: number
//   date: string
//   status: string
//   content: string
// }): void {
//   const updateQuery = `
//     UPDATE work_logs
//     SET date = ?, status = ?, content = ?
//     WHERE id = ?;
//   `
//   db.prepare(updateQuery).run(log.date, log.status, log.content, log.id)
// }

// // 删除日志
// export function deleteWorkLog(id: number): void {
//   const deleteQuery = `DELETE FROM work_logs WHERE id = ?;`
//   db.prepare(deleteQuery).run(id)
// }

export function registerIpcHandler(): void {
  ipcMain.handle('insert-work-log', (_, log) => insertWorkLog(log))
  ipcMain.handle('get-work-logs', () => getWorkLogs())
  // ipcMain.handle('update-work-log', (_, log) => updateWorkLog(log))
  // ipcMain.handle('delete-work-log', (_, id) => deleteWorkLog(id))
}
