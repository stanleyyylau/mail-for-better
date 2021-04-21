<template>
  <el-dialog
    width="80%"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="模版名字" prop="category">
      <el-input v-model="dataForm.category" placeholder="模版名字"></el-input>
    </el-form-item>
    <el-form-item label="公开该模版" prop="isPublic">
      <el-switch
        v-model="dataForm.isPublic"
        active-color="#13ce66"
        inactive-color="#ff4949">
      </el-switch>
    </el-form-item>
    <el-form-item label="邮箱标题" prop="subject">
      <el-input v-model="dataForm.subject" placeholder="邮箱标题"></el-input>
    </el-form-item>
    <el-form-item label="邮箱正文" prop="body">
      <div ref="edit">
        <script :v-if="ue !== null" :id="ueId" class="ueditor-box" type="text/plain" style="width: 100%; height: 260px;">{{dataForm.body}}</script>
      </div>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button :disabled="!dataForm.isOwner" type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import ueditor from 'ueditor'
      import { appendIsOwnerField } from '../../../utils/common'

  export default {
    mounted () {
      
    },
    created () {
      
    },
    watch: {
      visible: function(newValue, oldValue) {
          if (newValue && this.ue === null) {
            window.setTimeout(this.loadEditor, 100)
          }
      },
      "dataForm.body": function(newValue, oldValue) {
        if (newValue === '') this.ue.setContent('')
        if (newValue) {
          this.ue.setContent(this.dataForm.body);
          // window.setTimeout(this.loadEditor, 1000)
          // this.loadEditor()
        } else {
          // this.ue.destroy()
          // this.ue = null
          // this.$refs.edit.html = ""
          //this.uid = `J_ueditorBox_${new Date().getTime()}`
        }
      }
    },
    data () {
      return {
        ue: null,
        ueId: `J_ueditorBox_${new Date().getTime()}`,
        ueContent: '',
        visible: false,
        dataForm: {
          id: 0,
          category: '',
          ownedBy: '',
          isPublic: false,
          subject: '',
          body: '',
          orderNum: '',
          isOwner: false,
        },
        dataRule: {
          category: [
            { required: true, message: '模版分类不能为空', trigger: 'blur' }
          ],
          isPublic: [
            { required: true, message: '是否公开模版不能为空', trigger: 'blur' }
          ],
          subject: [
            { required: true, message: '邮箱标题不能为空', trigger: 'blur' }
          ],
          body: [
            { required: true, message: '邮箱正文不能为空', trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      loadEditor() {
          self = this
          this.ue = ueditor.getEditor(this.ueId, {
            // serverUrl: '', // 服务器统一请求接口路径
            zIndex: 3000
          })
          this.ue.ready(function(){
              //设置编辑器的内容
              self.ue.setContent(self.dataForm.body);
              //获取html内容，返回: <p>hello</p>
              // var html = ue.getContent();
              // //获取纯文本内容，返回: hello
              // var txt = ue.getContentTxt();
          });
      },
      async getContent () {
        const self = this
        new Promise((resolve, reject) => {
          self.ue.ready(() => {
              this.ueContent = this.ue.getContent()
              resolve()
          })
        })
      },
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/generator/m4gtemplates/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(async ({data}) => {
              if (data && data.code === 0) {
                this.dataForm.category = data.m4gTemplates.category
                this.dataForm.ownedBy = data.m4gTemplates.ownedBy
                this.dataForm.isPublic = data.m4gTemplates.isPublic
                this.dataForm.subject = data.m4gTemplates.subject
                this.dataForm.body = data.m4gTemplates.body
                this.dataForm.createTime = data.m4gTemplates.createTime
                this.dataForm.updateTime = data.m4gTemplates.updateTime
                this.dataForm.deleteTime = data.m4gTemplates.deleteTime
                this.dataForm.orderNum = data.m4gTemplates.orderNum
                const arrayResult = await appendIsOwnerField([this.dataForm])
                this.dataForm = arrayResult[0]
                console.log('data form is', this.dataForm)
              }
            })
          }
        })
      },
      // 表单提交
      async dataFormSubmit () {
        await this.getContent()
        this.dataForm.body = this.ueContent
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/generator/m4gtemplates/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: {
                'id': this.dataForm.id || undefined,
                'category': this.dataForm.category,
                'isPublic': this.dataForm.isPublic,
                'subject': this.dataForm.subject,
                'body': this.dataForm.body,
              }
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
