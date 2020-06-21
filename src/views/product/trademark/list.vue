<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAdd">添加</el-button>

    <el-table style="margin: 20px 0" :data="trademarks" border v-loading="loading">
      <el-table-column label="序号" type="index" width="80" align="center" />

      <!-- 
        表格的一列显示的就是数据的属性值: prop来指定
        如果不是(需要显示一个特定的标签结构): 

      -->
      <el-table-column prop="tmName" label="品牌名称" />

      <el-table-column label="品牌LOGO">
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" style="width: 100px; height:60px;" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="{row, $index}">
          <el-button type="warning" size="mini" icon="el-icon-edit" @click="showUpdate(row)">修改</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="getTrademarks"
      @size-change="handleSizeChange"
      style="text-align: center"
      :current-page="page"
      :page-sizes="[3, 6, 9]"
      :page-size="limit"
      :total="total"
      layout="prev, pager, next, jumper, ->, sizes, total"
    />
    <el-dialog :title="form.id?'修改品牌':'添加品牌'" :visible.sync="isShowDialog">
      <el-form :model="form" style="width: 80%" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过50kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { trademark } from "../../../api";
export default {
  name: "Trademark",

  data() {
    return {
      trademarks: [], //当前页的品牌列表
      total: 0, //总数量
      page: 1, //当前页码
      limit: 3, //每页的数量
      isShowDialog: false, // 是否显示添加的对话框
      form: {
        // 用来收集品牌添加的数据
        tmName: "", // 品牌名称
        logoUrl: "" // 品牌logo的url
      },

      imageUrl: "", // 上传的图片url
      loading: false, //是否正在请求
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称" }, //trigger: "change"默认值
          // { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }//内置校验规则
          // 自定义规则校验
          { trigger: "blur", validator: this.validateTmName }
        ],
        logoUrl: [{ required: true, message: "LOGO必须指定" }]
      }
    };
  },

  mounted() {
    //  异步获取第一页列表显示
    this.getTrademarks();
  },
  methods: {
    /*自定义校验函数  
    value：需要进行校验的数据值
    callback：用来指定校验是否通过的函数，如果执行没有传递参数代表通过，若传递了代表不通过
    */
    validateTmName(rule, value, callback) {
      if (value.length < 2 || value.length > 10) {
        //不通过
        // callback(new Error('长度必须在2-10之间'));
        callback("长度必须在2-10之间");
      } else {
        //通过
        callback();
      }
    },
    // 删除指定的品牌
    remove(trademark) {
      this.$confirm(`确定删除 ${trademark.tmName} 吗?`, "提示", {
        type: "warning"
      })
        .then(async () => {
          // 点击确定的回调
          // 发删除品牌的请求
          const result = await this.$API.trademark.remove(trademark.id);
          // 如果成功了, 提示成功, 重新获取列表(哪一页?)
          if (result.code === 200) {
            this.$message({
              type: "success",
              message: "删除成功!"
            });

            // 哪一页?  显示上一页(当前页的列表数据只剩下1个)  否则显示当前页
            // 如果当前是第1页且只剩下1条数据 ==> 请求第1页数据(当前页)
            this.getTrademarks(
              this.trademarks.length === 1 && this.page > 1
                ? this.page - 1
                : this.page
            );
          } else {
            // 如果失败了, 提示删除失败
            this.$message({
              type: "error",
              message: "删除失败"
            });
          }
        })
        .catch(() => {
          // 点击取消的回调
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 添加或更新
    addOrUpdate() {
      // 对表单所有内容进行校验
      this.$refs["ruleForm"].validate(async valid => {
        // 校验通过
        if (valid) {
          // 准备数据
          const trademark = this.form;
          let result;
          // 提交请求
          if (trademark.id) {
            // 更新
            result = await this.$API.trademark.update(trademark);
          } else {
            // 添加
            result = await this.$API.trademark.add(trademark);
          }
          // 请求成功
          if (result.code === 200) {
            this.$message.success(`${trademark.id ? "更新" : "添加"}成功!`);
            // 关闭当前dialog
            this.isShowDialog = false;
            // 重新获取列表显示  更新显示当前页\添加显示第一页
            this.getTrademarks(trademark.id ? this.page : 1);
          } else {
            // 请求失败
            this.$message.success(`${trademark.id ? "更新" : "添加"}失败!`);
          }
        } else {
          console.log("校验失败");
          return false;
        }
      });
    },
    // 上传成功的回调
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },

    beforeAvatarUpload(file) {
      // const isJPGOrPNG =
      //   file.type === "image/jpeg" || file.type === "image/png";
      const isJPGOrPNG = ["image/jpeg", "image/png"].indexOf(file.type) > 0;
      const isLt50K = file.size / 1024 < 50;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 JPG或PNG 格式!");
      }
      if (!isLt50K) {
        this.$message.error("上传头像图片大小不能超过 50k!");
      }
      return isJPGOrPNG && isLt50K;
    },
    // 显示修改页面
    showUpdate(trademark) {
      // 将trademark指定为form
      // 对trademark进行一个浅拷贝
      this.form = { ...trademark };
      // 更新isShowDialog为true
      this.isShowDialog = true;
    },
    // 显示添加页面
    showAdd() {
      // 清除form中的数据
      this.form = {
        tmName: "",
        logoUrl: ""
      };
      // 显示isShowDialog
      this.isShowDialog = true;
    },
    // 修改每页数量
    handleSizeChange(pageSize) {
      // 更新limit
      this.limit = limit;
      // 重新回到第一页
      this.getTrademarks(1);
    },
    async getTrademarks(page = 1) {
      // 更新当前页码
      this.page = page;
      this.loading = true;
      //  获取列表哦数据
      const result = await this.$API.trademark.getList(page, this.limit);
      this.loading = false;
      if (result.code === 200) {
        const { records, total } = result.data;
        this.trademarks = records;
        this.total = total;
      } else {
        //失败的提示
        this.$message({
          type: "warning",
          message: "获取分页列表失败"
        });
        this.$message.error("获取分页列表失败");
      }
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>