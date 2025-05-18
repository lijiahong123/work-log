import { ElMessage } from 'element-plus'

async function request<T>({
  method,
  params
}: {
  method: string
  params?: any
}): Promise<{ code: number; data: T; msg?: string }> {
  try {
    const res = await window.api[method](params)
    console.log('++++++++++++++++++++++,', res)

    if (res?.code === 1) {
      ElMessage.error(res.msg)
      return Promise.reject(res)
    }
    return res
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
}

export default request
