// pages/book/book.js
Page({
    bookHandel: function(event) {
        // 获取自定义属性
        const tag = event.currentTarget.dataset.tag;
        // 根据 tag 值进行跳转
        switch (tag) {
          case 'normalBook':
            wx.navigateTo({
              url: '/pages/book/mapBook/mapBook', // 替换为你的目标页面路径
            });
            break;
          case 'fastBook':
            wx.navigateTo({
              url: '/pages/book/fastBook/fastBook', // 替换为快速预约页面路径
            });
            break;
          case 'bookRecord':
            wx.navigateTo({
              url: '/pages/book/bookRecord/bookRecord', // 替换为预约记录页面路径
            });
            break;
          case 'bookRule':
            wx.navigateTo({
              url: '/pages/book/bookRule/bookRule', // 替换为预约规则页面路径
            });
            break;
          default:
            console.error('未知的跳转标签:', tag);
        }
      },
    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})