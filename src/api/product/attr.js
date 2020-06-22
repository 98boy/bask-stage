// 包含平台属性相关接口
/* 
  查找一级分类列表
  */
import request from "@/utils/request";
export default {
  getCategorys1() {
    return request({
      url: "/admin/product/getCategory1",
      method: "get"
    });
  },

  /* 
    查找二级分类列表
    */
  getCategorys2(category1Id) {
    return request({
      url: "/admin/product/getCategory2/" + category1Id,
      method: "get"
    });
  },

  /* 
    查找三级分类列表
    */
  getCategorys3(category2Id) {
    return request({
      url: "/admin/product/getCategory3/" + category2Id,
      method: "get"
    });
  },
  // 获取指定分类下的属性列表
  getList(category1Id, category2Id, category3Id) {
    return request.get(
      `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`
    );
  },
  //   获取指定属性ID的所有属性值列表
  getValueList(attrId) {
    return request.get(`/admin/product/getAttrValueList/${attrId}`);
  },
  //     添加和更新属性
  save(attrInfo) {
    return request.post("/admin/product/saveAttrInfo", attrInfo);
  },
  //     删除指定id的属性
  remove(id) {
    return request.delete(`/admin/product/deleteAttr/${id}`);
  }
};
