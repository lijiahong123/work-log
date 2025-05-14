import { statusOptions } from './renderer/src/views/Home/const'
export type contentItem = {
  content: string
  id: number
}
export type WorkItem = {
  id?: string | null
  status: keyof typeof statusOptions | '999'
  date: string
  progress: number
  contentList: contentItem[]
  createdAt?: Date
  updateAt?: Date
}

export type FilterWorkType = {
  date?: string
  status?: string
}

export type DialogType = {
  add: string
  edit: string
}

export type ResData<T = null> = {
  code: 0 | 1
  data: T
  msg: string
}
