<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" ref="cs" />
    </el-card>
    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <el-button type="primary" icon="el-icon-plus" @click="showAdd" :disabled="!category3Id">添加属性</el-button>
        <el-table :data="attrs" border v-loading="loading">
          <el-table-column type="index" width="80px" align="center" label="序号"></el-table-column>
          <el-table-column label="属性名称" prop="attrName" width="150px"></el-table-column>
          <el-table-column label="属性值列表">
            <template slot-scope="{row,$index}">
              <el-tag
                type="info"
                v-for="item in row.attrValueList"
                :key="item.id"
              >{{item.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
            <template slot-scope="{row,$index}">
              <HintButton
                type="primary"
                icon="el-icon-edit"
                size="minin"
                title="编辑"
                @click="showUpdate(row)"
              />
              <!-- <el-button type="primary" icon="el-icon-edit" size="minin"></el-button> -->

              <el-popconfirm :title="`确定删除 ${row.attrName} 吗?`" @onConfirm="removeList(row.id)">
                <!-- @onConfirm="attr.attrValueList.splice($index, 1)" -->
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="minin"
                  title="删除"
                />
              </el-popconfirm>

              <!-- <el-button type="danger" icon="el-icon-delete" size="minin"></el-button>-->
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">
        <el-form inline>
          <el-form-item label="属性名">
            <el-input type="text" placeholder="请输入属性名" v-model="attr.attrName"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue()"
          :disabled="!attr.attrName"
        >添加属性值</el-button>
        <el-button @click="isShowList=true">取消</el-button>
        <el-table border style="margin:20px 0" :data="attr.attrValueList">
          <el-table-column align="center" label="序号" type="index" width="80px"></el-table-column>
          <el-table-column align="center" label="属性值名称">
            <template slot-scope="{row,$index}">
              <el-input
                :ref="$index"
                v-if="row.edit"
                v-model="row.valueName"
                @blur="toList(row)"
                @keyup.enter.native="toList(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row,$index)"
                style="display:inline-block;width:100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="{row, $index}">
              <el-popconfirm
                :title="`确定删除 ${row.valueName} 吗?`"
                @onConfirm="attr.attrValueList.splice($index, 1)"
              >
                <hint-button
                  slot="reference"
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                ></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button
          type="primary"
          ref="dis"
          :disabled="!attr.attrName||!attr.attrValueList.length===0"
          @click="save"
        >保存</el-button>

        <el-button @click="isShowList=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "AttrList",
  data() {
    return {
      loading: false, //是否正在加载
      category1Id: "", //一级分类Id
      category2Id: "", //二级分类Id
      category3Id: "", //三级分类Id
      attrs: [], // 属性列表
      isShowList: true, //是否显示属性列表界面
      //当前要操作的属性对象
      attr: {
        attrName: "", //属性名
        attrValueList: [], //属性值列表
        categoryId: "", //三级分类ID
        categoryLevel: 3 //分类级别
      }
    };
  },
  watch: {
    // 监视isShowList
    isShowList(value) {
      this.$refs.cs.disabled = !value;
    }
  },
  mounted() {
    // this.category1Id = 2;
    // this.category2Id = 13;
    // this.category3Id = 61;
    // this.getAttrs();
  },
  methods: {
    //
    async removeList(id) {
      const result = await this.$API.attr.remove(id);
      if (result.code === 200) {
        // 提示成功
        this.$message.success("删除属性成功");

        this.getAttrs();
      } else {
        // 失败
        this.$message.error("删除属性失败");
      }
    },
    // 添加或更新属性
    async save() {
      // 准备数据
      const { attr } = this;
      attr.attrValueList = attr.attrValueList.filter(attrValue => {
        if (attrValue.valueName) {
          // 删除edit属性
          delete attrValue.edit;
          return true;
        } else {
          return false;
        }
      });
      // 如果attr.attrValueList是空数组就不发请求
      if (attr.attrValueList.length === 0) {
        this.$message.warning("至少指定一个属性值名称");
        return;
      }
      // 发添加或更新的请求
      const result = await this.$API.attr.save(attr);
      // 成功
      if (result.code === 200) {
        // 提示成功
        this.$message.success("保存属性成功");
        // 跳转属性列表页面
        this.isShowList = true;
        // 更新列表数据显示
        this.getAttrs();
      } else {
        // 失败
        this.$message.error("保存属性失败");
      }
    },
    // 属性名称从编辑变成查看
    toList(attrValue) {
      // 没有输入内容直接跳出
      if (attrValue.valueName.trim() === "") return;
      // 若输入内容已存在，提示
      const isRepeat =
        this.attr.attrValueList.filter(item => item.valueName === attrValue)
          .length === 2;
      if (isRepeat) {
        this.$message.warning("内容已存在");
        // 清除输入
        attrValue.valueName = "";
        return;
      }
      // 更新edit
      attrValue.edit = false;
    },
    // 属性名称从查看变成编辑
    toEdit(attrValue, index) {
      if (attrValue.hasOwnProperty("edit")) {
        attrValue.edit = true;
      } else {
        this.$set(attrValue, "edit", true);
      }
      // 让当前对应的input对象自动获取焦点
      this.$nextTick(() => {
        this.$refs[index].focus(); //显示输入框后执行
      });
    },

    // 添加一个新平台属性值
    addAttrValue() {
      // 创建一个平台属性值对象
      const attrValue = {
        attrId: this.attr.id, //当前要修改属性的id
        valueName: "", //属性值名称
        edit: true //标识为编辑模式
      };

      // 添加到对应数组
      this.attr.attrValueList.push(attrValue);

      // 让最后一个输入框获得焦点
      this.$nextTick(() =>
        this.$refs[this.attr.attrValueList.length - 1].focus()
      );
    },
    // 显示添加界面
    showAdd() {
      // 重置数据
      this.attr = {
        attrName: "", //属性名
        attrValueList: [], //属性值列表
        categoryId: this.category3Id, //三级分类ID
        categoryLevel: 3 //分类级别
      };
      // 显示界面
      this.isShowList = false;
    },
    // 显示修改页面
    showUpdate(attr) {
      // 更新attr的值
      // this.attr = attr;
      // this.attr = { ...attr };//浅拷贝
      this.attr = cloneDeep(attr); // 对列表项的attr进行深克隆并指定给修改界面的attr
      // 显示更新页面
      this.isShowList = false;
    },
    // 接收分类ID发生改变的数据
    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        // 重置二级与三级分类的数据
        this.category2Id = null;
        this.category3Id = null;
        this.attrs = []; //重置属性列表
        this.category1Id = categoryId;
      } else if (level === 2) {
        // 重置三级分类的数据
        this.category3Id = null;
        this.attrs = []; //重置属性列表
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        // 只有当选择了三级的分类ID, 才去请求获取属性列表

        this.getAttrs();
      }
    },
    // 获取属性列表
    async getAttrs() {
      const { category1Id, category2Id, category3Id } = this;
      this.loading = true;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      this.loading = false;
      this.attrs = result.data;
    }
  }
};
</script>
