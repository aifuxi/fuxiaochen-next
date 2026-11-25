# 静态站点发布与回滚

GitHub Actions 在默认分支手动触发 **发布静态站点**。构建通过代码检查、Vitest 和 Playwright 后，发布任务下载同一次运行的 `dist/`，用 SSH 上传。服务器先在临时目录校验产物，再原子切换 `current`。工作流确认线上版本标记并执行 Playwright，检查失败时切回上一版。

## 首次配置服务器

服务器需要 Caddy、OpenSSH、Bash、GNU tar、coreutils 和 `flock`。配置专用的 SSH 发布账号，使用公钥登录并只授予该站点发布目录的写权限。Caddy 进程需要能遍历发布路径并读取静态文件。

发布工作流使用 `/data/fc-apps/fuxiaochen-next` 作为站点工作目录。在其中创建 `releases/initial`，把现有静态站点复制进去作为回滚版本。首次上线时可用一份已验收的静态产物初始化。

```text
/data/fc-apps/fuxiaochen-next/
├── current -> releases/initial
└── releases/
    └── initial/
        └── index.html
```

`current` 使用相对链接，指向 `releases/` 下的版本。

## 配置 Caddy 和 HTTPS

将 `fuxiaochen.com` 和 `www.fuxiaochen.com` 的 DNS 指向这台服务器，并确保 Caddy 能从公网接收 TCP 80 和 443 的连接。Caddy 会为两个域名自动签发并续期证书，并将主域名的 HTTP 请求升级到 HTTPS。[Caddy 自动 HTTPS](https://caddyserver.com/docs/automatic-https)

将 Caddy 的静态文件根目录指向 `current`。两个协议下的 `www` 请求均永久跳转到 HTTPS 主域名，并保留路径和查询参数。

```caddyfile
fuxiaochen.com {
    root * /data/fc-apps/fuxiaochen-next/current
    header /_release.txt Cache-Control "no-store"
    file_server

    handle_errors {
        @notFound expression `{err.status_code} == 404`
        handle @notFound {
            rewrite * /404.html
            file_server
        }
    }
}

http://www.fuxiaochen.com, https://www.fuxiaochen.com {
    redir https://fuxiaochen.com{uri} permanent
}
```

校验并重新加载 Caddy 配置后，确认 HTTPS 主站可访问，并分别检查 HTTP 和 HTTPS 的 `www` 跳转。之后发布只切换符号链接。

## 配置 GitHub

在 **Settings → Environments** 创建 `production`，将允许部署的分支限制为仓库默认分支。配置以下环境 Variables 和 Secrets。

| 类型     | 名称                     | 取值                                          |
| -------- | ------------------------ | --------------------------------------------- |
| Variable | `DEPLOY_SSH_HOST`        | runner 可访问的 SSH 主机名或 IP               |
| Variable | `DEPLOY_SSH_PORT`        | SSH 端口，省略时使用 `22`                     |
| Variable | `DEPLOY_SSH_USER`        | 专用发布账号                                  |
| Secret   | `DEPLOY_SSH_KEY`         | 发布账号专用且适合无人值守的 SSH 私钥         |
| Secret   | `DEPLOY_SSH_KNOWN_HOSTS` | 从可信服务器渠道核对过的完整 `known_hosts` 行 |

`DEPLOY_SSH_KNOWN_HOSTS` 中的主机部分须匹配连接的主机和端口。使用默认端口时写主机名或 IP，使用其他端口时写 `[主机]:端口`。私钥由 GitHub 在发布步骤提供，服务器只安装对应公钥。

## 发布和回滚

发布工作流进入默认分支后，在 **Actions → 发布静态站点 → Run workflow** 触发。也可从项目目录运行 `gh workflow run deploy.yml`。同一站点的发布串行执行。版本目录名为 GitHub 运行编号和运行次数，日志与 `/_release.txt` 可核对版本及提交 SHA。

上传或产物校验失败时，已有站点继续服务。切换后，工作流验证首页、文章、RSS、站点地图、404 和全文搜索。线上检查失败时，日志会显示是否恢复了上一版。版本目录会保留，清理时应保留当前版本和可用于回滚的版本。

如果 GitHub runner 被强制终止或 SSH 断开导致自动回滚未完成，先确认没有正在执行的发布，再以发布账号查看 `current` 和 `.deploy/<版本>.previous`。后者的第一列是该次切换前的版本。以下命令示例用于恢复当前失败版本记录的上一版。

```bash
(
  set -eu
  cd /data/fc-apps/fuxiaochen-next
  current=$(readlink current)
  read -r previous _ < ".deploy/${current##*/}.previous"
  test -s "$previous/index.html"
  swap=$(mktemp -d .current.XXXXXXXX)
  ln -s -- "$previous" "$swap/current"
  mv -Tf -- "$swap/current" current
  rmdir -- "$swap"
)
```

单独验证已部署的站点可运行 `PLAYWRIGHT_BASE_URL=https://fuxiaochen.com mise run test:published`。
