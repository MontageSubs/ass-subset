# ASS Online Subsetter
**Powered by Love ❤️ MontageSubs**

<br/>

> **Subset and embed fonts in ASS/SSA subtitles, entirely in your browser — all processing happens locally.**
>
> *Draw Command Subsetting · Font Subset Embedding*

<div align="right">

**[中文](./README.md) | English**

</div><br/>

<div align="center">

| [Open Tool](https://subs.js.org/ass-subset/) | [Report an Issue](https://github.com/MontageSubs/ass-subset/issues) | [Join the Discussion](https://github.com/MontageSubs/ass-subset/discussions) |
| :---: | :---: | :---: |

</div><br/>

## Overview

The ASS Subset Tool is an open-source, browser-based utility developed by MontageSubs (蒙太奇字幕组) for optimizing Advanced SubStation Alpha (.ass) and SubStation Alpha (.ssa) subtitle files.

The ASS/SSA format natively supports embedding font files directly into subtitle files, eliminating the need for end users to install fonts manually. However, complete font files can be several megabytes in size, causing significant file size bloat after UUEncoding. This tool applies font subsetting — retaining only the glyphs actually used in the subtitle — to minimize the embedded font size, while fully preserving all font name table entries to ensure correct recognition by media players.

All processing is performed locally in the user's browser. No file data is transmitted to any server.

## Features

**Drawing Command Subsetting**

Extracts `\p1`…`\p0` vector drawing data from subtitle dialogue lines and converts it into a compact embedded TTF font. Identical drawing shapes are stored only once and all duplicate references are replaced, substantially reducing file size and improving rendering compatibility on lower-performance devices such as Android TV set-top boxes.

**Font Subsetting and Embedding**

Scans the subtitle file for non-system font references, subsets the uploaded font files to include only the characters present in the subtitle, and embeds them using the UUEncoding standard. The full font Name Table is preserved to ensure correct playback across all major media players. Supports TTF, OTF, and TTC formats.

## Usage

This tool runs entirely in the browser. No installation is needed:

1. Open [https://subs.js.org/ass-subset/](https://subs.js.org/ass-subset/)
2. Upload `.ass` or `.ssa` files, with batch processing and ZIP support
3. Review the analysis results, which show detected drawing commands and external font references
4. If font embedding is needed, upload the corresponding font files (TTF / OTF / TTC)
5. Click `Run Subsetter` and download the optimized subtitle file

The output file will be named `original_filename_optimized.ass`.

> **Note:** converting draw commands may cause minor position or scale shifts. Always verify the final render.

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
│   ├── manifest.json              # PWA manifest (Chinese)
│   ├── manifest-en.json           # PWA manifest (English)
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

This tool fully supports **Chinese and English**, with partial support for Japanese, Korean, and Spanish. If you need another language or want to help with localization, please open an issue or discussion [here](https://github.com/MontageSubs/ass-subset/issues) or [here](https://github.com/MontageSubs/ass-subset/discussions). We're actively expanding language support and welcome community contributions.

## Contributing

Contributions of all kinds are welcome:

- Submit bug reports or feature requests via [Issues](https://github.com/MontageSubs/ass-subset/issues)
- Share usage tips or engage in technical discussion via [Discussions](https://github.com/MontageSubs/ass-subset/discussions)
- Submit a Pull Request to improve code or documentation

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

**MontageSubs (蒙太奇字幕组)**  
"Powered by Love ❤️ 用爱发电"

</div>
