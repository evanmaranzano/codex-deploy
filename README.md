# AI Dev Installer

一个基于 [Tauri 2](https://v2.tauri.app/) 的 Windows 桌面应用，用于一键准备 Codex 所需的基础开发环境。

## 它会帮你做什么

`AI Dev Installer` 会检查并安装以下组件：

| 组件 | 版本 | 说明 |
|------|------|------|
| **Git** | 2.54.0 | 代码版本管理工具，Codex 依赖它来管理代码 |
| **Python** | 3.12.10 | 编程语言运行环境，许多 AI 工具依赖 Python |
| **Node.js** | 24.15.0 | JavaScript 运行环境，Codex 的运行依赖它 |
| **CC Switch** | 3.14.1 | 网络代理工具，用于访问海外 AI 服务 |
| **Codex** | 最新 | OpenAI 推出的 AI 编程助手（通过 winget 安装） |

如果系统已检测到某个组件，应用会自动跳过，不会重复安装。

## 快速开始

### 下载安装

1. 从 Releases 下载 `AI Dev Installer_0.1.0_x64-setup.exe`
2. 双击运行安装包，按向导提示完成安装
3. 安装完成后 `AI Dev Installer` 会自动打开

### 使用

1. 打开 `AI Dev Installer`
2. 点击 **重新检测环境**，检查已安装的组件
3. 点击 **全部安装**，一键安装所有缺失组件
4. 等待安装完成，确认 `Codex` 显示为 `已安装`

> 详细安装教程请参考 [安装说明](docs/ai-dev-installer-安装说明.md)

## 系统要求

- Windows 10/11（64 位）
- 管理员权限（静默安装系统组件需要）
- 网络连接（Codex 安装依赖 winget）

## 项目结构

```
desktop/
├── src/                          # React 前端
│   ├── App.tsx                   # 应用入口
│   ├── pages/InstallerPage.tsx   # 安装器主页面
│   ├── components/               # UI 组件
│   └── lib/                      # 前端工具库与类型定义
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── commands/             # Tauri 命令（前端调用入口）
│   │   ├── services/             # 业务逻辑
│   │   │   ├── installer/        # 安装器核心：环境检测、执行器、日志
│   │   │   ├── gemini/           # Gemini API 客户端
│   │   │   ├── chat.rs           # 聊天服务
│   │   │   └── settings.rs       # 设置管理
│   │   ├── models/               # 数据模型
│   │   └── storage/              # SQLite 存储
│   ├── resources/third_party/    # 内置第三方安装包（不随 Git 分发）
│   ├── tauri.conf.json           # Tauri 配置
│   └── Cargo.toml                # Rust 依赖
├── docs/                         # 文档与截图
└── package.json                  # 前端依赖
```

## 技术栈

- **前端**：React 18 + TypeScript + Vite
- **后端**：Rust + Tauri 2
- **数据库**：SQLite（rusqlite）
- **密钥管理**：Windows Credential Manager（keyring）
- **打包**：NSIS 安装器

## 从源码构建

### 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) >= 1.70
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建安装包

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/nsis/`。

> **注意**：内置的第三方安装包（Git、Python、Node.js、CC Switch）需要单独获取并放置到 `src-tauri/resources/third_party/` 对应目录下，然后更新 `manifest.json` 中的 SHA256 校验值。

### 运行测试

```bash
npm run test
```

## License

MIT
