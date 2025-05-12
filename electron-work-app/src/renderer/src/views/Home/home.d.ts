import { statusOptions } from './const'
export type contentItem = {
  content: string
  id: number
}
export type WorkItem = {
  _id?: string | null
  status: keyof typeof statusOptions | '999'
  date: string
  progress: number
  contentList: contentItem[]
}

export type DialogType = {
  add: string
  edit: string
}
