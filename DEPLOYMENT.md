# 静态站点发布与回滚

GitHub Actions 从 `master` 构建并测试站点，将同一次运行的 `dist/` 通过 SSH 传到 Caddy 服务器。服务器校验产物后切换 `current`，线上验收失败时恢复上一版。

第 1 至 6 步只在首次配置时执行。已经配置好发布目录和 Caddy 的服务器，可以用第 4 步的权限检查和第 5 步的 HTTPS 检查验收现有配置。之后日常发布从第 7 步开始。

## 1. 本机准备 SSH 密钥

在**自己的电脑**上以日常账号打开终端。以下本机命令沿用这个终端中的变量。新开终端时，重新设置相关变量。

将示例地址、端口和账号替换为 runner 实际连接的值。

```bash
ssh_host=203.0.113.10
ssh_port=22
deploy_user=site-deploy
deploy_key="$HOME/.ssh/fuxiaochen-next-deploy"
```

首次配置时生成一对专用密钥。`-N ''` 设置空口令，供 runner 无人值守地使用。已有这对密钥时，直接读取对应的公钥。

```bash
mkdir -p -m 700 ~/.ssh
ssh-keygen -t ed25519 -C "github-actions-fuxiaochen-next" -f "$deploy_key" -N ''
```

```bash
cat "$deploy_key.pub"
```

把输出的完整一行留给第 2 步。私钥文件 `$deploy_key` 用于第 6 步。

## 2. 服务器创建发布账号并登记公钥

通过云服务器控制台或已确认身份的 SSH 会话，在 **Debian/Ubuntu 服务器上以 `root` 执行**。服务器需要 Caddy、OpenSSH、Bash、GNU tar、coreutils 和 `flock`。

首次创建账号时执行以下命令。也可以复用已有的普通账号，后续使用该账号及其实际主目录。

```bash
adduser --disabled-password --comment "GitHub Actions deploy" site-deploy
```

将下方示例公钥一行完整替换为第 1 步的 `.pub` 输出。若这把公钥已加入 `authorized_keys`，可以直接读取主机公钥。

```bash
install -d -m 0700 -o site-deploy /home/site-deploy/.ssh
runuser -u site-deploy -- tee -a /home/site-deploy/.ssh/authorized_keys >/dev/null <<'EOF'
ssh-ed25519 AAAA... github-actions-fuxiaochen-next
EOF
runuser -u site-deploy -- chmod 0600 /home/site-deploy/.ssh/authorized_keys
```

仍在服务器可信会话中读取 **服务器主机公钥**，把输出的前两段（密钥类型和完整公钥）留给第 3 步。

```bash
cat /etc/ssh/ssh_host_ed25519_key.pub
```

`authorized_keys` 供服务器判断谁能登录，`known_hosts` 供 SSH 客户端确认服务器身份。[OpenSSH `known_hosts` 格式](https://man.openbsd.org/sshd.8#SSH_KNOWN_HOSTS_FILE_FORMAT)

## 3. 本机核对主机并试登录

回到**第 1 步的本机终端**。本机使用专用私钥，远端命令以发布账号执行。

将 `ssh_host_key` 改为第 2 步从服务器读取的密钥类型和完整公钥。命令会生成单独的 `known_hosts` 文件，供本机检查和 GitHub 配置共用。默认端口 `22` 使用主机名或 IP，其他端口使用 `[主机]:端口`。

```bash
ssh_host_key='ssh-ed25519 AAAA...'
known_hosts_file="$deploy_key.known_hosts"
host_field="$ssh_host"
if [ "$ssh_port" != 22 ]; then
  host_field="[$ssh_host]:$ssh_port"
fi
printf '%s %s\n' "$host_field" "$ssh_host_key" > "$known_hosts_file"
```

```bash
deploy_ssh() {
  ssh -T -F /dev/null -p "$ssh_port" -i "$deploy_key" \
    -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
    -o "UserKnownHostsFile=$known_hosts_file" -o GlobalKnownHostsFile=/dev/null \
    -- "$deploy_user@$ssh_host" "$@"
}

deploy_ssh 'id -un' </dev/null
```

输出实际发布账号后，可以继续。这里验证的是本机的公钥登录和主机校验，runner 的网络连通性在第 7 步确认。

## 4. 服务器检查或初始化发布目录

### 已有目录和可用版本

在**服务器的 `root` 终端**使用 `runuser` 以实际发布账号检查。版本目录下应有非空、可读的 `index.html`。发布账号还需要能在站点工作目录切换 `current`、在 `releases/` 创建新版本。

```bash
runuser -u site-deploy -- bash -ec '
  cd /data/fc-apps/fuxiaochen-next
  test -w .
  test -w releases
  test -x releases
  active=$(readlink current)
  [[ $active =~ ^releases/[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]]
  test -s "$active/index.html"
  test -r "$active/index.html"
  printf "%s\n" "$active"
'
```

输出 `releases/initial` 或其他版本路径后，直接前往第 5 步。若确认只是工作目录和 `releases/` 由 `root` 创建、发布账号缺少写权限，以服务器 `root` 调整这两个目录的所有者，再重跑检查。已有的 `.deploy/` 也需要允许发布账号写入其中的记录与锁文件。

```bash
chown -- site-deploy /data/fc-apps/fuxiaochen-next /data/fc-apps/fuxiaochen-next/releases
```

### 尚无可用版本

首次自动发布需要一份可回滚的初始版本。依次准备目录、复制静态文件、建立链接。已有正常服务的 `current` 时，走上一节的检查。

1. **服务器，`root`**。为发布账号创建目录。

   ```bash
   deploy_root=/data/fc-apps/fuxiaochen-next
   deploy_user=site-deploy

   install -d -m 0755 -o "$deploy_user" -- \
     "$deploy_root" "$deploy_root/releases" "$deploy_root/releases/initial"
   ```

2. **选择一种方式准备初始产物**。旧站点的静态文件已在服务器上时，在**服务器的 `root` 终端**将它复制到空的 `releases/initial/`。将 `old_site` 改为旧站点实际的静态文件目录。

   ```bash
   old_site=/path/to/old-site
   test -s "$old_site/index.html" &&
     cp -R -- "$old_site/." /data/fc-apps/fuxiaochen-next/releases/initial/
   ```

   全新站点则在**本机的项目仓库目录**构建，并通过第 3 步已验证的 SSH 连接把产物上传到空的 `releases/initial/`。

   ```bash
   (
     set -o pipefail
     mise run build &&
       tar --no-xattrs -czf - -C dist . |
       deploy_ssh 'cd /data/fc-apps/fuxiaochen-next/releases/initial &&
         test -z "$(ls -A)" && umask 022 && tar -xzf -'
   )
   ```

3. **服务器，`root`**。确认 `index.html` 已在初始版本目录根部。若 `current` 尚未建立，再创建相对链接。已有 `current -> releases/initial` 时，保留链接并执行上一节的检查。

   ```bash
   test -s /data/fc-apps/fuxiaochen-next/releases/initial/index.html &&
     runuser -u site-deploy -- ln -sT -- releases/initial /data/fc-apps/fuxiaochen-next/current
   ```

## 5. 配置或验证 Caddy 和 HTTPS

需要修改 Caddy 时，在**服务器上以 `root`** 编辑实际使用的 Caddyfile。已配置好的服务器可直接执行本节末尾的本机验证。

将 `fuxiaochen.com` 和 `www.fuxiaochen.com` 的 DNS 指向这台服务器，并确保 Caddy 能从公网接收 TCP 80 和 443 的连接。Caddy 会为两个域名自动管理证书。Caddy 从 `current` 读取静态文件，`www` 的 HTTP 和 HTTPS 请求直接跳到主域名，保留路径和查询参数。[Caddy 自动 HTTPS](https://caddyserver.com/docs/automatic-https)

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

**服务器，`root`**。如果 Caddy 由 systemd 管理并使用默认配置路径，修改后这样校验和重载。

```bash
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile &&
  systemctl reload caddy
```

**本机终端**。从公网验证主站和两个 `www` 入口。主站应返回 `200`，两个 `www` 请求应返回 `301`，`Location` 均应为 `https://fuxiaochen.com/blog/?ref=check`。

```bash
curl -fsSI https://fuxiaochen.com/
curl -fsSI 'http://www.fuxiaochen.com/blog/?ref=check'
curl -fsSI 'https://www.fuxiaochen.com/blog/?ref=check'
```

## 6. 配置 GitHub 生产环境

在 **GitHub 仓库网页**上，以有权管理仓库环境的账号打开 **Settings → Environments → production**。没有该环境时先创建，并将可部署分支限制为 `master`。

在该环境中添加以下 Variables 和 Secrets。使用第 1 步中已确认的连接信息。

| 类型     | 名称                     | 取值                                                                         |
| -------- | ------------------------ | ---------------------------------------------------------------------------- |
| Variable | `DEPLOY_SSH_HOST`        | 本机变量 `ssh_host` 的值                                                     |
| Variable | `DEPLOY_SSH_PORT`        | 本机变量 `ssh_port` 的值，默认 `22` 可省略                                   |
| Variable | `DEPLOY_SSH_USER`        | 本机变量 `deploy_user` 的值                                                  |
| Secret   | `DEPLOY_SSH_KEY`         | 第 1 步生成的本机私钥 `~/.ssh/fuxiaochen-next-deploy` 的完整内容             |
| Secret   | `DEPLOY_SSH_KNOWN_HOSTS` | 第 3 步生成的本机文件 `~/.ssh/fuxiaochen-next-deploy.known_hosts` 的完整一行 |

## 7. 触发首次发布并验收

1. **本机，项目仓库目录**。检查 GitHub 的 `master` 上已有 `.github/workflows/deploy.yml`。若包含发布工作流的提交尚未推送，确认待推送的提交后运行 `git push origin master`。[GitHub 手动触发工作流](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
2. **GitHub 网页**。打开 **Actions → 发布静态站点 → Run workflow**，选择 `master`。也可在本机项目目录执行 `gh workflow run deploy.yml --ref master`。
3. **GitHub 的运行日志**。构建与测试通过后，进入「通过 SSH 发布并验证线上站点」。看到 `已切换到 releases/…` 表示 runner 已登录服务器、上传产物并切换版本。看到 `发布并验证成功` 且任务结束为成功，表示线上版本标记和 Playwright 验收均通过。
4. **本机终端**。核对线上版本标记，其中的运行编号和 Git 提交 SHA 应与本次发布日志一致。

   ```bash
   curl -fsS https://fuxiaochen.com/_release.txt
   ```

若发布步骤失败，先看日志中的第一条错误。

| 日志片段                                       | 检查位置                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `Connection timed out` 或 `Connection refused` | 核对 GitHub 的 SSH 主机和端口，以及服务器 SSH 监听和云防火墙对 runner 的可达性 |
| `Host key verification failed`                 | 核对第 3 步的主机字段、端口和服务器主机公钥                                    |
| `Permission denied (publickey)`                | 核对发布账号、该账号的 `authorized_keys`，以及 GitHub 使用的对应私钥           |
| 发布目录无效或文件权限错误                     | 重新执行第 4 步，检查目录权限和 `current` 指向的版本                           |

## 回滚

切换前失败时，当前版本继续服务。切换后的线上验收失败时，工作流尝试恢复上一版。日志中的 `已回滚到 releases/…` 表示切换已恢复。版本目录会保留，清理时保留当前版本及可用的回滚版本。

如果 runner 被强制终止或 SSH 断开导致自动回滚未完成，先确认 GitHub 上没有正在执行的发布。**在服务器上以发布账号执行**以下命令，从当前版本的发布记录读取上一版并切回。

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

回滚后，**在本机的项目仓库目录**运行 `PLAYWRIGHT_BASE_URL=https://fuxiaochen.com mise run test:published` 可单独验证线上站点。
