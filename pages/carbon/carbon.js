Page({
        data: {
          userPoints: 666, // 用户碳积分
          rankList: [
            { name: "团子", points: 666 },
            { name: "张三", points: 559 },
            { name: "相野", points: 523 },
            { name: "朱开", points: 449 },
            { name: "东东", points: 324 },
            { name: "马梅", points: 211 },
          ], // 排行榜数据
          sources: [
            { icon: "/assets/得分.png", description: "西南交通大学-春熙路", points: -15 },
            { icon: "/assets/得分.png", description: "西南交通大学-文化宫", points: -10 },
            { icon: "/assets/得分.png", description: "西南交通大学-东大路", points: -10 },
            { icon: "/assets/得分.png", description: "西南交通大学-玉双路", points: -20 },
          ], // 积分来源数据
          actions: [
            {
              icon: "/assets/得分.png",
              title: "步行",
              description: "每日步行可获得碳积分，健康又环保。",
            },
            {
              icon: "/assets/得分.png",
              title: "绿色出行",
              description: "使用公共交通或骑行减少碳排放。",
            },
            {
              icon: "/assets/得分.png",
              title: "植树",
              description: "参加植树活动，助力环境保护。",
            },
          ], // 获取积分的提示数据
        },
    onShow() {
        // 每次页面显示时读取最新积分
        wx.getStorage({
          key: 'carbonPoints',
          success: (res) => {
            this.setData({ userPoints: res.data });
          },
          fail: () => {
            // 初始化默认值
            wx.setStorage({ key: 'carbonPoints', data: 666 });
            this.setData({ userPoints: 666 });
          }
        });
      },

    onLoad() {
        // 监听来自预约页面的事件
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on('updatePoints', (data) => {
          this.setData({
            userPoints: this.data.userPoints - 20 // 每次减20分
          });
        });
      }
    
      });
      