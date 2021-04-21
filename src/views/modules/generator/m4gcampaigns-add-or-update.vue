<template>
  <el-dialog
    width="80%"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="选择模版">
        <el-select v-model="dataForm.templateId" placeholder="非必选">
          <el-option
            v-for="item in templateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <div class="listRow">
        <el-form-item label="选择分类" prop="tagId">
          <el-select v-model="dataForm.tagId" placeholder="选择客户分类">
            <el-option
              v-for="item in tagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择标签" prop="tagIds" label-width="100px">
          <el-select v-model="dataForm.tagIds" placeholder="选择客户标签" multiple>
            <el-option
              v-for="item in tagsOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="buttonWrap">
            <el-button :loading="loadingValidEmails" @click="checkValidEmails">查询有效邮箱</el-button>
        </div>
        <div v-if="this.validEmailNum !== null" class="validEmailWrap">
          {{this.validEmailNum}} 个有效邮箱
        </div>
      </div>
      <el-form-item label="邮箱标题" prop="subject">
        <el-input v-model="dataForm.subject" placeholder="邮箱标题"></el-input>
      </el-form-item>
      <el-form-item label="发件人" prop="fromEmail">
        <div class="sender-row">
          <div class="prefix">
            <el-input v-model="dataForm.fromEmail" placeholder="发件人"></el-input>
          </div>
          <div class="postfix">
            <el-select v-model="dataForm.emailOption" placeholder="选择邮箱后缀">
              <el-option
                v-for="item in emailOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="邮箱正文" prop="body">
        <div ref="edit">
          <script :v-if="ue !== null" :id="ueId" class="ueditor-box" type="text/plain" style="width: 100%; height: 260px;">{{dataForm.body}}</script>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button :disabled="dataForm.id && dataForm.status === 4" type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import ueditor from 'ueditor'
  export default {
    async created () {
      this.loadMultiTagOptions()
      const templateRes = await this.$http({
          url: this.$http.adornUrl('/generator/m4gtemplates/listmyandpublic'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 999999,
          })
        })
      this.templateData = templateRes.data.page.list
      const tagsRes = await this.$http({
          url: this.$http.adornUrl('/generator/m4gtags/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 999999,
          })
        })
      this.tagOptions = tagsRes.data.page.list.map(item => ({
        label: item.tag,
        value: item.id
      }))
    },
    data () {
      return {
        ue: null,
        ueId: `J_ueditorBox_${new Date().getTime()}`,
        ueContent: '',
        visible: false,
        validEmailNum: null,
        loadingValidEmails: false,
        dataForm: {
          id: 0,
          subject: '',
          body: '',
          emailOption: '@aixin-tech.com',
          fromEmail: '',
          templateId: '',
          tagId: '',
          tagIds: null
        },
        tagsOptions: [],
        emailOptions: [{
          label: '@aixin-tech.com',
          value: '@aixin-tech.com'
        }, {
          label: '@aixinetech.com',
          value: '@aixinetech.com'
        }],
        tagOptions: [],
        templateData: [],
        dataRule: {
          subject: [
            { required: true, message: '邮箱标题不能为空', trigger: 'blur' }
          ],
          body: [
            { required: true, message: '邮箱正文不能为空', trigger: 'blur' }
          ],
          tagId: [
            { required: true, message: '客户标签不能为空, 不然发给谁呀?', trigger: 'change' }
          ],
          fromEmail: [
            { required: true, message: '发件人不能为空', trigger: 'blur' }
          ],
        }
      }
    },
    computed: {
       templateOptions: function() {
         return this.templateData.map(item => ({
           value: item.id,
           label: item.category
         }))
       }
    },
    watch: {
      visible: function(newValue, oldValue) {
          if (newValue && this.ue === null) {
            window.setTimeout(this.loadEditor, 100)
          }
      },
      "dataForm.templateId": function(newValue) {
          const targetTemplate = this.templateData.filter(template => template.id === newValue)[0]
          this.dataForm.body = targetTemplate.body
          this.dataForm.subject = targetTemplate.subject
          this.ue.setContent(this.dataForm.body)
      },
      "dataForm.body": function(newValue, oldValue) {
        if (newValue === '') this.ue.setContent('')
        if (newValue) {
          this.ue.setContent(this.dataForm.body)
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
    methods: {
      checkValidEmails() {
        this.loadingValidEmails = true
          this.$http({
              url: this.$http.adornUrl('/generator/m4gsubscriber/listbyparam/'),
              method: 'post',
              data: {
                categoryIds: [this.dataForm.tagId],
                tagIds: this.dataForm.tagIds
              }
            }).then(({data}) => {
              this.loadingValidEmails = false
              if (data && data.code === 0) {
                console.log('valid emails data', data)
                this.validEmailNum = data.data.length
              }
            })
      },
      async loadMultiTagOptions () {
          this.$http({
              url: this.$http.adornUrl('/generator/m4grealtags/list/'),
              method: 'get',
              params: this.$http.adornParams({
                'page': 1,
                'limit': 99999,
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                console.log('data', data)
                this.tagsOptions = data.page.list.map(item => ({
                  label: item.tag,
                  value: item.id
                }))
              }
            })
      },
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
              url: this.$http.adornUrl(`/generator/m4gcampaigns/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.subject = data.m4gCampaigns.subject
                this.dataForm.body = data.m4gCampaigns.body
                this.dataForm.fromEmail = data.m4gCampaigns.fromEmail.split('@')[0]
                this.dataForm.emailOption = `@${data.m4gCampaigns.fromEmail.split('@')[1]}`
                this.dataForm.tagId = data.m4gCampaigns.tagId
                this.dataForm.tagIds = data.m4gCampaigns.tagIds ? data.m4gCampaigns.tagIds.split(',').map(item => Number(item)) : null
                this.dataForm.status = data.m4gCampaigns.status
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
              url: this.$http.adornUrl(`/generator/m4gcampaigns/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'subject': this.dataForm.subject,
                'body': this.dataForm.body,
                'fromEmail': `${this.dataForm.fromEmail}${this.dataForm.emailOption}`,
                'tagId': this.dataForm.tagId,
                'tagIds': this.dataForm.tagIds.join(',')
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
<style scoped>
.sender-row {
    display: flex;
    max-width: 300px;
}
.listRow {
    display: flex;
    align-items: center;
}
.buttonWrap {
  margin-bottom: 22px;
  margin-left: 10px;
  margin-right: 10px;
}
.validEmailWrap {
  margin-bottom: 22px;
}
</style>