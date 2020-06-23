// spu相关接口
import request from "@/utils/request";
export default {
  // 销售属性列表
  getSaleAttrList() {
    return request.get("/admin/product/baseSaleAttrList");
  },
  // 删除指定的SPU
  remove(spuId) {
    return request.delete(`/admin/product/deleteSpu/${spuId}`);
  },
  // 根据ID获取spu信息  yige spu的详细信息
  get(spuId) {
    return request.get(`/admin/product/getSpuById/${spuId}`);
  },
  // 保存spu详情信息
  save(spuInfo) {
    return request.post(
      `/admin/product/${spuInfo.id ? "update" : "save"}SpuInfo`,
      spuInfo
    );
  },
  // 获取指定分类的SPU分页列表
  getList(page, limit, category3Id) {
    return request.get(`/admin/product/${page}/${limit}`, {
      params: { category3Id }
    });
  }
};
