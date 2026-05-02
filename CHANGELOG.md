# Changelog | 更新日志

## v3.0

<details>
<summary><strong>中文版</strong></summary>

- **设计大改：完整切换到 Liquid Glass 视觉系统的第三 twin variant「Aurora」**：与已有的 svg-to-ass（暖奶油，蓝主色）、ass-to-svg（冷青绿，绿主色）共用同一套 Liquid Glass 词汇与组件原语，但**色温独立**——淡紫雾底色（`#F1ECF5`）+ 紫罗兰主色（`#7C3AED`），引入新的 `--violet` 词汇作为身份印记。三个工具并排时一眼可分：蓝/绿/紫
- **多色径向渐变背景**：紫TL → 粉TR → 黄BR → 天空BL → 绿中心，与另两个工具的 glow 排布形成第三种轮换
- **Glass cards + pill buttons**：所有 step、option row、modal、log box 改用半透明卡片 + `backdrop-filter: blur(24px) saturate(180%)`；按钮改为胶囊型（`border-radius: 999px`），主按钮使用紫→紫深渐变 + 内发光阴影
- **字体升级**：Inter（UI）+ JetBrains Mono（代码），从系统字栈切换为 web fonts，包含 weight 400–800
- **新增 brand-mark 徽章**：header 加 "AS" 紫→粉渐变圆形徽章，强化品牌识别
- **4 步流程的色彩轮换**：4 个 step head 分别使用 violet / pink / sky / green 渐变背景；step-num 圆形徽标使用对应主色渐变
- **新增 Light/Dark 主题切换按钮**：header 加月亮/太阳图标按钮，**永远跟随系统**（首次访问 + 实时跟随系统主题切换），点击按钮**仅当前 session 临时覆盖**，刷新后回到跟随系统。理由：用户系统是 dark mode 通常意味着当下就想看 dark；网页强行记住一次手动选择反而违背用户当前意图
- **评论区主题与页面同步**：giscus 评论框现在跟随页面当前主题（之前总是直接读系统 `prefers-color-scheme`）；浏览过程中切换主题，已加载的评论框也会通过 `postMessage` 实时跟随
- **新增：7 个选项 checkbox 持久化**：`Subset Draw Commands` / `Embed Third-Party Fonts` / `Embed System Fonts` / `Include ASCII Characters` / `Generate Separate Fonts by Weight` / `Embed Full Fonts` / `Randomize Font Names` 现在保存到 `localStorage`，刷新页面后保持不变
- **进度条改为渐变胶囊**：紫→粉横向渐变 + 发光阴影
- **Modal 玻璃化**：背景 + box 都改为模糊磨砂玻璃，关闭按钮改为圆形 pill 样式

</details>

<details>
<summary><strong>English</strong></summary>

- **Design overhaul: full switch to the Liquid Glass system's third twin variant "Aurora"**: shares the Liquid Glass vocabulary and component primitives with svg-to-ass (warm cream, blue primary) and ass-to-svg (cool sage-green, green primary), but with an **independent color temperature** — pale lavender mist canvas (`#F1ECF5`) + violet primary (`#7C3AED`), introducing a new `--violet` token as the identity marker. Open all three tools side by side and you can tell them apart at a glance: blue / green / violet
- **Multi-color radial gradient background**: violet TL → pink TR → yellow BR → sky BL → green center — a third rotation distinct from the existing two siblings
- **Glass cards + pill buttons**: every step, option row, modal, and log box now uses translucent cards + `backdrop-filter: blur(24px) saturate(180%)`; buttons are pill-shaped (`border-radius: 999px`), primary buttons use a violet → deep-violet gradient with inner-glow shadows
- **Typography upgrade**: Inter (UI) + JetBrains Mono (code), switched from system font stacks to web fonts, weights 400–800
- **New brand-mark badge**: header gains an "AS" violet → pink gradient circular badge for brand recognition
- **4-step color rotation**: each of the 4 step heads uses a distinct gradient (violet / pink / sky / green); step number badges use matching primary gradients
- **New Light/Dark theme toggle button**: sun/moon button in the header — **always follows system theme** (initial load + tracks live system theme switches), clicking the button is a **session-only override** that resets on reload. Rationale: a user with system dark mode usually wants to see dark **right now**; forcibly remembering a one-time manual choice across sessions undermines current intent
- **Comments theme synced with page**: the giscus comment widget now matches the page's current theme (previously read `prefers-color-scheme` directly, mismatching whenever the user manually overrode the page theme); already-loaded comment widgets also follow via `postMessage` when the user toggles theme mid-session
- **New: 7 option checkboxes persisted**: `Subset Draw Commands` / `Embed Third-Party Fonts` / `Embed System Fonts` / `Include ASCII Characters` / `Generate Separate Fonts by Weight` / `Embed Full Fonts` / `Randomize Font Names` are now saved to `localStorage` and survive page reloads
- **Progress bar redesigned**: violet → pink horizontal gradient with glow shadow, pill-shaped
- **Modal glassified**: backdrop and box both use frosted glass; close button is now a circular pill

</details>
