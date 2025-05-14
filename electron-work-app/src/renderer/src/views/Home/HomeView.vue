<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElRow, ElCol, ElSpace, ElButton, ElSelect, ElOption, ElEmpty, ElProgress, ElCard } from 'element-plus'
import { Plus, Edit, Download } from '@element-plus/icons-vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { dateOptions, statusOptions } from './const'
import Dialog from './dialog.vue';
import type { contentItem, DialogType, WorkItem } from '../../../../home';
import { getWorkList } from '@renderer/api/work';
import ScrollToTop from '@renderer/components/ScrollTop/index.vue';

const filterObj = ref({ date: '', status: '' })
const open = ref(false);
const workList = ref<WorkItem[]>([])
const workItem = ref<WorkItem>()
const dialogType = ref<keyof DialogType>('add')
const loading = ref(false)

const requestList = async (): Promise<void> => {
  loading.value = true
  const res = await getWorkList(filterObj.value)
  workList.value = res.data
  loading.value = false
}

const openDialog = (type: keyof DialogType, item?: WorkItem): void => {
  // 传递数据
  dialogType.value = type
  workItem.value = item ? JSON.parse(JSON.stringify(item)) : item
  open.value = true
}

onMounted(() => {
  requestList()
})

const statusAndColor = computed(() => {
  return (contentItem: WorkItem) => {
    const { status, progress } = contentItem;

    if (status === '999') {
      const obj = {
        color: '',
        label: ''
      }
      if (progress === 100) {
        obj.color = statusOptions[3].color
        obj.label = '已完成'
      } else if (progress > 0 && progress < 100) {
        obj.color = statusOptions[2].color
        obj.label = '处理中'
      } else {
        obj.color = statusOptions[1].color
        obj.label = '待处理'
      }
      return obj
    }
    return statusOptions[status]
  }
})

const downloadTxt = async (): Promise<void> => {
  const res = await getWorkList(filterObj.value)
  const data = res.data
  const txtContent = data.map((item: WorkItem, idx: number) => {
    return `${idx + 1}. ${item.date}\n状态：${statusAndColor.value(item).label}\n内容：\n${item.contentList.map((contentItem: contentItem, i) => `  ${i + 1}. ${contentItem.content}`).join('\n')}\n\n`
  }).join('')

  const blob = new Blob([txtContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `work_log-${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}


</script>

<template>
  <el-row>
    <el-col :span=22 :offset="1">
      <div class="header">
        <el-space>
          <el-button :icon="Plus" type="primary" @click="openDialog('add')">创建日志</el-button>
          <el-select clearable v-model="filterObj.date" placeholder="日期" style="width: 120px" @change="requestList">
            <el-option v-for="(label, value) in dateOptions" :key="value" :label="label" :value="value" />
          </el-select>
          <el-select clearable v-model="filterObj.status" placeholder="状态" style="width: 120px" @change="requestList">
            <el-option v-for="(item, value) in statusOptions" :key="value" :label="item.label" :value="value" />
          </el-select>
          <!-- <el-button type="success" :icon="Connection">AI总结</el-button> -->
          <el-button type="info" :icon="Download" @click="downloadTxt">导出Txt</el-button>
          <el-button @click="requestList">刷新</el-button>
        </el-space>
      </div>
      <div class="content" v-loading="loading">
        <el-empty v-if="workList.length === 0" :image-size="200" description="暂无数据" />
        <template v-else>

          <DynamicScroller :items="workList" :min-item-size="150" keyField="_id" itemClass="scroll-item" :buffer="0"
            :pageMode="true" wrapper-tag="div" wrapper-class="scroll-wrapper">
            <template v-slot="{ item, index, active }">
              <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.contentList]"
                :data-index="index">
                <div class="card-container">
                  <el-card>
                    <template v-slot:header>
                      <div class="card-head">
                        <div class="left">
                          <i :style="{ backgroundColor: statusAndColor(item).color }"></i>
                          <h3>{{ item.date }}</h3>

                          <!-- 编辑 -->
                          <Edit class="icon" @click="openDialog('edit', item)" />
                        </div>
                        <h4 :style="{ color: statusAndColor(item).color }">{{ statusAndColor(item).label }}</h4>
                      </div>
                      <el-progress :percentage="item.progress" />
                    </template>
                    <ul>
                      <li v-for="contentItem in item.contentList" :key="contentItem.id">{{ contentItem.content }}</li>
                    </ul>
                  </el-card>
                  <!-- 虚拟滚动固定间距 -->
                  <div class="spacing"></div>
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>



        </template>
      </div>
    </el-col>
  </el-row>
  <ScrollToTop />
  <Dialog v-model="open" :item="workItem" :type="dialogType" @refresh="requestList" />
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  z-index: 10;
  top: 0;
  height: 60px;
  background-color: var(--vt-c-white);
  display: flex;
  align-items: center;
}

.content {
  padding-top: 10px;
  min-height: 50vh;


  .card-container {
    .el-card {
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0;


        .left {
          display: flex;
          align-items: center;

          i {
            width: 10px;
            height: 10px;
            background-color: pink;
            border-radius: 50%;
            margin-right: 10px;
          }

          h3 {
            margin-right: 15px;
            font-weight: 500;
          }

          .icon {
            cursor: pointer;
            width: 18px;
            height: 18px;
          }
        }
      }
    }

    .spacing {
      height: 15px;
      background-color: transparent;
    }
  }


}
</style>
