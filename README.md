# 迪迪的心屿 · 你的情绪岛屿

一个纯前端、移动优先的心理疗愈网站，实现《心里健康治疗网站》文档中「从工具到伙伴」的核心理念——不是给用户一把伞，而是陪用户一起看雨，记住他喜欢的伞，并在天晴时轻轻告诉他。

> 网站提供自我调节与陪伴，**不能替代专业医疗**。所有数据只保存在用户本机浏览器，不上传任何服务器。

## 五大模块

| 底部 Tab | 模块 | 核心能力 |
| --- | --- | --- |
| 🌱 此刻 | 情绪感知站 | 情绪打卡 + 强度 + 情绪光谱（近 7/30 天）+ PHQ-9 抑郁自评与趋势 |
| 🧘 着陆 | 自适应安抚舱 | 紧急程度 1-10 驱动模式：完整 5-4-3-2-1 / 快速 3-2-1 / 全屏呼吸；含身体扫描、三听一触、快速呼吸、4-7-8 呼吸工具箱 |
| 📝 心镜 | 多模态日记本 | 心情、强度、关键词、写作提示、今天的一件小事、想对自己说的话 + 专业绘画板（多画笔/形状/印章/撤销重做） |
| 🌊 共感 | 匿名互助花园 | 一句话匿名留言 + 真实本地计数聚类 + 拍拍支持 + 举报收起 + 高风险内容拦截 |
| 📖 岛屿 | 资源与微光 | 今日微光（17 句点击翻句 + 专属互动动画）、情绪花园、发财接星星、安心小岛、思维记录、安全计划、自愈小站、危机热线 |

## 技术要点

- 全部数据存于浏览器 `localStorage`，无后端依赖
- Canvas 绘制情绪轨迹、涂鸦、星空粒子、互动小游戏
- 状态机管理着陆流程与全屏呼吸引导（含可选 Web Audio 引导音）
- 手机优先布局，底部 Tab / 桌面左侧玻璃导航自动切换
- 文件名带版本号（如 `style-v66.css`），用于缓存刷新

## 运行方式

直接用浏览器打开 `index.html` 即可；推荐本地静态服务：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 部署到 GitHub Pages（免费托管）

1. 把本仓库推送到 GitHub（默认分支 `main`）；
2. 仓库 Settings → Pages → Source 选择 `Deploy from a branch` → `main` / root；
3. 等待几分钟，访问 `https://<你的用户名>.github.io/<仓库名>/`；
4. 在 Google Search Console 与百度站长平台提交该网址，等待收录（`robots.txt` 与 `sitemap.xml` 已准备，部署后请把其中的 `USERNAME` / `REPO` 替换为实际值）。

## 致谢与开源说明

本项目借鉴了以下开源项目，感谢每一位作者的付出：

### 代码与素材借鉴

- **[Mineradio](https://github.com/XxHuberrr/Mineradio)**（GPL-3.0）
  启动页入场动画、电影镜头质感与沉浸式视觉语言；本项目对其中部分代码做了适配。**因此本项目整体采用 GPL-3.0 许可证。**
- **[Awesome-Love-Code](https://github.com/sun0225SUN/Awesome-Love-Code)**（MIT）
  进入页面后的 030 星域粒子文字、地面场景动画，以及背景音乐《Unconditionally - Broken Elegance》（标注 No Copyright Music）。

### 设计灵感（仅借鉴思路，未使用其代码）

- [MoodGarden](https://github.com/Sudhir-web20/MoodGarden) — 情绪花园：打卡种花、花园随情绪生长
- [Flaque/quirk](https://github.com/Flaque/quirk) — CBT 思维记录
- [Project-Code-Regulate/regulate](https://github.com/Project-Code-Regulate/regulate) — 呼吸/着陆/重构练习
- [corvuslatimer/ravensim](https://github.com/corvuslatimer/ravensim) — 慢速滑翔收集光点的小游戏
- [weboreel8-CozyCorners](https://github.com/bhuvi-d/weboreel8-CozyCorners) — 整理式放松互动
- [evseevfedor/breathing-practice-478](https://github.com/evseevfedor/breathing-practice-478) — 4-7-8 呼吸引导
- [ifmeorg/ifme](https://github.com/ifmeorg/ifme) — 向信任的人分享情绪

## 安全与隐私说明

- 页面内置全国心理援助热线（12356，24 小时）、希望24热线（400-161-9995）等求助入口，支持一键拨打；
- 私人紧急联系人默认隐藏号码，需输入密码解锁（软锁，用于防旁人查看）；
- 共感墙会对涉及自伤/自杀的高风险内容自动拦截并引导求助；
- 所有记录只存本机，可随时导出或删除。

> 如果你正处于危机中，请立即拨打 12356 或 120，或前往最近医院的急诊。
