<template>
  <el-dialog v-model="model" :title="title" width="40%" draggable :close-on-click-modal="false" :overflow="false"
    @open="openDialog" @close="closeDialog">
    <!-- 内容 -->
    <el-form ref="ruleFormRef" label-position="top" :model="ruleForm" status-icon :rules="rules" label-width="auto">
      <!-- 日期 -->
      <el-form-item label="日期" prop="date">
        <el-date-picker v-model="ruleForm.date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" type="date"
          placeholder="选择日期" style="width: 100%;" :clearable="false" />
      </el-form-item>

      <!-- 工作内容 -->
      <el-form-item label="工作内容" prop="contentList">
        <div class="content-item" v-for="(item) in contentList" :key="item.id">
          <el-input v-model="item.content" style="width: 100%" :autosize="{ minRows: 2 }" type="textarea"
            placeholder="工作内容" />
          <el-icon class="del-icon" @click="() => contentList.splice(contentList.indexOf(item), 1)">
            <Close />
          </el-icon>
        </div>
        <el-button text type="primary"
          @click="() => contentList.push({ content: '', id: Date.now() })">添加工作内容</el-button>
      </el-form-item>

      <!-- 工作状态 -->
      <el-form-item label="工作状态" prop="status">
        <div style="width: 100%;">
          <el-select clearable v-model="ruleForm.status" placeholder="状态" style="width: 45%">
            <el-option v-for="(item, value) in { ...statusOptions, 999: { label: '自定义进度' } }" :key="value"
              :label="item.label" :value="value" />
          </el-select>
          <el-input-number v-if="ruleForm.status === '999'" :min="0" :max="100" v-model="ruleForm.progress"
            style="width: 45%; margin-left:10px" />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="model = false">取消</el-button>
        <el-button type="primary" @click="confim()">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { statusOptions, dialogType } from '@/views/Home/const'
import type { WorkItem, contentItem, DialogType } from './home'
import { isEmpty } from '@/utils/index'
import { saveWork, editWork } from '@/api/work'

defineOptions({
  name: 'HomeDialog'
})
const emit = defineEmits(['refresh'])

const props = defineProps({
  item: {
    type: Object as () => WorkItem,
    default: () => ({
      id: null,
      date: '',
      contentList: [],
      status: '1',
      progress: 0,
    }),
  },
  type: {
    type: String as () => keyof DialogType,
    default: 'add',
  }
})
const title = dialogType[props.type]
const ruleFormRef = ref<FormInstance>()
const model = defineModel({
  type: Boolean,
  default: false,
})

const ruleForm = reactive<WorkItem>({
  _id: null,
  date: '',
  contentList: [],
  status: '1',
  progress: 0,
})

const rules = reactive<FormRules<typeof ruleForm>>({
  date: [{ required: true, message: '请选择日期', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
  contentList: [
    { required: true, message: '请填写工作内容', trigger: 'blur' },
    {
      validator(rule, value, callback) {
        if (value.length === 0) {
          callback(new Error('请填写工作内容'))
        } else {
          if (value.some((item: contentItem) => isEmpty(item.content))) {
            callback(new Error('请填写工作内容'))
          } else {
            callback()
          }
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
})
const contentList = ref<contentItem[]>([{
  content: '',
  id: Date.now(),
}])

const openDialog = async () => {
  if (props.type === 'edit') {
    await nextTick()
    ruleForm._id = props.item._id
    ruleForm.date = props.item.date
    ruleForm.contentList = [...props.item.contentList]
    ruleForm.status = props.item.status
    ruleForm.progress = props.item.progress
    contentList.value = [...props.item.contentList]
  }
}

watch(() => contentList.value, (newVal) => {
  ruleForm.contentList = newVal
}, { deep: true })

const closeDialog = () => {
  ruleForm.contentList = []
  ruleForm.date = ''
  ruleForm.status = '1'
  ruleForm.progress = 0
  ruleForm._id = null
  contentList.value = []
  ruleFormRef.value?.clearValidate()
}

const confim = () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submit()
    } else {
      console.log('error submit!')
    }
  })

}

const submit = async () => {
  const RequestMethod = {
    'add': saveWork,
    'edit': editWork,
  }
  try {
    await RequestMethod[props.type](ruleForm)
    emit('refresh');
    model.value = false
  } catch (error) {
    console.error('保存工作失败', error)
  }
}
</script>

<style lang="scss" scoped>
.content-item {
  position: relative;
  width: 100%;
  margin-bottom: 10px;


  .del-icon {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    color: #909399;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
