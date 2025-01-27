const QQMapWX = require("../../../utils/qqmap-wx-jssdk.js"); // 引入腾讯地图 SDK

Page({
  data: {
    qqmapsdk: null, // 腾讯地图 SDK 实例
    longitude: 104.065837, // 成都天府广场的经度
    latitude: 30.657362, // 成都天府广场的纬度
    startLocation: "", // 起点名称
    endLocation: "", // 终点名称
    startLng: 0,
    startLat: 0,
    endLng: 0,
    endLat: 0,
    markers: [], // 存储地图标记
    polyline: [], // 存储路线数据
  },

  onLoad() {
    const qqmapsdk = new QQMapWX({
      key: "JJNBZ-EE76B-QG5UL-NJAHM-SXVDK-LDBXH",
    });
    this.setData({ qqmapsdk });
    console.log("腾讯地图 SDK 初始化成功", this.data.qqmapsdk);
  },
  //   onShow: function () {
  //     // 调用接口
  //     this.data.qqmapsdk.search({
  //       keyword: "酒店",
  //       success: function (res) {
  //         console.log(res);
  //         console.log("search成功了一下？");
  //       },
  //       fail: function (res) {
  //         console.log(res);
  //       },
  //       complete: function (res) {
  //         console.log(res);
  //         console.log("search完成了一下？");
  //       },
  //     });
  //   },

  // 监听输入框输入
  onStartInput(e) {
    this.setData({ startLocation: e.detail.value });
  },
  onEndInput(e) {
    this.setData({ endLocation: e.detail.value });
  },

  // 搜索起点
  searchStart() {
    console.log("腾讯地图 SDK 是", this.data.qqmapsdk);
    console.log(this.data.startLocation);
    this.data.qqmapsdk.search({
      keyword: this.data.startLocation,
      success: (res) => {
        console.log(res);
        if (res.data.length > 0) {
          const location = res.data[0].location;
          this.setData({
            startLat: location.lat,
            startLng: location.lng,
            markers: [
              {
                id: 1,
                latitude: location.lat,
                longitude: location.lng,
                title: "出发地点",
                iconPath: "../../../assets/得分.png",
                width: 30,
                height: 30,
              },
              ...this.data.markers.filter((m) => m.id !== 1),
            ],
          });
        } else {
          wx.showToast({ title: "未找到该起点地址", icon: "none" });
        }
      },
      fail: () => {
        wx.showToast({ title: "起点搜索失败", icon: "none" });
        console.log(res);
      },
    });
  },

  searchEnd() {
    console.log(this.data.endLocation);
    this.data.qqmapsdk.search({
      keyword: this.data.endLocation,
      success: (res) => {
        console.log(res);
        if (res.data.length > 0) {
          const location = res.data[0].location;
          this.setData({
            endLat: location.lat,
            endLng: location.lng,
            markers: [
              {
                id: 2,
                latitude: location.lat,
                longitude: location.lng,
                title: "终点",
                iconPath: "../../../assets/得分.png",
                width: 30,
                height: 30,
              },
              ...this.data.markers.filter((m) => m.id !== 2),
            ],
          });
        } else {
          wx.showToast({ title: "未找到该终点地址", icon: "none" });
        }
      },
      fail: () => {
        wx.showToast({ title: "终点搜索失败", icon: "none" });
      },
    });
  },

  // 获取路线规划
  getRoute() {
    if (!this.data.startLat || !this.data.endLat) {
      wx.showToast({ title: "请先输入有效的起点和终点", icon: "none" });
      return;
    }

    console.log("起点经纬度:", this.data.startLat, this.data.startLng);
    console.log("终点经纬度:", this.data.endLat, this.data.endLng);

    wx.request({
      url: `https://apis.map.qq.com/ws/direction/v1/driving/?from=${this.data.startLat},${this.data.startLng}&to=${this.data.endLat},${this.data.endLng}&key=JJNBZ-EE76B-QG5UL-NJAHM-SXVDK-LDBXH`,
      success: (res) => {
        console.log(res);
        if (res.data.status === 0) {
          const route = res.data.result.routes[0];

          const decodedPolyline = decodePolyline(route.polyline);
          console.log("解压后的 polyline 数据:", decodedPolyline);

          this.setData({
            polyline: [
              {
                points: decodedPolyline, // 解压后的坐标数据
                color: "#FF0000DD", // 红色路径线
                width: 6, // 路径线宽度
                dottedLine: true, // 虚线样式
              },
            ],
          });

          wx.showToast({ title: "路线规划成功", icon: "success" });
        } else {
          wx.showToast({ title: "获取路线失败，请检查地址", icon: "none" });
        }
      },
      fail: () => {
        wx.showToast({ title: "网络错误", icon: "none" });
      },
    });
  },
});

// 解压 polyline
function decodePolyline(polyline) {
  for (var i = 2; i < polyline.length; i++) {
    polyline[i] = polyline[i - 2] + polyline[i] / 1000000;
  }
  let coords = [];
  for (let i = 0; i < polyline.length; i += 2) {
    coords.push({
      latitude: polyline[i], // 纬度
      longitude: polyline[i + 1], // 经度
    });
  }
  return coords;
}
