# ASS Subset Tool v2.0

A browser-native tool for optimizing ASS/SSA subtitles, developed by MontageSubs. Because all computations (font matching, sub-setting, package encapsulation, etc.) are entirely driven by the user's browser and Web Workers, files never leave the local environment, ensuring 100% "pure local processing" and keeping your subtitle files secure and private.

## Core Features
- **Cross-Platform Support**: Works on Windows, macOS, Linux, and any modern web browser.
- **Drawing Instruction Optimization**: Extracts lengthy and complex ASSDraw instructions and converts them into standard characters (packaged into a standalone font). This significantly reduces the subtitle file size and greatly improves player parsing performance.
- **Font-Level Subsetting**: PrecisELY parses exactly which characters and styles (e.g., bold weight detection) are present within each line of the ASS file, trims the original font files to ONLY include these used characters, and embeds the customized lightweight subset directly into the subtitle file (via UUEncode).
- **Fully Localized**: All required execution libraries are bundled locally without needing external network CDN requests.

## Third-party Libraries / Vendor
This tool uses or bundles the following excellent open-source libraries. All associated third-party library files are stored locally in the `vendor/` directory to facilitate seamless, no-network offline operations.

**1. opentype.js**
- **Project URL**: [opentype.js](https://github.com/opentypejs/opentype.js)
- **License**: MIT License
- **Purpose**: Used within the tool's core to perform binary header parsing, TrueType/OpenType table parsing, glyph indexing, character path extraction, and geometric repacking when sub-setting uploaded TTF/OTF fonts or encapsulating ASSDraw commands.

**2. JSZip**
- **Project URL**: [JSZip](https://github.com/Stuk/jszip)
- **License**: MIT License / Dual licensed
- **Purpose**: Used for encapsulating and securely packing all outputs into a single `.zip` file for download when users engage the batch processing feature with multiple subtitle queues.

A huge thank you to the maintainers of these open-source libraries for their powerful support!
