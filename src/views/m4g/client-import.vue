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
      CSVToArray: function ( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    },
      submitUpload: function() {
        const self = this
        console.log('hihi')
        const uploadRef = this.$refs.upload
        const file = uploadRef.uploadFiles[0]
        
        var reader = new FileReader();
        reader.onload = function () {
            console.log('data reaa', reader.result)
            // const cleanResult = reader.result.replace(/\n"/g, '"')
            try {
              let rows = self.CSVToArray(reader.result, ',')
              rows.shift()
              rows = rows.filter(row => row.length === 2 && row[0] !== '' && row[1] !== '')
              const parseData = rows.map(row => ({
                email: row[0].trim(),
                name: row[1].trim()
              }))
              self.csv = parseData
              console.log(self.csv)
            } catch(e) {
              self.$message("CSV格式错误")
            }
            
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
