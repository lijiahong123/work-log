import { ElMessage } from 'element-plus'

// Extend the Window interface to define the type of `api`
declare global {
  interface Window {
    api: {
      [key: string]: (params?: any) => Promise<any>
    }
  }
}

async function request<T>({ method, params }: { method: string; params?: any }): Promise<T> {
  const res = await window.api[method](params)
  if (res.code === 1) {
    ElMessage.error(res.message)
  }
  return res
}

export default request
