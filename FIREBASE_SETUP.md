# Firebase 在线对局设置

## 1. 创建项目

进入 Firebase Console，创建一个项目，然后添加一个 Web App。

## 2. 开启 Realtime Database

在 Build -> Realtime Database 里创建数据库。测试阶段可以先用测试模式，正式发布前再收紧规则。

## 3. 填写配置

把 Firebase 给你的配置填进 `online-config.js`：

```js
window.GOMOKU_FIREBASE_CONFIG = {
  apiKey: "你的 apiKey",
  authDomain: "你的项目.firebaseapp.com",
  databaseURL: "https://你的项目-default-rtdb.firebaseio.com",
  projectId: "你的项目 id",
  appId: "你的 appId"
};
```

## 4. 测试用数据库规则

只给你们俩测试时，可以先用：

```json
{
  "rules": {
    "rooms": {
      "$room": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

这套规则方便测试，但不适合长期公开使用。准备正式上架前，建议加匿名登录和更严格的房间校验。
