# ASS 在线子集化工具
**ASS Subset Tool · MontageSubs**

<br/>

> **在浏览器中完成 ASS/SSA 字幕的绘图指令子集化与字体嵌入，无需安装任何软件。**
>
> *All processing runs locally in your browser. No files are ever uploaded to a server.*

<div align="right">

**中文 | [English](./README.en.md)**

</div><br/>

<div align="center">

| [打开工具](https://subs.js.org/ass-subset/) | [提交反馈](https://github.com/MontageSubs/ass-subset/issues) | [参与讨论](https://github.com/MontageSubs/ass-subset/discussions) |
| :---: | :---: | :---: |

</div><br/>

## 简介

ASS 在线子集化工具是由蒙太奇字幕组 (MontageSubs) 开发的开源浏览器端工具，用于优化 Advanced SubStation Alpha (.ass) 与 SubStation Alpha (.ssa) 字幕文件。

ASS/SSA 字幕格式支持将字体文件直接嵌入字幕，无需用户单独安装字体即可正常渲染特效。然而，完整字体动辄数 MB，编码后会使字幕体积大幅膨胀。本工具通过子集化技术，仅保留字幕中实际使用的字形，将嵌入字体压缩至最小体积，同时完整保留所有字体名称引用，确保播放器正确识别。

所有处理均在本地浏览器中完成，文件不离开用户设备。

## 功能

**绘图指令子集化**

将字幕中的 `\p1`…`\p0` 矢量绘图数据提取为独立的内嵌 TTF 字体。相同的绘图形状只存储一次，替换全部重复引用，显著减小文件体积，并提升低性能设备（如 Android TV 机顶盒）的渲染兼容性。

**字体子集嵌入**

扫描字幕文件中引用的非系统字体，将上传的字体文件子集化后以 UUEncoding 标准嵌入字幕。仅保留字幕中实际出现的字符，并完整保留字体名称表，确保各播放器正常识别。支持 TTF、OTF、TTC 格式。

## 使用方法

本工具完全基于浏览器运行，无需安装：

1. 打开 [https://subs.js.org/ass-subset/](https://subs.js.org/ass-subset/)
2. 上传 `.ass` 或 `.ssa` 字幕文件
3. 查看分析结果，确认检测到的绘图指令与外部字体
4. 如需嵌入字体，上传对应的字体文件（TTF / OTF / TTC）
5. 点击"开始转换"，下载优化后的字幕文件

转换后的文件名格式为 `原文件名_optimized.ass`。

> **注意：** 绘图指令转换后，特效的大小或位置可能发生轻微偏移，建议手动检查最终效果。

## 技术依赖

| 依赖 | 版本 | 许可证 | 用途 |
|------|------|--------|------|
| [opentype.js](https://github.com/opentypejs/opentype.js) | 1.3.4 | MIT | 字体解析与构建 |
| [JSZip](https://github.com/Stuk/jszip) | 3.10.1 | MIT / 双许可证 | 批处理输出打包 |

上述依赖以副本形式托管于本仓库 `vendor/` 目录下，保留其原始版权声明，符合各自许可证要求。

opentype.js 用于字体文件的解析与二进制构建；JSZip 用于在批处理上传或多个字幕文件队列子集化完成后，将处理结果打包生成 .zip 文件供用户下载。


## 仓库结构

```
ass-subset/
├── index.html              # 工具主体（单文件，包含全部逻辑）
├── worker.js               # Web Worker（主要处理逻辑）
├── manifest.json           # PWA 配置 (中文)
├── manifest-en.json        # PWA 配置 (英文)
├── sw.js                   # Service Worker (缓存策略)
├── sitemap.xml             # 搜索引擎站点地图
├── vendor/
│   ├── opentype.min.js     # opentype.js 本地副本
│   └── jszip.min.js        # JSZip 本地副本
├── LICENSE
├── README.md               # 中文说明（本文件）
└── README.en.md            # 英文说明
```

## 本地化

本工具目前仅提供**中文和英文**界面。如果你希望使用其他语言版本或有意愿参与本地化贡献，欢迎在 [Issues](https://github.com/MontageSubs/ass-subset/issues) 或 [Discussions](https://github.com/MontageSubs/ass-subset/discussions) 中提出需求。我们正在规划添加更多语言支持，欢迎社区贡献。

## 参与贡献

欢迎任何形式的贡献，包括但不限于：

- 在 [Issues](https://github.com/MontageSubs/ass-subset/issues) 中提交 Bug 报告或功能请求
- 在 [Discussions](https://github.com/MontageSubs/ass-subset/discussions) 中分享使用经验或技术讨论
- 提交 Pull Request 改进代码或文档

## 许可证

本项目源代码遵循 [MIT License](./LICENSE) 授权。

---

<div align="center">

**蒙太奇字幕组 (MontageSubs)**  
"用爱发电 ❤️ Powered by Love"

</div>
