// index.js
Page({
    goToBooking:function(){
        console.log('按钮点击事件触发了');
        wx.navigateTo({
          url: '/pages/book/mapBook/mapBook',
        })
    }
})
