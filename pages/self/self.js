// login.js
Page({
    data: {
      userInfo: null
    },
    
    onGetUserInfo(e) {
      const userInfo = e.detail.userInfo;  // 获取用户信息
      if (userInfo) {
        this.setData({ userInfo });
        this.login();  // 调用登录函数
      }
    },
  
    login() {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 调用后端接口，传递登录凭证code
            wx.request({
              url: 'https://your-backend-api.com/login',  // 替换为你自己的后端API
              method: 'POST',
              data: {
                code: res.code
              },
              success: (response) => {
                if (response.data.success) {
                  // 登录成功后，将用户信息保存在本地或服务器
                  wx.setStorageSync('token', response.data.token);
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                } else {
                  wx.showToast({
                    title: '登录失败',
                    icon: 'error'
                  });
                }
              },
              fail: (err) => {
                console.error("请求失败: ", err);
              }
            });
          } else {
            console.error("登录失败！" + res.errMsg);
          }
        }
      });
    }
  });
  