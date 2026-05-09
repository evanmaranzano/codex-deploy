# MolSpark Desktop

MolSpark Desktop 是一个基于 Tauri + React + Rust 的 Windows 桌面应用原型，当前已经实现：

- 本地设置与 Windows Credential Manager API key 存储
- Gemini 文本聊天
- Gemini 图片生成
- 音视频字幕提取与 SRT 导出
- 最小 SQLite 聊天历史

## 本地开发

前端开发：

```powershell
cd F:\molispark\desktop
npm install
npm run dev
```

前端验证：

```powershell
cd F:\molispark\desktop
npm test -- --runInBand
npm run build
```

## Rust / Tauri

Rust crate 位于 `desktop/src-tauri/`。

如果本机具备 Rust / Tauri 工具链，可以尝试：

```powershell
cd F:\molispark\desktop
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri build
```

当前项目打包目标已配置为 Windows `nsis` 安装包。

## 当前实现范围

- 聊天：通过 Rust command 调用 Gemini Developer API
- 生图：通过 Rust command 调用 Gemini Developer API
- 字幕：通过 Gemini Files API 上传文件，轮询文件状态，生成 JSON 字幕片段并导出 UTF-8 SRT
- 历史：最小默认会话聊天消息 SQLite 存储与读取

## 说明

- API key 只保留在 Rust / 凭据存储层，不会传回前端
- 默认导出目录和请求超时来自应用设置
- 当前环境若缺少 `cargo` 或 Tauri 工具链，则无法在这里完成 Rust tests 或真实打包验证
