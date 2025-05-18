import Database from 'better-sqlite3' // 用于操作 SQLite 数据库的库
import { app, ipcMain } from 'electron' // 用于 Electron 应用的全局功能
import path from 'path' // 用于处理和操作文件路径的模块
import fs from 'fs'
import { WorkItem, ResData, FilterWorkType } from '../home'
import {
  getFirstDayOfWeek,
  getFirstQuarterDay,
  getFirstYearDay,
  getFirstMonthDay,
  updateProgress
} from '../utils/index'

// 1. 观察环境创建数据库
// 判断当前环境是否是开发环境
const databasePath = path.join(app.getPath('appData'), 'WorkLogApp/database')

console.log('databasePath', databasePath)

// 确保数据库文件夹存在，如果不存在则创建它
if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(databasePath, { recursive: true })
}

console.log('数据库路径：', databasePath)

/// 初始化数据库
const db = new Database(path.join(databasePath, 'worklog.db'), {
  verbose: console.log,
  timeout: 100000 // 100毫秒超时
})

// 设置数据库的日志模式为 WAL（写时日志）模式，提高性能
db.pragma('journal_mode = WAL')

function resData<T>(data: T): ResData<T> {
  if (data instanceof Error) {
    return fail<T>(data?.message || '系统异常', data)
  }
  return {
    code: 0,
    data,
    msg: 'ok'
  }
}

function fail<T>(msg: string, data): { code: 1; msg: string; data: T } {
  return {
    code: 1,
    data,
    msg: msg || '系统异常'
  }
}

// 2. 创建版本表/获取版本/更新数据库

// 创建工作日志表
function createTables(): void {
  try {
    const createWorkTableQuery = `
    CREATE TABLE IF NOT EXISTS work_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date CHAR(10) UNIQUE NOT NULL,
      status CHAR(3) NOT NULL,
      content TEXT NOT NULL,
      progress INTEGER
    );
  `
    db.prepare(createWorkTableQuery).run()
  } catch (error) {
    console.log(error)
    throw error
  }
}

// 初始化数据库
export function initDatabase(): void {
  createTables()
}

// 插入日志
export function insertWorkLog(params: WorkItem): ResData<number | Error> {
  try {
    updateProgress(params)
    const { date, status, content, progress } = params
    // 检查当前date是否存在
    const row = db.prepare('SELECT date from work_logs WHERE  date=?;').get(date.trim())
    if (row) return fail('已存在相同日期的记录！', null)
    const insertQuery = `
    INSERT INTO work_logs (date, status, content, progress)
    VALUES (?, ?, ?, ?);
  `

    const stmt = db.prepare(insertQuery)
    const result = stmt.run(date, status, content, progress)
    return resData<number>(result.lastInsertRowid as number)
  } catch (error) {
    return resData<Error>(error as Error)
  }
}

function getDate(dateType: string): string {
  const typeMap = {
    1: getFirstDayOfWeek(), // 本周第一天
    2: getFirstMonthDay(),
    3: getFirstQuarterDay(),
    4: getFirstYearDay()
  }

  return typeMap[dateType]
}

// 查询日志
async function getWorkLogs(
  params: FilterWorkType
): Promise<{ code: number; data: Array<WorkItem>; msg?: string }> {
  const { date, status } = params
  let res
  if (!date && !status) {
    const selectQuery = `SELECT * FROM work_logs ORDER BY date DESC;`
    res = db.prepare<WorkItem[], WorkItem>(selectQuery).all()
  }
  if (date && !status) {
    const selectQuery = `SELECT * FROM work_logs where date >= ? ORDER BY date DESC;`
    res = db.prepare(selectQuery).all(date)
  }
  if (status || date) {
    let selectQuery = `SELECT * FROM work_logs where`
    if (status && !date) {
      selectQuery += ` status = ${status}`
    } else if (!status && date) {
      selectQuery += ` date >= '${getDate(date)}'`
    } else {
      selectQuery += ` date >= '${getDate(date as string)}' and status=${status}`
    }
    selectQuery += ` order by date desc;`
    res = db.prepare(selectQuery).all()
  }

  res.forEach((item) => {
    try {
      item.contentList = JSON.parse(item.content as string)
    } catch (e) {
      console.log(e)
      item.contentList = []
    }
    delete item.content
  })

  return resData<WorkItem[]>(res)
}

// 更新日志
export function updateWorkLog(params: WorkItem): ResData<string | Error> {
  try {
    updateProgress(params)
    const { id, date, status, content, progress } = params
    const updateQuery = `
    UPDATE work_logs SET date = ?, status = ?, content = ?, progress=? WHERE id = ?;
  `
    db.prepare(updateQuery).run(date, status, content, progress, id)
    return resData<string>('ok')
  } catch (error) {
    console.log(error)
    return fail<string>(error instanceof Error ? error.message : '失败', 'err')
  }
}

// // 删除日志
// export function deleteWorkLog(id: number): void {
//   const deleteQuery = `DELETE FROM work_logs WHERE id = ?;`
//   db.prepare(deleteQuery).run(id)
// }

export function registerIpcHandler(): void {
  ipcMain.handle('get-work-logs', (_, params: FilterWorkType) => getWorkLogs(params))
  ipcMain.handle('insert-work-log', (_, params: WorkItem) => {
    const { contentList } = params
    params.content = JSON.stringify(contentList)
    delete params.contentList
    return insertWorkLog(params)
  })
  ipcMain.handle('update-work-log', (_, params: WorkItem) => {
    const { contentList } = params
    params.content = JSON.stringify(contentList)
    delete params.contentList
    return updateWorkLog(params)
  })
}
