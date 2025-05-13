import { ipcRenderer } from 'electron'

export const betterSqlite = {
  // 获取数据库中的所有待办事项
  getTodoList: <T>(): Promise<T[]> => ipcRenderer.invoke('db_query', 'SELECT * FROM todo_list;'),

  // 根据 user_id_role 获取任务列表
  getTasksByUserRole: <T>(userIdRole: string): Promise<T> =>
    ipcRenderer.invoke('db_tasks_sync_get_by_user_role', userIdRole),

  // 插入单个任务
  insertTask: <T>(task: T): Promise<void> => ipcRenderer.invoke('db_task_sync_insert', task),

  // 插入多个任务
  insertTasks: <T>(tasks: T[]): Promise<void> => ipcRenderer.invoke('db_tasks_insert', tasks),

  // 更新单个任务
  updateTask: <T>(task: T): Promise<void> => ipcRenderer.invoke('db_task_update', task),

  // 更新多个任务
  updateTasks: <T>(tasks: T[]): Promise<void> => ipcRenderer.invoke('db_tasks_update', tasks),

  // 删除单个任务
  deleteTask: <T>(task: T): Promise<void> => ipcRenderer.invoke('db_task_delete', task),

  // 删除多个任务
  deleteTasks: <T>(tasks: T[]): Promise<void> => ipcRenderer.invoke('db_tasks_sync_delete', tasks),

  // 查询任务数据，根据 ID 或 todo_id
  getTaskById: <T>(todoId: string | number): Promise<T> =>
    ipcRenderer.invoke('db_query', 'SELECT * FROM todo_list WHERE todo_id = ?', [todoId]),

  // 异步更新数据库中的任务状态
  updateTaskStatus: (taskId: string | number, status: string | number): Promise<void> =>
    ipcRenderer.invoke('db_task_sync_update', {
      todo_id: taskId,
      status: status
    }),

  // 获取数据库版本
  getDatabaseVersion: (): Promise<string> =>
    ipcRenderer.invoke('db_query', 'SELECT version FROM version ORDER BY id DESC LIMIT 1;')
}
