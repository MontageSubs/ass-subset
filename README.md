# ASS Subsetter

**Subtitle Drawing Optimization · Font Embedding Management**

> Optimize ASS/SSA subtitles in your browser — subset and embed fonts with all processing happening locally.

<div align="right">

**[中文](./README.zh-hans.md) | English**

</div><br/>

<div align="center">

| [Open Tool](https://subs.js.org/ass-subset/) | [Report an Issue](https://github.com/MontageSubs/ass-subset/issues) | [Join the Discussion](https://github.com/MontageSubs/ass-subset/discussions) |
| :---: | :---: | :---: |

</div><br/>

## Overview

**ASS Subsetter** is an open-source browser tool developed by MontageSubs for optimizing ASS/SSA subtitle files through draw command subsetting and font embedding.

The ASS/SSA format supports embedding fonts directly, so users don't need to install additional fonts separately. However, complete font files are often several megabytes, significantly bloating subtitle size after encoding. This tool optimizes through **font subsetting** and **draw command optimization**:

- Retain only the glyphs actually used in subtitles, compressing font size
- Fully preserve font name table entries for correct player recognition
- Extract vector draw commands into fonts, reducing redundant code

**Cross-platform, completely local processing** — runs in any browser, all files processed locally, works offline.

## Features

**Drawing Command Subsetting**

Extracts `\p1`…`\p0` vector drawings into an embedded font. Identical shapes are stored once and all duplicates are replaced, reducing file size and improving compatibility on low-performance devices. Supports intelligent add/delete operations.

**Third-Party Font Embedding**

Scans and embeds non-system fonts used in subtitles. Choose between subsetting (retain only used characters) or full embedding. Fully preserves font name table for correct player recognition.

**System Font Embedding**

Subsets and embeds system fonts to ensure consistent rendering across platforms without requiring manual font installation.

**Remove Embedded Fonts**

Removes existing embedded fonts while preserving optimized drawing fonts.

---

### Advanced Options

**Include ASCII Characters** — Retain all ASCII characters from the original font in the subset, improving media player compatibility.

**Embed Full Fonts** — Embed complete fonts without reprocessing, though resulting in larger file sizes.

**Supported Formats** — TTF, OTF, TTC, OTC, WOFF, WOFF2 (variable fonts not supported)

## Usage

1. Open [https://subs.js.org/ass-subset/](https://subs.js.org/ass-subset/)
2. Upload `.ass`, `.ssa` files or ZIP archives, supporting folder drag-and-drop and batch processing
3. Review the analysis results showing detected drawing commands and external fonts
4. (Optional) Upload font files (TTF / OTF / TTC / OTC / WOFF / WOFF2), or auto-load system fonts in Chromium browsers
5. Choose whether to add the `_optimized` suffix
6. Click "Start Conversion" and download the optimized subtitle file

> **Note:** Converting draw commands may cause minor position or scale shifts. Always verify the final render.

## Dependencies

| Dependency | Version | License | Purpose |
|------------|---------|---------|---------|
| [opentype.js](https://github.com/opentypejs/opentype.js) | 1.3.4 | MIT | Font parsing and construction |
| [JSZip](https://github.com/Stuk/jszip) | 3.10.1 | MIT / Dual licensed | Batch output packaging |

The above dependencies are included as local copies in the `vendor/` directory of this repository and are licensed under MIT.

opentype.js is used for font file parsing and binary construction. JSZip is used to package batch processing results into a .zip file for download after subtitle files have been processed through the subsetting queue.


## Repository Structure

```
ass-subset/
├── app/                           # Tool
│   ├── index.html                 # Tool main file
│   ├── worker.js                  # Web Worker (main processing logic)
│   ├── sw.js                      # Service Worker (caching strategy)
│   ├── manifests/                 # PWA manifests (10 languages)
│   ├── sitemap.xml                # Sitemap for search engines
│   ├── vendor/                    # Third-party dependencies
│   │   ├── opentype.min.js        # Local copy of opentype.js
│   │   └── jszip.min.js           # Local copy of JSZip
│   └── icons/                     # App icons
├── LICENSE
├── README.md                      # Chinese documentation
└── README.en.md                   # English documentation (this file)
```

## Localization

This tool fully supports **English and Chinese**, with additional support for Spanish, Portuguese, Russian, Japanese, Korean, Arabic, and Turkish.

If you find translation errors or want to help improve other languages, please open an issue or discussion [here](https://github.com/MontageSubs/ass-subset/issues) or [here](https://github.com/MontageSubs/ass-subset/discussions). Community contributions are welcome!

## Contributing

We welcome all kinds of contributions! Including:

- **Development** — New features, bug fixes, performance improvements
- **Documentation** — Improve README, usage guides, tutorials
- **Localization** — Translation improvements, language support expansion
- **Feedback** — Bug reports, feature requests, user experience suggestions
- **Promotion** — Share with friends, spread on social media, write usage articles

Join us in [Issues](https://github.com/MontageSubs/ass-subset/issues) and [Discussions](https://github.com/MontageSubs/ass-subset/discussions)!

### Contributors

<details>
<summary><strong>Core Team</strong></summary>

- **Meow P** (@mtsubs) — Lead Developer, Frontend Design, Backend Development

</details>

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

**MontageSubs (蒙太奇字幕组)**  
"Powered by Love ❤️ 用爱发电"

</div>
