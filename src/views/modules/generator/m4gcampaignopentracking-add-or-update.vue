<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="tracking ID" prop="trackingId">
      <el-input v-model="dataForm.trackingId" placeholder="tracking ID"></el-input>
    </el-form-item>
    <el-form-item label="首次打开邮件时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="首次打开邮件时间"></el-input>
    </el-form-item>
    <el-form-item label="国家" prop="country">
      <el-input v-model="dataForm.country" placeholder="国家"></el-input>
    </el-form-item>
    <el-form-item label="区域" prop="region">
      <el-input v-model="dataForm.region" placeholder="区域"></el-input>
    </el-form-item>
    <el-form-item label="城市" prop="city">
      <el-input v-model="dataForm.city" placeholder="城市"></el-input>
    </el-form-item>
    <el-form-item label="IP 地址" prop="ipAddress">
      <el-input v-model="dataForm.ipAddress" placeholder="IP 地址"></el-input>
    </el-form-item>
    <el-form-item label="操作系统" prop="operatingSystem">
      <el-input v-model="dataForm.operatingSystem" placeholder="操作系统"></el-input>
    </el-form-item>
    <el-form-item label="设备类型" prop="deviceType">
      <el-input v-model="dataForm.deviceType" placeholder="设备类型"></el-input>
    </el-form-item>
    <el-form-item label="设备厂商" prop="deviceVendor">
      <el-input v-model="dataForm.deviceVendor" placeholder="设备厂商"></el-input>
    </el-form-item>
    <el-form-item label="浏览器名字" prop="browserName">
      <el-input v-model="dataForm.browserName" placeholder="浏览器名字"></el-input>
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
          trackingId: '',
          createTime: '',
          country: '',
          region: '',
          city: '',
          ipAddress: '',
          operatingSystem: '',
          deviceType: '',
          deviceVendor: '',
          browserName: ''
        },
        dataRule: {
          trackingId: [
            { required: true, message: 'tracking ID不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '首次打开邮件时间不能为空', trigger: 'blur' }
          ],
          country: [
            { required: true, message: '国家不能为空', trigger: 'blur' }
          ],
          region: [
            { required: true, message: '区域不能为空', trigger: 'blur' }
          ],
          city: [
            { required: true, message: '城市不能为空', trigger: 'blur' }
          ],
          ipAddress: [
            { required: true, message: 'IP 地址不能为空', trigger: 'blur' }
          ],
          operatingSystem: [
            { required: true, message: '操作系统不能为空', trigger: 'blur' }
          ],
          deviceType: [
            { required: true, message: '设备类型不能为空', trigger: 'blur' }
          ],
          deviceVendor: [
            { required: true, message: '设备厂商不能为空', trigger: 'blur' }
          ],
          browserName: [
            { required: true, message: '浏览器名字不能为空', trigger: 'blur' }
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
              url: this.$http.adornUrl(`/generator/m4gcampaignopentracking/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.trackingId = data.m4gCampaignOpenTracking.trackingId
                this.dataForm.createTime = data.m4gCampaignOpenTracking.createTime
                this.dataForm.country = data.m4gCampaignOpenTracking.country
                this.dataForm.region = data.m4gCampaignOpenTracking.region
                this.dataForm.city = data.m4gCampaignOpenTracking.city
                this.dataForm.ipAddress = data.m4gCampaignOpenTracking.ipAddress
                this.dataForm.operatingSystem = data.m4gCampaignOpenTracking.operatingSystem
                this.dataForm.deviceType = data.m4gCampaignOpenTracking.deviceType
                this.dataForm.deviceVendor = data.m4gCampaignOpenTracking.deviceVendor
                this.dataForm.browserName = data.m4gCampaignOpenTracking.browserName
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
              url: this.$http.adornUrl(`/generator/m4gcampaignopentracking/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'trackingId': this.dataForm.trackingId,
                'createTime': this.dataForm.createTime,
                'country': this.dataForm.country,
                'region': this.dataForm.region,
                'city': this.dataForm.city,
                'ipAddress': this.dataForm.ipAddress,
                'operatingSystem': this.dataForm.operatingSystem,
                'deviceType': this.dataForm.deviceType,
                'deviceVendor': this.dataForm.deviceVendor,
                'browserName': this.dataForm.browserName
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
