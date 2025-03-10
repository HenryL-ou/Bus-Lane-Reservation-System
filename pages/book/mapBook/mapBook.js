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
    busLanes: [], // 将从后端获取的公交专用道数据存储在这里
    showReservationModal: false,
    selectedBusLane: null,
    selectedDate: '',
    selectedTimeSlot: '',
    timeSlots: [
        '07:00-07:30',
        '07:30-08:00',
        '08:00-08:30',
        '08:30-09:00',
        '09:00-09:30',
        '17:00-17:30',
        '17:30-18:00',
        '18:00-18:30',
        '18:30-19:00',
        '19:00-19:30'
    ],
    userPoints:666,
    requiredPoints:20,
    availableSlots:192
  },

  onLoad() {
    const qqmapsdk = new QQMapWX({
      key: "JJNBZ-EE76B-QG5UL-NJAHM-SXVDK-LDBXH",
    });
    this.setData({ qqmapsdk });
    console.log("腾讯地图 SDK 初始化成功", this.data.qqmapsdk);
    
    // 获取公交专用道数据
    this.fetchBusLanes();
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
    this.searchStart();
  },
  onEndInput(e) {
    this.setData({ endLocation: e.detail.value });
    this.searchEnd();
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
    // this.searchStart();
    // this.searchEnd();

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

          // 将路线分段，标注公交专用道
          const routeSegments = this.splitRouteForBusLanes(decodedPolyline);

          this.setData({
            // polyline: [
            //   {
            //     points: decodedPolyline, // 解压后的坐标数据
            //     color: "#228B22", // 绿路径线
            //     width: 4, // 路径线宽度
            //     dottedLine: false, // 实线样式
            //     borderColor: "#006400", // 深绿边框
            //     borderWidth: 2, // 边框宽度
            //   },
            // ],
            polyline: routeSegments
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

  // 添加新函数：分割路线，标注公交专用道
  splitRouteForBusLanes(coordinates) {
    const segments = [];
    let currentSegment = {
      points: [],
      color: "#228B22",
      width: 4,
      dottedLine: false,
      borderColor: "#006400",
      borderWidth: 2
    };

    coordinates.forEach((coord, index) => {
      // 检查当前坐标是否在任何公交专用道范围内
      const isInBusLane = this.checkIfInBusLane(coord);
      
      if (isInBusLane) {
        // 如果是新的公交专用道段，创建新的线段
        if (currentSegment.color !== "#FF4500") {
          if (currentSegment.points.length > 0) {
            segments.push({...currentSegment});
          }
          currentSegment = {
            points: [coord],
            color: "#FF4500", // 公交专用道使用醒目的橙红色
            width: 5,
            dottedLine: false,
            borderColor: "#FF0000",
            borderWidth: 2
          };
        } else {
          currentSegment.points.push(coord);
        }
      } else {
        // 如果是普通道路段
        if (currentSegment.color !== "#228B22") {
          if (currentSegment.points.length > 0) {
            segments.push({...currentSegment});
          }
          currentSegment = {
            points: [coord],
            color: "#228B22",
            width: 4,
            dottedLine: false,
            borderColor: "#006400",
            borderWidth: 2
          };
        } else {
          currentSegment.points.push(coord);
        }
      }
    });

    // 添加最后一段
    if (currentSegment.points.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  },

  // 添加新函数：检查坐标是否在公交专用道范围内
  checkIfInBusLane(coord) {
    return this.data.busLanes.some(lane => {
      // 简单的范围检查，实际应用中可能需要更复杂的算法
      const isLatInRange = coord.latitude >= Math.min(lane.start.latitude, lane.end.latitude) &&
                          coord.latitude <= Math.max(lane.start.latitude, lane.end.latitude);
      const isLngInRange = coord.longitude >= Math.min(lane.start.longitude, lane.end.longitude) &&
                          coord.longitude <= Math.max(lane.start.longitude, lane.end.longitude);
      return isLatInRange && isLngInRange;
    });
  },

  // 添加新函数：从后端获取公交专用道数据
  fetchBusLanes() {
    // 模拟从后端获取数据
    const mockBusLanes = {
        busLanes: [
            {
                id: "1",
                name: "天府大道公交专用道",
                start: {
                    latitude: 30.657362,
                    longitude: 104.065837
                },
                end: {
                    latitude: 30.658362,
                    longitude: 104.066837
                },
                availableTimeStart: "07:00",
                availableTimeEnd: "09:00",
                status: "available"
            },
            {
                id: "2",
                name: "人民南路公交专用道",
                start: {
                    latitude: 30.647362,
                    longitude: 104.075837
                },
                end: {
                    latitude: 30.648362,
                    longitude: 104.076837
                },
                availableTimeStart: "17:00",
                availableTimeEnd: "19:00",
                status: "available"
            },
            {

              id: "3",

              name: "二环路公交专用道",

              start: {

                  latitude: 30.642362,

                  longitude: 104.062837

              },

              end: {

                  latitude: 30.672362,

                  longitude: 104.082837

              },

              availableTimeStart: "07:00",

              availableTimeEnd: "19:00",

              status: "available"

          }
        ]
    };

    // 直接使用模拟数据
    this.setData({
        busLanes: mockBusLanes.busLanes
    });

    // 当后端API准备好后，可以替换为以下代码：
    /*
    wx.request({
        url: 'YOUR_BACKEND_API/bus-lanes',
        method: 'GET',
        success: (res) => {
            if (res.statusCode === 200) {
                this.setData({
                    busLanes: res.data.busLanes
                });
            } else {
                console.error('获取公交专用道数据失败:', res);
                wx.showToast({
                    title: '获取公交专用道信息失败',
                    icon: 'none'
                });
            }
        },
        fail: (err) => {
            console.error('请求公交专用道数据失败:', err);
            wx.showToast({
                title: '网络错误',
                icon: 'none'
            });
        }
    });
    */
  },

  // 添加地图点击事件处理函数
  onMapTap(e) {
    const { latitude, longitude } = e.detail;
    
    // 检查点击位置是否在公交专用道上
    const clickedLane = this.findClickedBusLane({ latitude, longitude });
    
    if (clickedLane) {
        this.setData({
            showReservationModal: true,
            selectedBusLane: clickedLane,
            selectedDate: this.getFormattedDate(new Date()) // 默认选择今天
        });
    }
  },

  // 添加查找被点击的公交专用道函数
  findClickedBusLane(coord) {
    return this.data.busLanes.find(lane => {
        const isLatInRange = coord.latitude >= Math.min(lane.start.latitude, lane.end.latitude) &&
                            coord.latitude <= Math.max(lane.start.latitude, lane.end.latitude);
        const isLngInRange = coord.longitude >= Math.min(lane.start.longitude, lane.end.longitude) &&
                            coord.longitude <= Math.max(lane.start.longitude, lane.end.longitude);
        return isLatInRange && isLngInRange;
    });
  },

  // 添加日期格式化函数
  getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 添加弹窗相关函数
  onDateChange(e) {
    this.setData({
        selectedDate: e.detail.value
    });
  },

  onTimeSlotChange(e) {
    this.setData({
        selectedTimeSlot: this.data.timeSlots[e.detail.value]
    });
  },

  onConfirmReservation() {
    if (!this.data.selectedTimeSlot) {
        wx.showToast({
            title: '请选择时间段',
            icon: 'none'
        });
        return;
    }

    // 这里添加预约逻辑
    console.log('预约信息：', {
        busLane: this.data.selectedBusLane,
        date: this.data.selectedDate,
        timeSlot: this.data.selectedTimeSlot
    });

    // 模拟预约成功
    wx.showToast({
        title: '预约成功',
        icon: 'success',
        success: () => {
          // 从缓存读取当前积分并更新
          wx.getStorage({
            key: 'carbonPoints',
            success: (res) => {
              const newPoints = res.data - 20;
              wx.setStorage({
                key: 'carbonPoints',
                data: newPoints
              });
            },
            fail: () => {
              // 首次使用初始化
              wx.setStorage({
                key: 'carbonPoints',
                data: 666 - 20 // 初始值666，扣减20
              });
            }
          });
    
          this.closeModal();
        }
      });
    },

  closeModal() {
    this.setData({
        showReservationModal: false,
        selectedTimeSlot: ''
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
