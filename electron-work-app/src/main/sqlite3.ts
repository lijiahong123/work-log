import Database from 'better-sqlite3' // 用于操作 SQLite 数据库的库
import { app, ipcMain } from 'electron' // 用于 Electron 应用的全局功能
import path from 'path' // 用于处理和操作文件路径的模块
import fs from 'fs'
let db // 声明一个变量用来存储数据库实例

// 1. 观察环境创建数据库
// 判断当前环境是否是开发环境
const databasePath = path.join(app.getPath('userData'), 'database')
// 确保数据库文件夹存在，如果不存在则创建它
if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(databasePath, { recursive: true })
}

// 初始化数据库并创建或打开指定路径的 SQLite 数据库文件
db = new Database(path.join(databasePath, 'uploadfile.db'), {
  verbose: console.log
})

// 设置数据库的日志模式为 WAL（写时日志）模式，提高性能
db.pragma('journal_mode = WAL')

// 2. 创建版本表/获取版本/更新数据库

// 创建版本表
function createVersionTable(): void {
  const createVersionTableQuery = `
    CREATE TABLE IF NOT EXISTS version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL
    );
  `
  db.prepare(createVersionTableQuery).run()

  // 检查是否有版本记录，若没有，则插入默认版本 1
  const currentVersion = getCurrentDatabaseVersion()
  if (!currentVersion) {
    const insertVersionQuery = `INSERT INTO version (version) VALUES (?);`
    const stmt = db.prepare(insertVersionQuery)
    stmt.run(1) // 默认插入版本 1
  }
}

// 获取当前数据库版本
function getCurrentDatabaseVersion(): void | number {
  const selectVersionQuery = `SELECT version FROM version ORDER BY id DESC LIMIT 1;`
  const stmt = db.prepare(selectVersionQuery)
  const result = stmt.get()
  return result ? result.version : null // 默认返回旧版本（1）
}

// 检查是否需要更新数据库
function updateDatabase(currentVersion): void {
  console.log(`Updating database from version ${currentVersion} to ${DB_VERSION}`)

  if (currentVersion === 1) {
    // 执行 1 -> 2 的更新操作
    updateToVersion2()
  }

  // 更新数据库版本记录
  const updateVersionQuery = `
    INSERT INTO version (version) VALUES (?);
  `
  const stmt = db.prepare(updateVersionQuery)
  stmt.run(DB_VERSION)

  console.log(`Database updated to version ${DB_VERSION}`)
}

// 3. 创建任务表
// 创建任务列表表
function createTable(): void {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todo_list (
      name TEXT,
      created_at INTEGER,
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `

  // 执行创建表的 SQL 语句
  db.prepare(createTableQuery).run()
}

// 增删改查事件注册

// 查询
// 在 Electron 的主进程中注册一个 IPC 事件处理器
ipcMain.handle('db_query', async (_, query, params = []) => {
  const stmt = db.prepare(query) // 准备 SQL 查询
  return stmt.all(...params) // 执行查询并返回结果
})
// 异步获取任务数据
ipcMain.on('db_tasks_sync_get_by_user_role', (event, name) => {
  let result = getTasksByUserRole<{
    name: string
    todo_id: number
    created_at: number
  }>(name)
  result = result.map((task) => {
    const newItem = { ...task }
    newItem.name = newItem.name ? JSON.parse(newItem.name) : null
    newItem.todo_id = newItem.todo_id ? Number(newItem.todo_id) : NaN
    newItem.created_at = newItem.created_at ? Number(newItem.created_at) : NaN
    return newItem
  })

  event.returnValue = result
})

// 根据 name 查询所有任务数据
export function getTasksByUserRole(name): void {
  const selectQuery = `SELECT * FROM todo_list WHERE name = ?;`

  const stmt = db.prepare(selectQuery)
  return stmt.all(name) // 执行查询并返回结果
}

// 异步获取任务数据
ipcMain.on('db_tasks_sync_get', (event) => {
  let result = getTasks<{
    name: string
    todo_id: number
    created_at: number
  }>()
  result = result.map((task) => {
    const newItem = { ...task }
    newItem.name = newItem.name ? JSON.parse(newItem.name) : null
    newItem.todo_id = newItem.todo_id ? Number(newItem.todo_id) : NaN
    newItem.created_at = newItem.created_at ? Number(newItem.created_at) : NaN
    return newItem
  })
  event.returnValue = result
})
// 示例：查询任务数据
export function getTasks<T>(): T[] {
  const selectQuery = `SELECT * FROM todo_list;`

  const stmt = db.prepare(selectQuery)
  return stmt.all()
}

// 增
// 插入单条数据
ipcMain.handle('db_task_sync_insert', (task) => {
  try {
    return insertTask(task)
  } catch (error) {
    console.error(error)
    return null
  }
})
// 插入任务数据
export function insertTask(task): number {
  const insertQuery = `
    INSERT INTO todo_list (
      name, todo_id, created_at
    ) VALUES (?, ?, ?)
  `

  const params = [task.name, task.todo_id, task.created_at]

  // 执行插入任务数据的 SQL 语句
  const stmt = db.prepare(insertQuery)
  const result = stmt.run(...params)
  // 返回插入的任务ID
  return result.lastInsertRowid
}

// 批量插入数据
ipcMain.handle('db_tasks_insert', (_, tasks) => {
  return insertTasks(tasks)
})
// 批量插入任务数据
export function insertTasks(tasks): void {
  const insertQuery = `
    INSERT INTO todo_list (
      name, todo_id, created_at
    ) VALUES (?, ?, ?)
  `

  const stmt = db.prepare(insertQuery) // 准备 SQL 插入语句

  // 批量插入任务数据
  const transaction = db.transaction((tasks) => {
    for (const task of tasks) {
      const params = [task.name, task.todo_id, task.created_at]
      stmt.run(...params) // 执行每一条任务的插入
    }
  })

  transaction(tasks) // 开启事务并执行批量插入
}

// 改
// 异步更新单条数据
ipcMain.handle('db_task_update', (_, task) => {
  return updateTask(task)
})
// 更新单个任务数据（根据 todo_id 或 id）
export function updateTask(task): void {
  let updateQuery
  let params: {
    name: string
    todo_id: number
    created_at: number
    id: number
  }[]

  // 判断更新的是 id 还是 todo_id
  if (task.id) {
    updateQuery = `
      UPDATE todo_list SET
        name = ?, todo_id = ?, created_at = ?
      WHERE id = ?
    `
    params = [task.name, task.todo_id, task.created_at, task.id]
  } else if (task.todo_id) {
    updateQuery = `
      UPDATE todo_list SET
        name = ?,  created_at = ?
      WHERE todo_id = ?
    `
    params = [task.name, task.created_at, task.todo_id]
  } else {
    throw new Error('Task must have either id or todo_id')
  }

  const stmt = db.prepare(updateQuery) // 准备 SQL 更新语句
  stmt.run(...params) // 执行更新操作
}

// 异步更新多条数据
ipcMain.handle('db_tasks_update', (_, tasks) => {
  return updateTasks(tasks)
})
// 批量更新任务数据（根据 todo_id 或 id）
export function updateTasks(tasks): void {
  const updateQuery = `
    UPDATE todo_list SET
      name = ?,  created_at = ?
    WHERE todo_id = ? OR id = ?
  `

  const stmt = db.prepare(updateQuery) // 准备 SQL 更新语句

  const transaction = db.transaction((tasks) => {
    tasks.forEach((task) => {
      if (task.id || task.todo_id) {
        const params = [task.name, task.created_at, task.todo_id, task.id]
        stmt.run(...params) // 执行批量更新操作
      } else {
        console.warn('Task must have either id or todo_id')
      }
    })
  })

  transaction(tasks) // 执行批量更新事务
}

// 同步更新多条数据
ipcMain.on('db_tasks_sync_update', (event, tasks) => {
  try {
    updateTasks(tasks)
    event.returnValue = true
  } catch (error) {
    console.error(error)
    event.returnValue = false
  }
})
// 同步更新单条数据
ipcMain.on('db_task_sync_update', (event, task) => {
  try {
    updateTask(task)
    event.returnValue = true
  } catch (error) {
    event.returnValue = false
    console.error(error)
  }
})

// 删
// 同步删除单条数据
ipcMain.on('db_task_sync_delete', (event, task) => {
  try {
    deleteTaskByIdOrTaskId(task)
    event.returnValue = true
  } catch (error) {
    console.error(error)
    event.returnValue = false
  }
})
// 异步删除单条数据
ipcMain.handle('db_task_delete', (task) => {
  try {
    deleteTaskByIdOrTaskId(task)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
})
// 根据传入对象的 id 或 todo_id 删除任务数据
export function deleteTaskByIdOrTaskId(task): void {
  let deleteQuery
  let identifier

  // 检查传入对象中是否有 id 或 todo_id
  if (task.id) {
    // 如果传入对象中有 id，则按 id 删除
    deleteQuery = `DELETE FROM todo_list WHERE id = ?`
    identifier = task.id
  } else if (task.todo_id) {
    // 如果传入对象中有 todo_id，则按 todo_id 删除
    deleteQuery = `DELETE FROM todo_list WHERE todo_id = ?`
    identifier = task.todo_id
  } else {
    throw new Error('Object must have either id or todo_id')
  }

  const stmt = db.prepare(deleteQuery) // 准备 SQL 删除语句
  stmt.run(identifier) // 执行删除操作
}

// 删除多条数据
ipcMain.on('db_tasks_sync_delete', (event, tasks) => {
  try {
    deleteTasksByIdOrTaskId(tasks)
    event.returnValue = true
  } catch (error) {
    console.error(error)
    event.returnValue = false
  }
})
// 批量根据 todo_id 或 id 删除任务数据
export function deleteTasksByIdOrTaskId(tasks): void {
  // 生成批量删除的 SQL 语句
  const deleteQuery = `DELETE FROM todo_list WHERE id = ? OR todo_id = ?`

  const stmt = db.prepare(deleteQuery) // 准备 SQL 删除语句

  const transaction = db.transaction((tasks) => {
    tasks.forEach((task) => {
      if (task.id || task.todo_id) {
        // 如果任务对象有 id 或 todo_id，则执行删除操作
        stmt.run(task.id, task.todo_id) // 执行删除操作，按照 id 或 todo_id 删除
      } else {
        console.warn('Task must have either id or todo_id')
      }
    })
  })

  transaction(tasks) // 执行事务，批量删除任务
}
