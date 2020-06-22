<template>
  <a href="javascrip:" :title="title">
    <el-button v-bind="$attrs" v-on="$listeners" />
  </a>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    title: String
  },

  mounted() {
    //它是包含所有父组件传入的标签属性(排除props声明, class与style的属性)的对象
    // console.log("mounted()", this.$attrs);
    // $listeners是包含所有父组件传入的自定义事件监听名与对应回调函数的对象
    // console.log("mounted()", this.$listeners);
  }
};
</script>