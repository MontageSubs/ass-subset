# ASS Subset Tool v2.0

基于浏览器端原生实现的 ASS/SSA 字幕优化工具，由 MontageSubs (蒙太奇字幕组) 打造。由于所有计算（字体匹配、子集处理、包内封装等）完全由设备的浏览器与 Web Worker 运算驱动，文件能够实现 100% 不离开终端用户设备的“纯本地处理”，保障您的字幕文件安全私密。

## 核心特性
- **全平台支持**: Windows, macOS, Linux, 以及任何现代浏览器
- **图形指令去冗余**: 将繁杂冗长的 ASSDraw 指令提取并转换为字符（打包进独立字体中），大幅减小字幕文件体积，显著提升播放器解析性能。
- **字体级内嵌**: 精确拆解每一行 ASS 中的各个字符与样式（如 bold 粗体字重感知），将全套原始外挂字体重新剪裁后直接嵌入到字幕文件（UUEncode）。
- **完全本地化**: 所需所有执行库均打包到本地，无需挂载外部 CDN。

## 第三方库引用声明 (Third-party Libraries / Vendor)
此工具使用或内嵌了以下优秀的开源代码库，所有的第三方库实体文已存放于 `vendor/` 目录下，以便于进行无缝的本地无网络离线操作。

**1. opentype.js**
- **Project URL**: [opentype.js](https://github.com/opentypejs/opentype.js)
- **License**: MIT License
- **Purpose**: 用于工具核心中对所上传的 TTF/OTF 文件进行二进制头解析、表级解析以及字符寻址、字形重新剪裁子集打包（Subset）与图形的字体封装等关键任务。

**2. JSZip**
- **Project URL**: [JSZip](https://github.com/Stuk/jszip)
- **License**: MIT License / Dual licensed
- **Purpose**: 当使用批处理上传或多个字幕文件队列子集化工作完成后，用于打包生成一个完整的 `.zip` 输出供最终下载。

感谢这些开源库的维护者提供的强力支持！
