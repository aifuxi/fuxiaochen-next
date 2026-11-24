---
title: 'Debian 12 服务器初始化：从 APT 换源到开发环境配置'
summary: '在 Debian 12 上用 Nala 筛选 APT 镜像，配置 UTF-8 和上海时区，再安装 Oh My Zsh 并用 mise 批量安装开发工具。'
publishedAt: 2026-11-24
topic: tooling
tags: [Debian 12, 服务器初始化, APT, Zsh, mise]
---

我的服务器运行的是 **Debian 12（Bookworm）**。这篇文章记录了新系统装好后，我用到的几项配置：

- **软件源测速与切换**。在国内服务器上用 Nala 测试 APT 镜像的下载速度，选好后直接保存配置，省去手动填写镜像地址。
- **中文乱码**。检查 SSH 会话的字符编码，配置 UTF-8，让终端能正常显示中文。
- **服务器时区**。有些系统镜像默认使用 UTC，这里把时区设为上海（UTC+8），方便查看本地时间。
- **Zsh 配置**。安装 Oh My Zsh，启用命令语法高亮（`zsh-syntax-highlighting`）和历史命令自动提示（`zsh-autosuggestions`）。
- **开发工具安装**。把工具写进 mise 配置，执行一次 `mise install`，装好 Node.js、Go、Docker CLI 和 Docker Compose。

全文以 Debian 12 为准，操作以 `root` 用户为例，命令保留 `sudo` 写法。

## 一、国内服务器按需更换 APT 镜像

这一章适用于国内服务器。国外服务器可以直接跳到第二章。首次安装软件包前，先更新 APT 软件包索引：

```bash
sudo apt update
```

### 检查现有软件源

使用云服务厂商提供的公共系统镜像时，通常可以直接使用厂商配置好的软件源。例如，阿里云 ECS 的公共镜像默认使用阿里云内网软件源，腾讯云 CVM 通常在实例首次启动时通过 Cloud-Init 配置软件源。如果更新索引时现有源访问稳定，就可以跳到第二章。 [阿里云软件源文档](https://help.aliyun.com/zh/ecs/user-guide/manage-and-use-linux-software-repositories) · [腾讯云 Cloud-Init 文档](https://cloud.tencent.com/document/faq/213/19670)

如果是用 Debian 官方安装镜像或其他镜像全新安装的系统，APT 源取决于安装时的配置。现有源可用但下载较慢时，可以用 Nala 筛选国内镜像。如果还没有可用的网络软件源，需要先手动添加一个 Debian 12 软件源，再安装 Nala。 [Debian 12 的 APT 软件源配置手册](https://manpages.debian.org/bookworm/apt/sources.list.5.en.html)

### 用 Nala 测速并选择镜像

```bash
sudo apt install nala
sudo nala fetch -c CN
```

Nala 会自动识别当前系统和发行版本，`-c CN` 将候选镜像限定在国内。测速结束后，查看 **Fastest Mirrors** 表格。`Index` 是镜像编号，`Score` 是下载 `Release` 文件所用的毫秒数，数值越小表示本次下载用时越短。 [Debian 12 的 Nala 手册](https://manpages.debian.org/bookworm/nala/nala-fetch.8.en.html)

1. 在表格下方的 `Mirrors you want to keep` 提示处，输入想保留的镜像编号。
2. 选择一个镜像时，输入编号即可，例如 `1`。选择多个镜像时，用空格分隔，例如 `1 2 3 4 5`。编号以当前服务器显示的列表为准。
3. 按 Enter 提交，再按提示确认保存。如果只想测速，可以在保存前退出。

### 检查保存结果

Nala 会将选中的镜像写入 `/etc/apt/sources.list.d/nala-sources.list`。可以用下面的命令查看配置、刷新索引并核对 APT 识别到的仓库：

```bash
cat /etc/apt/sources.list.d/nala-sources.list
sudo apt update
apt-cache policy
```

原有软件源可能仍然启用。整理重复条目前，先备份 `/etc/apt/sources.list` 或 `/etc/apt/sources.list.d/` 下涉及的文件，再核对 `bookworm`、`bookworm-updates` 和 `bookworm-security`，确保安全更新条目仍然启用。之后可以继续用 `apt install`，也可以用 `nala install`，两者读取同一套 APT 软件源配置。 [APT 软件源配置手册](https://manpages.debian.org/bookworm/apt/sources.list.5.en.html) · [Debian 12 的 Nala 手册](https://manpages.debian.org/bookworm/nala/nala.8.en.html)

## 二、配置 UTF-8，解决中文乱码

通过 SSH 编辑带中文注释的文件时，如果遇到乱码，先检查当前会话的 Locale 和字符编码：

```bash
locale
locale charmap
```

如果字符编码已经是 `UTF-8`，可以接着检查终端显示和文件本身。如果输出的是 ASCII，可以在临时子 Shell 里验证切换到 UTF-8 后的效果：

```bash
(
  export LC_ALL=C.UTF-8
  locale charmap
  printf '%s\n' '你好，中文测试'
)
```

### 永久设置系统默认 Locale

先查看系统已经生成了哪些 Locale：

```bash
locale -a
```

更新软件包索引、安装 `locales`，再打开系统配置菜单：

```bash
sudo apt update
sudo apt install -y locales
sudo dpkg-reconfigure locales
```

在列表中按空格勾选 `en_US.UTF-8 UTF-8`，然后在默认 Locale 的菜单里选择 `en_US.UTF-8`。这个流程会生成所选的 Locale，并保存系统默认值。 [Debian 的 Locale 配置指南](https://www.debian.org/doc/manuals/debian-reference/ch08.en.html)

退出 SSH 并重新连接，再检查新会话：

```bash
locale
locale charmap
printf '%s\n' '你好，中文测试'
```

`locale` 应显示 `LANG=en_US.UTF-8`，`locale charmap` 应输出 `UTF-8`。如果字符编码仍然不对，检查 `LC_ALL` 或 `LC_CTYPE` 是否覆盖了默认值。已经以乱码形式保存进文件的内容，需要从原始文本重新复制。

## 三、设置上海时区

有些 Debian 12 系统镜像默认使用 UTC。运行下面的命令，将时区设为上海（UTC+8），并查看当前时间：

```bash
sudo timedatectl set-timezone Asia/Shanghai && date
```

时区设置立即生效，重启后也会保留。 [Debian 12 的 `timedatectl` 手册](https://manpages.debian.org/bookworm/systemd/timedatectl.1.en.html)

### 启用 NTP 自动时间同步（可选）

```bash
sudo timedatectl set-ntp true
```

用下面的命令查看同步状态：

```bash
timedatectl status
```

`Time zone` 应显示 `Asia/Shanghai`。首次同步可能需要等一会儿，`System clock synchronized` 显示 `yes` 时，表示系统时钟已经同步。

## 四、安装 Oh My Zsh

### 安装依赖

```bash
sudo apt install unzip git zsh -y
```

### 安装 Oh My Zsh

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### 安装并启用插件

```bash
# 1. 安装历史命令自动提示插件
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# 2. 安装命令语法高亮插件
git clone https://github.com/zsh-users/zsh-syntax-highlighting \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# 3. 自动修改 ~/.zshrc，启用插件
perl -i -pe 's/^plugins=\((.*?)\)/plugins=($1 zsh-autosuggestions zsh-syntax-highlighting)/' ~/.zshrc

# 4. 重新加载配置
source ~/.zshrc
```

## 五、用 mise 批量安装开发工具

### 安装并激活 mise

在 Debian 12 上，通过 `extrepo` 启用 mise 的 APT 仓库。 [mise 安装文档](https://mise.jdx.dev/installing-mise.html#apt)

```bash
sudo apt install -y extrepo
sudo extrepo enable mise
sudo apt update
sudo apt install -y mise
mise --version
```

在 `~/.zshrc` 末尾加一行，让 Zsh 在交互式会话中加载 mise 管理的工具和环境变量。 [mise Shell 激活文档](https://mise.jdx.dev/getting-started.html#_4-activate-mise-optional)

```zsh
eval "$(mise activate zsh)"
```

### 配置当前用户的默认工具

创建并编辑 `~/.config/mise/config.toml`。这份配置为当前用户提供默认版本，项目也可以通过自己的 `mise.toml` 指定版本。这里让 Node.js 跟随 LTS，Go、Docker CLI 和 Compose 使用各自的 `latest`。需要在多台机器上复用同一版本时，可以填写具体版本号。 [mise 版本配置](https://mise.jdx.dev/dev-tools/versions.html) · [mise 工具注册表](https://mise.jdx.dev/registry.html)

```bash
mkdir -p ~/.config/mise
nano ~/.config/mise/config.toml
```

```toml
[tools]
node = "lts"
go = "latest"
docker-cli = "latest"

[tools.docker-compose]
version = "latest"

# 将 Compose 注册为当前用户的 Docker CLI 插件
postinstall = { run = '''
set -eu

plugin_dir="${DOCKER_CONFIG:-$HOME/.docker}/cli-plugins"
compose_bin="$MISE_TOOL_INSTALL_PATH/docker-cli-plugin-docker-compose"

if [ ! -x "$compose_bin" ]; then
  compose_bin="$MISE_TOOL_INSTALL_PATH/docker-compose"
fi

if [ ! -x "$compose_bin" ]; then
  printf '%s\n' '找不到 Docker Compose 可执行文件' >&2
  exit 1
fi

mkdir -p "$plugin_dir"
ln -sfn "$compose_bin" "$plugin_dir/docker-compose"
''', when = "always" }
```

`postinstall` 会把 mise 下载的 Compose 链接到 Docker 的用户插件目录，让 `docker compose` 能找到它。如果这个目录里已有通过其他方式安装的 Compose，先确认是否要交给 mise 管理，因为这段配置会替换同名入口。 [mise 安装后命令](https://mise.jdx.dev/dev-tools/#tool-postinstall-commands) · [Docker Compose 插件目录](https://docs.docker.com/compose/install/linux/#install-the-plugin-manually)

### 按需配置 Node.js 和 npm 镜像

如果下载较慢，可以把下面的配置加到同一个文件里。`mirror_url` 用于下载 Node.js 本体，`NPM_CONFIG_REGISTRY` 指定 npm 查询和下载依赖时使用的 registry。两项可以分别配置。 [mise 的 Node.js 镜像设置](https://mise.jdx.dev/configuration/settings.html#node-mirror-url) · [npm 配置文档](https://docs.npmjs.com/cli/v11/using-npm/config/#environment-variables) · [npmmirror](https://npmmirror.com/)

```toml
[settings.node]
mirror_url = "https://npmmirror.com/mirrors/node/"

[env]
NPM_CONFIG_REGISTRY = "https://registry.npmmirror.com/"
```

### 安装并验证

回到主目录，执行一次 `mise install` 安装配置里的工具，再重新打开 Zsh：

```bash
cd ~
mise install
exec zsh
```

检查工具能否在当前 Shell 中找到：

```bash
node --version
go version
npm config get registry
docker --version
docker compose version
```

`docker --version` 和 `docker compose version` 分别验证客户端和 Compose 插件。实际启动容器还需要连接可用的 Docker Engine。运行 `docker version`，可以通过输出中的 `Server` 信息确认连接。 [Docker Engine 的 Debian 安装文档](https://docs.docker.com/engine/install/debian/)
