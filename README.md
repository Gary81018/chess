# 筠筠的五子棋

一个可以直接上传到 GitHub Pages 的纯前端五子棋小游戏，支持本地对战、陪玩模式和可配置的在线房间对局。

## 功能

- 双人对弈
- 陪玩模式：白棋由电脑自动落子
- 在线房间：创建房间码，两个人实时对局
- 胜负判断、比分记录、悔棋、重开、交换先手
- 手机和电脑屏幕自适应

## 在线对局配置

1. 创建一个 Firebase 项目。
2. 开启 Realtime Database。
3. 把 Web App 配置填入 `online-config.js`。
4. 发布后创建房间，把房间码发给对方即可。

## 上传到 GitHub Pages

1. 把这个文件夹里的所有文件上传到一个 GitHub 仓库。
2. 进入仓库的 Settings -> Pages。
3. Source 选择 Deploy from a branch。
4. Branch 选择 main，目录选择 /root。
5. 保存后等一会儿，GitHub 会给你一个网页链接。
