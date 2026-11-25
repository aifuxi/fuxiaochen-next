#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

operation=$1
root=$2
release_id=$3
commit_sha=$4
attempt_token=$5
[[ $root == /* ]] || fail '发布根目录必须是绝对路径。'
[[ $release_id =~ ^[0-9]+-[0-9]+$ && $commit_sha =~ ^[a-f0-9]{40}$ ]] || fail '发布编号或提交 SHA 无效。'
cd -P -- "$root"
[[ $PWD != / && -d releases ]] || fail '请先初始化站点发布目录。'

umask 022
mkdir -p -m 700 -- .deploy
exec 9>.deploy/lock
flock -w 30 -x 9

target="releases/$release_id"
previous_file=".deploy/$release_id.previous"
active=$(readlink current) || fail 'current 必须是指向已部署版本的符号链接。'

check_release() {
  [[ $1 =~ ^releases/[a-zA-Z0-9][a-zA-Z0-9._-]*$ && -s $1/index.html ]] ||
    fail '已有版本目录无效，请检查 current 或回滚记录。'
}

switch_current() {
  local swap
  swap=$(mktemp -d .current.XXXXXXXX)
  if ! ln -s -- "$1" "$swap/current" || ! mv -Tf -- "$swap/current" current; then
    rm -rf -- "$swap"
    fail '切换 current 失败。'
  fi
  rmdir -- "$swap"
}

case "$operation" in
  publish)
    check_release "$active"
    [[ ! -e $target && ! -L $target ]] || fail '发布目录已存在，请使用新的发布编号。'
    staging_dir=$(mktemp -d "releases/.$release_id.XXXXXXXX")
    trap 'rm -rf -- "$staging_dir"' EXIT
    tar -xzf - -C "$staging_dir" --no-same-owner --no-same-permissions
    chmod 755 -- "$staging_dir"

    for file in index.html blog/index.html 404.html rss.xml robots.txt sitemap-index.xml pagefind/pagefind.js pagefind/pagefind-entry.json; do
      [[ -s $staging_dir/$file ]] || fail "构建产物缺少 $file。"
    done
    [[ -d $staging_dir/_astro ]] || fail '构建产物缺少 _astro 目录。'

    printf '%s %s\n' "$release_id" "$commit_sha" > "$staging_dir/_release.txt"
    printf '%s %s\n' "$active" "$attempt_token" > "$previous_file"
    mv -T -- "$staging_dir" "$target"
    switch_current "$target"
    printf '已切换到 %s，上一版为 %s。\n' "$target" "$active"
    ;;
  rollback)
    if [[ $active != "$target" ]]; then
      printf '本次发布未处于生效状态，当前版本为 %s。\n' "$active"
      exit 0
    fi
    # 保护已由其他发布进程切换的同编号版本。
    read -r previous owner < "$previous_file"
    if [[ $owner != "$attempt_token" ]]; then
      printf '当前版本由另一发布进程切换，跳过回滚。\n'
      exit 0
    fi

    check_release "$previous"
    switch_current "$previous"
    printf '已回滚到 %s。\n' "$previous"
    ;;
  *)
    fail '无效的发布操作。'
    ;;
esac
