<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="邮箱地址" prop="email">
      <el-input v-model="dataForm.email" placeholder="邮箱地址"></el-input>
    </el-form-item>
    <el-form-item label="名字" prop="name">
      <el-input v-model="dataForm.name" placeholder="名字"></el-input>
    </el-form-item>
    <el-form-item label="标签" prop="tagId">
      <el-select v-model="dataForm.tagId" placeholder="Select">
        <el-option
          v-for="item in tagOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
 import { fetchTagOptionsData } from '../../../utils/common'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          email: '',
          name: '',
          tagId: '',
        },
        tagOptions: [],
        dataRule: {
          email: [
            { required: true, message: '邮箱地址不能为空', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '名字不能为空', trigger: 'blur' }
          ],
          tagId: [
            { required: true, message: '标签不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      async init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/generator/m4gsubscriber/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.email = data.m4gSubscriber.email
                this.dataForm.name = data.m4gSubscriber.name
                this.dataForm.tagId = data.m4gSubscriber.tagId
              }
            })
          }
        })
        const tagOptions = await fetchTagOptionsData()
        this.tagOptions = tagOptions
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/generator/m4gsubscriber/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'email': this.dataForm.email,
                'name': this.dataForm.name,
                'tagId': this.dataForm.tagId,
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>
