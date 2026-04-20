# ASS 子集化工具

**字幕绘图优化 · 字体嵌入管理**

> 在浏览器中完成 ASS/SSA 字幕的绘图指令优化与字体嵌入，所有处理均在本地进行。

<div align="right">

**中文 | [English](./README.md)**

</div><br/>

<div align="center">

| [打开工具](https://subs.js.org/ass-subset/) | [提交反馈](https://github.com/MontageSubs/ass-subset/issues) | [参与讨论](https://github.com/MontageSubs/ass-subset/discussions) |
| :---: | :---: | :---: |

</div><br/>

## 简介

**ASS Subsetter** 是蒙太奇字幕组开发的开源浏览器工具，用于优化 ASS/SSA 字幕文件中的绘图指令与字体嵌入。

ASS/SSA 格式支持直接嵌入字体文件，用户无需额外安装字体即可渲染特效。。但完整字体通常数 MB，嵌入后会大幅增加字幕体积。本工具通过**字体子集化**与**绘图指令优化**：

- 仅保留字幕中实际使用的字形，压缩字体体积
- 完整保留字体名称信息，确保播放器正确识别
- 提取矢量绘图指令到字体中，减少冗余代码

**跨平台、完全本地处理** — 有浏览器就能用，所有文件处理在本地进行，支持离线使用。

## 功能

**绘图指令子集化**

将字幕中的 `\p1`…`\p0` 矢量绘图提取为内嵌字体。相同形状只存储一次，替换全部重复引用，显著减小文件体积并提升低性能设备渲染兼容性。支持智能增删操作。

**第三方字体嵌入**

扫描并嵌入字幕中使用的非系统字体。可选子集化（仅保留使用字符）或完整嵌入。完整保留字体名称表，确保播放器正确识别。

**系统字体嵌入**

将系统字体子集化后嵌入，保证跨平台渲染一致性，无需用户手动安装。

**移除嵌入字体**

删除字幕中现有的嵌入字体，同时保留优化后的绘图字体。

### 高级选项

**保留 ASCII 字符** — 在子集中保留原字体的所有 ASCII 字符，提升媒体播放器兼容性。

**完整字体嵌入** — 嵌入完整字体无需重新处理，但文件体积更大。

**支持格式** — TTF、OTF、TTC、OTC、WOFF、WOFF2（暂不支持可变字体）

## 使用方法

1. 打开 [https://subs.js.org/ass-subset/](https://subs.js.org/ass-subset/)
2. 上传 `.ass`、`.ssa` 文件或 ZIP 压缩包，支持文件夹拖拽和批量处理
3. 查看分析结果，确认检测到的绘图指令与外部字体
4. （可选）上传字体文件（TTF / OTF / TTC / OTC / WOFF / WOFF2），或在 Chromium 浏览器中自动加载系统字体
5. 选择是否添加 `_optimized` 后缀
6. 点击"开始转换"，下载优化后的字幕文件

> **注意：** 绘图指令转换后，特效的大小或位置可能发生轻微偏移，建议手动检查最终效果。

## 技术依赖

| 依赖 | 版本 | 许可证 | 用途 |
|------|------|--------|------|
| [opentype.js](https://github.com/opentypejs/opentype.js) | 1.3.4 | MIT | 字体解析与构建 |
| [JSZip](https://github.com/Stuk/jszip) | 3.10.1 | MIT / 双许可证 | 批处理输出打包 |

上述依赖作为本地副本存放在本仓库 `/app/vendor/` 目录中，均采用 MIT 许可。

opentype.js 用于字体文件的解析与二进制构建；JSZip 用于在批处理上传或多个字幕文件队列子集化完成后，将处理结果打包生成 .zip 文件供用户下载。


## 仓库结构

```
ass-subset/
├── app/                           # 工具主体
│   ├── index.html                 # 工具主文件
│   ├── worker.js                  # Web Worker（主要处理逻辑）
│   ├── sw.js                      # Service Worker（缓存策略）
│   ├── manifests/                 # PWA 配置（10 种语言）
│   ├── sitemap.xml                # 搜索引擎站点地图
│   ├── vendor/                    # 第三方依赖
│   │   ├── opentype.min.js        # opentype.js 本地副本
│   │   └── jszip.min.js           # JSZip 本地副本
│   └── icons/                     # 应用图标
├── LICENSE
├── README.md                      # 中文说明（本文件）
└── README.en.md                   # 英文说明
```

## 本地化

本工具完整支持**中文和英文**，并支持西班牙语、葡萄牙语、俄语、日语、韩语、阿拉伯语、土耳其语等多种语言。

如果发现翻译错误或想帮助改进其他语言，欢迎在 [Issues](https://github.com/MontageSubs/ass-subset/issues) 或 [Discussions](https://github.com/MontageSubs/ass-subset/discussions) 中提出建议。我们欢迎社区贡献！

## 参与贡献

欢迎任何形式的贡献，包括但不限于：

- **功能开发** — 新功能实现、bug 修复、性能优化
- **文档完善** — 改进 README、补充使用指南、编写教程
- **国际化** — 翻译改进、语言支持扩展
- **反馈建议** — 提交 bug 报告、功能建议、用户体验反馈
- **推广分享** — 向朋友推荐、分享到社交媒体、撰写使用心得

欢迎在 [Issues](https://github.com/MontageSubs/ass-subset/issues) 和 [Discussions](https://github.com/MontageSubs/ass-subset/discussions) 中参与讨论。加入我们吧！

### 贡献者

<details>
<summary><strong>核心团队</strong></summary>

- **Meow P** ([@mtsubs](https://github.com/mtsubs)) — 项目首席开发者，前端样式设计，后端逻辑开发

</details>

## 许可证

本项目源代码遵循 [MIT License](./LICENSE) 授权。

---

<div align="center">

**蒙太奇字幕组 (MontageSubs)**  
"用爱发电 ❤️ Powered by Love"

</div>
