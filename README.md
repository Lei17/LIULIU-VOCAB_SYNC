# 66背词看板 - TOEFL 矩阵记忆系统

一款面向 TOEFL 考生的桌面端词汇记忆看板应用。采用 11x6 词矩阵视图（每页 66 词），搭配赛博朋克风格 UI，支持 6 套主题切换、TTS 发音、键盘导航、统计仪表盘等功能，帮助考生高效记忆单词。

---

## 功能特性

- **11x6 词矩阵视图** — 每页展示 66 个单词，一目了然，支持 List 分页浏览
- **Hover 释义浮窗** — 鼠标悬停显示单词详情（单词 / 音标 / 词性 / 中文释义）
- **点击 TTS 发音** — 左键点击单词即可朗读发音
- **右键状态标记** — 三种状态循环切换：未标记 → 熟悉 → 不熟悉
- **键盘导航** — 方向键移动焦点，Enter 发音，Space 标记状态
- **词库导入** — 支持 CSV / TSV / JSON 格式，内置 9000 词 TOEFL 词库
- **统计仪表盘** — 掌握率、学习进度、状态分布可视化
- **系统设置** — 可调节音色、语速、矩阵密度、字号等参数
- **6 套 UI 主题** — 赛博朋克 / 毛玻璃 / 极简黑白 / 清新柔和 / 护眼纸质 / 雨天玻璃
- **本地 SQLite 持久化** — 所有学习数据保存在本地，无需联网
- **学习数据导出** — 支持 CSV 格式导出学习报告

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | [Electron](https://www.electronjs.org/) 22.3.27 |
| 构建工具 | [Vite](https://vitejs.dev/) 6.x |
| 前端 | 原生 HTML / CSS / JavaScript（无框架） |
| 数据库 | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) 12.x（客户端 SQLite） |
| 打包工具 | [electron-builder](https://www.electron.build/) 26.x |

---

## 项目结构

```
toefl-matrix-66/
├── electron/                # Electron 主进程
│   ├── main.js              # 主进程入口、窗口管理、IPC 通信、SQLite 初始化
│   └── preload.js           # 预加载脚本，暴露安全 API 给渲染进程
├── src/                     # 前端源码
│   ├── index.html           # 页面结构与 DOM 模板
│   ├── styles.css           # 全局样式（含 6 套主题 CSS 变量 + 特效）
│   ├── main.js              # 应用主逻辑、事件绑定、设置管理
│   ├── matrix.js            # 11x6 词矩阵渲染与交互
│   ├── tooltip.js           # 单词释义浮窗组件
│   ├── audio.js             # TTS 发音模块
│   ├── keyboard.js          # 键盘导航与快捷键处理
│   ├── importer.js          # 词库文件导入解析（CSV/TSV/JSON）
│   ├── stats.js             # 统计仪表盘（图表与数据展示）
│   ├── storage.js           # 本地 JSON 存储（设置、学习状态）
│   └── data/
│       ├── toefl-words.json # 9000 词 TOEFL 词库（含音标）
│       └── weixin_support.png
├── vite.config.js           # Vite 构建配置 + 资源复制插件
├── manual-pack.js           # 手动 Electron 打包脚本
├── fix-electron.js          # Electron 兼容性修复脚本
├── gen-words.js             # 词库生成工具
├── generate-dict.js         # 词典生成工具
├── phonetic-dict.js         # 音标词典数据
├── pack.js                  # 简易打包脚本
└── package.json             # 项目配置与依赖声明
```

---

## 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Windows** 10/11（当前仅测试 Windows 平台）

### 安装依赖

```bash
cd toefl-matrix-66
npm install
```

> 安装时会自动执行 `electron-rebuild` 编译 better-sqlite3 原生模块。如编译失败，请确保已安装 [windows-build-tools](https://github.com/nicedoc/windows-build-tools) 或 Visual Studio Build Tools。

### 开发模式

**纯前端开发**（浏览器预览，无 Electron）：

```bash
npm run dev
```

**Electron 完整开发**（构建 + 启动桌面应用）：

```bash
npm run electron:dev
```

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 打包为桌面应用

```bash
node manual-pack.js
```

打包后的可执行文件位于 `packaged/66Matrix-win32-x64/` 目录。

---

## 主题系统

应用内置 6 套精心设计的 UI 主题，可在设置面板中一键切换：

| 主题 | 风格 | 特点 |
|------|------|------|
| **赛博朋克** | 深色 + 霓虹发光 | 默认主题，扫描线动效，科技感强烈 |
| **毛玻璃沉浸** | 半透明 + 模糊 | 适合搭配高清壁纸背景，卡片毛玻璃效果 |
| **极简黑白** | 白底黑字 | 无装饰无动画，高信息密度，专注内容 |
| **清新柔和** | 低饱和粉蓝紫 | 圆润设计，柔和阴影，轻松愉悦 |
| **护眼纸质** | 暖黄底 + 纸质纹理 | 衬线字体，模拟纸质书阅读体验，长时间不疲劳 |
| **雨天玻璃** | 深蓝灰 + 静态水珠 | 模拟雨天窗户，右上角柔和阳光，舒适沉静 |

主题通过 CSS 变量系统实现，切换时仅修改 `<html>` 的 `data-theme` 属性，主题偏好自动保存。

---

## 使用说明

### 词库导入

1. 点击右上角 **导入** 按钮
2. 选择词库文件（支持 CSV / TSV / JSON 格式）
3. 应用内置 9000 词 TOEFL 词库，首次启动自动导入

### 矩阵操作

| 操作 | 效果 |
|------|------|
| 鼠标悬停单词 | 显示释义浮窗（单词/音标/词性/释义） |
| 左键点击单词 | TTS 朗读发音 |
| 右键点击单词 | 切换状态标记（未标记 → 熟悉 → 不熟悉） |
| 滚轮 / 底部分页 | 切换词库页码 |

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| 方向键 (上下左右) | 在矩阵中移动焦点 |
| Enter | 朗读当前焦点单词 |
| Space | 切换当前单词状态标记 |

### 设置面板

点击 **设置** 按钮可调整：
- TTS 音色选择与语速
- 矩阵显示密度
- 单词字号大小
- UI 主题切换
- 数据导出与重置

---

## 数据存储

- **设置与学习状态**：存储在本地 JSON 文件中
- **词库数据**：存储在 SQLite 数据库 `wordlists.db`
- **数据路径**：`C:\Users\<用户名>\AppData\Roaming\toefl-matrix-66\`

---

## 打赏支持

蟹蟹您的打赏！您的支持是我们前进的动力。

<p align="center">
  <img src="toefl-matrix-66/src/data/weixin_support.png" alt="微信打赏二维码" width="240">
</p>

有好建议反馈 联系邮箱: jeremyleisure@qq.com

---

## 许可证

MIT License
