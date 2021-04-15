<template>
  <div class="import-client">
    <el-row :gutter="20">
      <el-col :span="12" :offset="6">
        <div class="grid-content bg-purple">
        <h2>Import Client</h2>
            <el-upload
              action=""
              class="upload-csv"
              ref="upload"
              :limit=1
              :auto-upload="false">
              <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
              <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">加载数据</el-button>
              <div class="el-upload__tip" slot="tip"><a href="#" target="_blank">CSV Example</a></div>
            </el-upload>
            <div>
              <el-table
                :data="csv"
                style="width: 100%"
                height="350">
                <el-table-column
                  fixed
                  prop="email"
                  label="Email"
                  width="300px">
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="Name"
                  width="300px">
                </el-table-column>
              </el-table>
            </div>
            <div class="tag-wrap">
              <el-select v-model="tagId" placeholder="选择标签">
                <el-option
                  v-for="item in tagOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div>
              <el-button :disabled="csv.length === 0 || tagId === ''" :loading="loading" type="primary" @click="importClient">导入</el-button>
            </div>
          </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
 import { fetchTagOptionsData } from '../../utils/common'

  export default {
    data () {
      return {
        loading: false,
        csv: [],
        tagId: "",
        tagOptions: []
      }
    },
    async mounted () {
      const options = await fetchTagOptionsData()
      this.tagOptions = options
    },
    methods: {
      submitUpload: function() {
        const self = this
        console.log('hihi')
        const uploadRef = this.$refs.upload
        const file = uploadRef.uploadFiles[0]
        
        var reader = new FileReader();
        reader.onload = function () {
            console.log('data reaa', reader.result)
            const cleanResult = reader.result.replace(/\n"/g, '"')
            const rows = cleanResult.split(/\n/).filter(row => row !== "")
            rows.shift()
            const parseData = rows.map(row => ({
              email: row.split(',')[0].trim(),
              name: row.split(',')[1].trim()
            }))
            self.csv = parseData
            console.log(self.csv)
        };
        reader.readAsBinaryString(file.raw);

      },
      importClient: function() {
        console.log('csv is')
        console.log(this.csv)
        this.loading = true

        this.$http({
              url: this.$http.adornUrl(`/generator/m4gsubscriber/import?tagId=${this.tagId}`),
              method: 'post',
              data: this.csv
            }).then(({data}) => {
              console.log('hihih')
              this.loading = false
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.csv = []
                    this.$router.push({path: "/generator-m4gsubscriber"})
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
      }
    }
  }
</script>

<style lang="scss">
.grid-content.bg-purple {
    padding: 20px;
    border: 1px solid #efe1e1;
}
.tag-wrap {
  padding: 10px 0;
}
</style>
