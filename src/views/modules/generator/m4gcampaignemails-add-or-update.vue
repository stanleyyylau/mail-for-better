<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="活动ID" prop="campaignId">
      <el-input v-model="dataForm.campaignId" placeholder="活动ID"></el-input>
    </el-form-item>
    <el-form-item label="邮箱ID" prop="emailId">
      <el-input v-model="dataForm.emailId" placeholder="邮箱ID"></el-input>
    </el-form-item>
    <el-form-item label="首次打开邮件时间" prop="firstOpen">
      <el-input v-model="dataForm.firstOpen" placeholder="首次打开邮件时间"></el-input>
    </el-form-item>
    <el-form-item label="tracking ID" prop="trackingId">
      <el-input v-model="dataForm.trackingId" placeholder="tracking ID"></el-input>
    </el-form-item>
    <el-form-item label="邮件发送时间" prop="sendTime">
      <el-input v-model="dataForm.sendTime" placeholder="邮件发送时间"></el-input>
    </el-form-item>
    <el-form-item label="" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder=""></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          campaignId: '',
          emailId: '',
          firstOpen: '',
          trackingId: '',
          sendTime: '',
          createTime: ''
        },
        dataRule: {
          campaignId: [
            { required: true, message: '活动ID不能为空', trigger: 'blur' }
          ],
          emailId: [
            { required: true, message: '邮箱ID不能为空', trigger: 'blur' }
          ],
          firstOpen: [
            { required: true, message: '首次打开邮件时间不能为空', trigger: 'blur' }
          ],
          trackingId: [
            { required: true, message: 'tracking ID不能为空', trigger: 'blur' }
          ],
          sendTime: [
            { required: true, message: '邮件发送时间不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/generator/m4gcampaignemails/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.campaignId = data.m4gCampaignEmails.campaignId
                this.dataForm.emailId = data.m4gCampaignEmails.emailId
                this.dataForm.firstOpen = data.m4gCampaignEmails.firstOpen
                this.dataForm.trackingId = data.m4gCampaignEmails.trackingId
                this.dataForm.sendTime = data.m4gCampaignEmails.sendTime
                this.dataForm.createTime = data.m4gCampaignEmails.createTime
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/generator/m4gcampaignemails/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'campaignId': this.dataForm.campaignId,
                'emailId': this.dataForm.emailId,
                'firstOpen': this.dataForm.firstOpen,
                'trackingId': this.dataForm.trackingId,
                'sendTime': this.dataForm.sendTime,
                'createTime': this.dataForm.createTime
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
