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

**ASS Subsetter** is an open-source browser tool developed by MontageSubs for managing font embedding and draw commands in ASS/SSA subtitle files.

The ASS/SSA format allows subtitle creators to use custom fonts to enhance visual effects, but installing fonts across different platforms is not easy. This tool implements font embedding directly in the browser, without requiring additional specialized software, and works across all platforms. It also supports **font subsetting**, retaining only the characters actually used in subtitles to further reduce file size. Additionally, it can convert repeated draw commands into fonts to maximize compression.

## Key Features

**Direct Processing in Browser** — All file processing is done locally, supports offline use, and fully respects user privacy. No need for additional software.

**Preview and Download** — Preview optimization results directly after processing and compare before/after. Download optimized subtitles and embedded fonts for local use.

**Accessibility Standards Compliant** — Full support for keyboard navigation and screen readers, meeting WCAG and international accessibility design requirements.

**Thoughtfully Designed Interface** — Original design aesthetic, modern frontend with beautiful and intuitive usability.

## Features

**Drawing Command Subsetting**

> Extracts `\p1`…`\p0` vector drawings into an embedded font. Identical shapes are stored once and all duplicates are replaced, reducing file size and improving compatibility on low-performance devices. Supports intelligent add/delete operations.

**Third-Party Font Embedding**

> Scans and embeds non-system fonts used in subtitles. Choose between subsetting (retain only used characters) or full embedding. Fully preserves font name table for correct player recognition.

**System Font Embedding**

> Subsets and embeds system fonts to ensure consistent rendering across platforms without requiring manual font installation.

**Remove Embedded Fonts**

> Removes existing embedded fonts while preserving optimized drawing fonts.

### Advanced Options

**Include ASCII Characters** — Retain all ASCII characters from the original font in the subset, improving media player compatibility.

**Embed Full Fonts** — Embed complete fonts without reprocessing, though resulting in larger file sizes.

**Supported Formats** — TTF, OTF, TTC, OTC, WOFF, WOFF2 (variable fonts not supported)

## Usage

1. Open [https://subs.js.org/ass-subset/](https://subs.js.org/ass-subset/)
2. Upload `.ass`, `.ssa` files or ZIP archives, supporting folder drag-and-drop and batch processing
3. Review the analysis results showing detected drawing commands and external fonts
4. (Optional) Upload font files (TTF / OTF / TTC / OTC / WOFF / WOFF2), or auto-load system fonts in Chromium browsers
5. Click "Start Conversion" and download the optimized subtitle file

> **Note:** Converting draw commands may cause minor position or scale shifts. Always verify the final render.

## Dependencies

| Dependency | Version | License | Purpose |
|------------|---------|---------|---------|
| [opentype.js](https://github.com/opentypejs/opentype.js) | 1.3.4 | MIT | Font parsing and construction |
| [JSZip](https://github.com/Stuk/jszip) | 3.10.1 | MIT / Dual licensed | ZIP file handling and packaging |

The above dependencies are included as local copies in the `app/vendor/` directory of this repository and are licensed under MIT.

opentype.js is used for font file parsing and binary construction. JSZip is used to parse uploaded ZIP archives and package processing results.

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
├── README.md                      # English documentation (this file)
└── README.zh-hans.md              # Chinese documentation
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

- **Meow P** ([@mtsubs](https://github.com/mtsubs/)) — Lead Developer, Frontend Design, Backend Development

</details>

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

**MontageSubs (蒙太奇字幕组)**  
"Powered by Love ❤️ 用爱发电"

</div>
