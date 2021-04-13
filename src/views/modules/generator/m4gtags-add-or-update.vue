<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="标签" prop="tag">
      <el-input v-model="dataForm.tag" placeholder="标签"></el-input>
    </el-form-item>
    <!-- <el-form-item label="所属业务员" prop="ownedBy">
      <el-input v-model="dataForm.ownedBy" placeholder="所属业务员"></el-input>
    </el-form-item> -->
    <!-- <el-form-item label="排序" prop="orderNum">
      <el-input v-model="dataForm.orderNum" placeholder="排序"></el-input>
    </el-form-item> -->
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
          tag: '',
          // ownedBy: '',
          // createTime: '',
          // updateTime: '',
          // deleteTime: '',
          // orderNum: ''
        },
        dataRule: {
          tag: [
            { required: true, message: '标签不能为空', trigger: 'blur' }
          ],
          // ownedBy: [
          //   { required: true, message: '所属业务员不能为空', trigger: 'blur' }
          // ],
          // createTime: [
          //   { required: true, message: '不能为空', trigger: 'blur' }
          // ],
          // updateTime: [
          //   { required: true, message: '不能为空', trigger: 'blur' }
          // ],
          // deleteTime: [
          //   { required: true, message: '不能为空', trigger: 'blur' }
          // ],
          // orderNum: [
          //   { required: true, message: '排序不能为空', trigger: 'blur' }
          // ]
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
              url: this.$http.adornUrl(`/generator/m4gtags/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.tag = data.m4gTags.tag
                this.dataForm.ownedBy = data.m4gTags.ownedBy
                this.dataForm.createTime = data.m4gTags.createTime
                this.dataForm.updateTime = data.m4gTags.updateTime
                this.dataForm.deleteTime = data.m4gTags.deleteTime
                this.dataForm.orderNum = data.m4gTags.orderNum
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
              url: this.$http.adornUrl(`/generator/m4gtags/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'tag': this.dataForm.tag,
                'ownedBy': this.dataForm.ownedBy,
                'createTime': this.dataForm.createTime,
                'updateTime': this.dataForm.updateTime,
                'deleteTime': this.dataForm.deleteTime,
                'orderNum': this.dataForm.orderNum
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
