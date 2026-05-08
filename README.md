# 球友竞猜 - 2026 世界杯竞猜小程序

基于微信小程序 + 云开发，将世界杯预测从「个人行为」升级为「好友/群组社交体验」。

## 功能模块

| 模块 | 功能 |
|------|------|
| 用户系统 | 微信一键登录、个人战绩 |
| 冠军预测 | 48支球队选冠军，正确+200分 |
| 单场竞猜 | 胜平负+比分预测，积分结算 |
| 好友社交 | 好友预测对比、积分排行榜 |
| 群组竞猜 | 创建/加入竞猜群、群看板、群排行榜 |

## 积分规则

| 预测类型 | 条件 | 积分 |
|----------|------|------|
| 冠军预测 | 预测球队夺冠 | +200 |
| 胜平负正确 | 结果一致 | +10 |
| 比分完全正确 | 主客队进球完全一致 | +30 |
| 比分差一球 | 胜平负正确+进球差≤1 | +5额外 |

## 项目结构

```
worldcup/
├── miniprogram/              # 小程序前端
│   ├── pages/
│   │   ├── index/            # 首页
│   │   ├── matches/          # 赛事列表
│   │   ├── match-detail/     # 单场竞猜
│   │   ├── champion/         # 冠军预测
│   │   ├── friends/          # 好友排行榜
│   │   ├── group/            # 群组竞猜
│   │   └── profile/          # 个人主页
│   ├── components/
│   │   └── match-card/       # 比赛卡片组件
│   └── utils/
│       ├── teams.js          # 48支球队数据
│       ├── util.js           # 工具函数
│       └── api.js            # 云函数调用封装
└── cloudfunctions/           # 云函数后端
    ├── login/                # 用户登录
    ├── getMatches/           # 获取赛程
    ├── submitPrediction/     # 提交预测
    ├── getPredictions/       # 查询预测数据
    ├── getLeaderboard/       # 排行榜
    ├── settleMatch/          # 比赛结算
    ├── createGroup/          # 创建/加入群组
    └── syncMatchData/        # 同步第三方赛事数据
```

## 部署步骤

### 1. 配置小程序
- 在 `project.config.json` 中填入你的 AppID
- 在微信开发者工具中开通云开发，获取 EnvID
- 在 `miniprogram/app.js` 中将 `YOUR_ENV_ID` 替换为实际 EnvID

### 2. 创建数据库集合
在云开发控制台创建以下集合：
- `users` - 用户数据（权限：所有用户可读，仅创建者可写）
- `matches` - 比赛数据（权限：所有用户可读，仅管理员可写）
- `predictions` - 预测数据（权限：仅创建者可读写）
- `predictionGroups` - 竞猜群（权限：所有用户可读，仅创建者可写）

### 3. 部署云函数
在微信开发者工具中，右键每个云函数目录 → 上传并部署

### 4. 配置赛事数据同步
- 注册 [API-Football](https://www.api-football.com/) 获取 API Key
- 在云开发控制台为 `syncMatchData` 配置环境变量 `API_FOOTBALL_KEY`
- 配置定时触发器：每小时同步一次

### 5. Tab 图标
在 `miniprogram/images/` 目录下放入以下图标文件（建议 81×81px PNG）：
- `tab-home.png` / `tab-home-active.png`
- `tab-match.png` / `tab-match-active.png`
- `tab-friends.png` / `tab-friends-active.png`
- `tab-group.png` / `tab-group-active.png`
- `tab-profile.png` / `tab-profile-active.png`

## 技术栈

- **前端**：微信原生小程序（WXML + WXSS + JS）
- **后端**：微信云开发（CloudBase）
- **数据库**：云开发 CloudDB（MongoDB-like）
- **赛事数据**：API-Football / SportRadar
- **实时推送**：微信订阅消息
