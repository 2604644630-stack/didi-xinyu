# 部署指南：Cloudflare Pages + 自定义域名（路线 A）

目标：把「迪迪的心屿」部署到 Cloudflare Pages（免费），并绑定一个 .com 域名，不备案，国内可访问、可被搜索引擎收录。

## 第一步：购买域名（需要你本人操作，约 5 分钟）

### 推荐：Cloudflare Registrar（成本价，无加价）

1. 打开 https://dash.cloudflare.com 注册账号；
2. 左侧「Domain Registration」→「Register Domain」；
3. 搜索并购买你想要的 `.com` 域名（个人建议短一点、好记，例如 `didi-island.com`、`xinyu-ai.com` 等，先查有没有被注册）；
4. 付款（支持信用卡/PayPal）；
5. 完成注册后，该域名自动托管在 Cloudflare，不用再改 DNS。

### 备选：阿里云 / GoDaddy 等注册商购买

- 买完后把域名的 **NameServer 改成 Cloudflare 分配的两个**（Cloudflare 添加站点后会给出，例如 `xxx.ns.cloudflare.com`），DNS 生效约几分钟到几小时；
- 也可以不改 NS，后面在 Pages 绑定域名时按提示添加 CNAME 记录。

> 购买 .com 不需要国内备案；.cn 虽然便宜，但国内实名要求更严格，路线 A 建议用 .com。

## 第二步：登录 Cloudflare CLI（由 Codex 接手部署）

在电脑终端运行一次（会打开浏览器授权）：

```bash
npx wrangler login
```

登录成功后告诉我，我会继续执行：

```bash
# 创建 Pages 项目（第一次）
npx wrangler pages project create didi-xinyu

# 上传站点文件（当前目录即网站根目录）
npx wrangler pages deploy . --project-name didi-xinyu

# 绑定自定义域名（需要你的 Cloudflare 账号里有该域名的 Zone）
npx wrangler pages domain add didi-xinyu 你的域名.com
```

也可以不用 CLI：在 Cloudflare 后台 Dashboard → Workers & Pages → 选择项目 → Custom domains → Add custom domain，粘贴你的域名即可。

## 第三步：部署后

- 免费临时网址：`https://didi-xinyu.pages.dev`（部署完立即可访问）；
- 自定义域名：`https://你的域名.com`；
- 我会同步更新 `robots.txt` 与 `sitemap.xml` 里的正式网址，并提交到 GitHub。

## 第四步：搜索引擎收录

1. **Google**：https://search.google.com/search-console → 网址前缀 → 填 `https://你的域名.com` → 验证 → 提交 `https://你的域名.com/sitemap.xml`；
2. **百度**：https://ziyuan.baidu.com → 添加站点 → 验证 → 提交同一份 sitemap；
3. 收录需要时间（Google 几天，百度可能 1-4 周），提交后耐心等待即可。

## 常见问题

- **需要备案吗？** 不需要。域名托管在 Cloudflare、网站托管在 Cloudflare Pages（境外），不解析到境内服务器，无需 ICP 备案。
- **国内访问稳定吗？** 比 GitHub Pages 稳定得多；高峰期仍可能有波动，日常使用没问题。若以后要求更高，可再升级路线 B（国内云+备案）。
- **要不要改代码？** 不用，本站全部使用相对路径，换域名/托管零改动。
