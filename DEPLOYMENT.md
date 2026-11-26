# 静态站点发布与回滚

GitHub Actions 在默认分支手动触发 **发布静态站点**。构建通过代码检查、Vitest 和 Playwright 后，发布任务下载同一次运行的 `dist/`，用 SSH 上传。服务器先在临时目录校验产物，再原子切换 `current`。工作流确认线上版本标记并执行 Playwright，检查失败时切回上一版。

## 生成 SSH 发布密钥

首次配置时，在自己的电脑或其他可信机器上生成一对专用密钥。`-N ''` 设置空口令，供 GitHub runner 无人值守地使用。

```bash
mkdir -p -m 700 ~/.ssh
ssh-keygen -t ed25519 -C "github-actions-fuxiaochen-next" \
  -f ~/.ssh/fuxiaochen-next-deploy -N ''
```

将 `~/.ssh/fuxiaochen-next-deploy.pub` 的完整一行加入服务器发布账号的 `authorized_keys`，并将 `~/.ssh/fuxiaochen-next-deploy` 的完整内容保存到 GitHub 的 `DEPLOY_SSH_KEY` Secret。日常发布时，runner 从 Secret 读取私钥并登录服务器。

## 首次配置服务器

服务器需要 Caddy、OpenSSH、Bash、GNU tar、coreutils 和 `flock`。以下服务器命令以 Debian/Ubuntu 的 `root` shell 为例。

### 创建发布账号并安装公钥

以下命令创建普通账号 `site-deploy` 并通过公钥授权登录。执行前将示例公钥一行替换为上一步生成的 `.pub` 文件内容。已有合适的账号时，可以沿用该账号，并将后续命令中的账号和主目录替换为实际值。

```bash
adduser --disabled-password --comment "GitHub Actions deploy" site-deploy
install -d -m 0700 -o site-deploy /home/site-deploy/.ssh
runuser -u site-deploy -- tee -a /home/site-deploy/.ssh/authorized_keys >/dev/null <<'EOF'
ssh-ed25519 AAAA... github-actions-fuxiaochen-next
EOF
runuser -u site-deploy -- chmod 0600 /home/site-deploy/.ssh/authorized_keys
```

### 初始化或检查发布目录

发布工作流使用 `/data/fc-apps/fuxiaochen-next` 作为站点工作目录。初始化后的目录结构如下。

```text
/data/fc-apps/fuxiaochen-next/
├── current -> releases/initial
└── releases/
    └── initial/
        └── index.html
```

首次创建发布目录时，执行以下命令。将 `deploy_user` 改为实际的发布账号，与 GitHub 的 `DEPLOY_SSH_USER` 一致。

```bash
deploy_root=/data/fc-apps/fuxiaochen-next
deploy_user=site-deploy

install -d -m 0755 -o "$deploy_user" -- \
  "$deploy_root" "$deploy_root/releases" "$deploy_root/releases/initial" &&
  runuser -u "$deploy_user" -- ln -sT -- releases/initial "$deploy_root/current"
```

把现有静态站点文件复制到 `releases/initial/` 作为回滚版本。首次上线可用已验收的 `dist/` 内容初始化。复制完成后，确认 `index.html` 位于 `releases/initial/` 根部。

已有发布目录和 `current` 链接时，可以直接检查权限。发布账号需要能写入工作目录和 `releases/`，Caddy 需要能遍历发布路径并读取静态文件。

```bash
runuser -u site-deploy -- sh -c '
  cd /data/fc-apps/fuxiaochen-next &&
  test -w . && test -w releases && test -x releases &&
  test -L current && test -s current/index.html && test -r current/index.html &&
  readlink current
'
```

检查通过时会输出当前版本的相对路径，例如 `releases/initial`。如果这两个目录由 `root` 创建，且检查确认发布账号缺少写权限，可以只调整这两个目录的所有者。

```bash
chown -- site-deploy /data/fc-apps/fuxiaochen-next /data/fc-apps/fuxiaochen-next/releases
```

### 获取服务器主机公钥

`authorized_keys` 供服务器确认 runner 有权登录，`known_hosts` 供 runner 确认它连到的是这台服务器。通过云服务器控制台或已确认身份的 SSH 会话，读取服务器的 Ed25519 主机公钥。

```bash
cat /etc/ssh/ssh_host_ed25519_key.pub
```

保留输出中的密钥类型和完整公钥，用于下方的 `DEPLOY_SSH_KNOWN_HOSTS`。[OpenSSH `known_hosts` 格式](https://man.openbsd.org/sshd.8#SSH_KNOWN_HOSTS_FILE_FORMAT)

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

首次配置时，校验并重新加载 Caddy。已有配置符合上述规则时，可以直接确认 HTTPS 主站可访问，并分别检查 HTTP 和 HTTPS 的 `www` 跳转。之后发布只切换符号链接。

## 配置 GitHub

在 **Settings → Environments** 创建 `production`，将允许部署的分支限制为仓库默认分支。配置以下环境 Variables 和 Secrets。

| 类型     | 名称                     | 取值                                          |
| -------- | ------------------------ | --------------------------------------------- |
| Variable | `DEPLOY_SSH_HOST`        | runner 可访问的 SSH 主机名或 IP               |
| Variable | `DEPLOY_SSH_PORT`        | SSH 端口，省略时使用 `22`                     |
| Variable | `DEPLOY_SSH_USER`        | 专用发布账号                                  |
| Secret   | `DEPLOY_SSH_KEY`         | 发布账号专用且适合无人值守的 SSH 私钥         |
| Secret   | `DEPLOY_SSH_KNOWN_HOSTS` | 从可信服务器渠道核对过的完整 `known_hosts` 行 |

`DEPLOY_SSH_KNOWN_HOSTS` 保存完整的一行，由主机字段、密钥类型和完整主机公钥组成。以 `DEPLOY_SSH_HOST` 为 `203.0.113.10` 为例，替换为实际的主机地址、端口和从服务器读取的公钥。

| SSH 端口 | `DEPLOY_SSH_KNOWN_HOSTS` 格式             |
| -------- | ----------------------------------------- |
| `22`     | `203.0.113.10 ssh-ed25519 AAAA...`        |
| `2222`   | `[203.0.113.10]:2222 ssh-ed25519 AAAA...` |

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
