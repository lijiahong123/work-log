import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 50000,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

instance.interceptors.request.use((config) => {
  // Add any custom logic here
  return config
})

instance.interceptors.response.use(
  (response) => {
    const data = response.data

    console.log(data)

    if (data.code !== 0) {
      ElMessage.error(data.msg || '请求失败')
      console.log('message提示了')

      return Promise.reject(data.msg || '请求失败')
    }
    // Add any custom logic here
    return data
  },
  (error) => {
    console.log(error)

    // Handle error
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  },
)
export default instance
