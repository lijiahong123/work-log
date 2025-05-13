import 'element-plus/dist/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { ElLoading } from 'element-plus'

import App from './App.vue'

const app = createApp(App)
app.directive('loading', ElLoading.directive)

app.mount('#app')
