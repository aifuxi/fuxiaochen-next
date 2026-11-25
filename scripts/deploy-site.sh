#!/usr/bin/env bash
set -euo pipefail

dist=${1:?需要传入构建产物目录}
: "${DEPLOY_SITE_URL:?缺少站点地址}" "${DEPLOY_ROOT:?缺少服务器发布根目录}"
: "${DEPLOY_SSH_HOST:?缺少 SSH 主机}" "${DEPLOY_SSH_USER:?缺少 SSH 用户}"
: "${DEPLOY_SSH_KEY:?缺少 SSH 私钥}" "${DEPLOY_SSH_KNOWN_HOSTS:?缺少 SSH 主机公钥}"
: "${DEPLOY_RELEASE_ID:?缺少发布编号}" "${DEPLOY_COMMIT_SHA:?缺少提交 SHA}"

quote_remote() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

ssh_target="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"
remote_script=$(quote_remote "$(< scripts/static-release.sh)")
temp_dir=$(mktemp -d)
remote_args="$(quote_remote "$DEPLOY_ROOT") $(quote_remote "$DEPLOY_RELEASE_ID") $(quote_remote "$DEPLOY_COMMIT_SHA") $(quote_remote "${temp_dir##*/}")"
pending_verification=false
umask 077

ssh_options=(
  -T -F /dev/null -p "${DEPLOY_SSH_PORT:-22}" -i "$temp_dir/identity"
  -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes
  -o "UserKnownHostsFile=$temp_dir/known_hosts" -o GlobalKnownHostsFile=/dev/null
  -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=3
)

remote_release() {
  ssh "${ssh_options[@]}" -- "$ssh_target" "bash -c $remote_script -- $1 $remote_args"
}

finish() {
  local status=$?
  if [[ $pending_verification == true ]]; then
    if ! remote_release rollback </dev/null; then
      printf '自动回滚失败，请核对服务器 current 链接和发布记录。\n' >&2
      status=1
    fi
  fi
  rm -rf -- "$temp_dir"
  exit "$status"
}

trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

printf '%s\n' "$DEPLOY_SSH_KEY" > "$temp_dir/identity"
printf '%s\n' "$DEPLOY_SSH_KNOWN_HOSTS" > "$temp_dir/known_hosts"
unset DEPLOY_SSH_KEY DEPLOY_SSH_KNOWN_HOSTS

tar --no-xattrs -czf "$temp_dir/dist.tar.gz" -C "$dist" .

# 连接中断时可能已完成切换，先登记回滚再发起发布。
pending_verification=true
remote_release publish < "$temp_dir/dist.tar.gz"

release_url="${DEPLOY_SITE_URL%/}/_release.txt?run=$DEPLOY_RELEASE_ID"
online_release=$(curl --fail --silent --show-error --max-time 20 -H 'Cache-Control: no-cache' "$release_url")
if [[ $online_release != "$DEPLOY_RELEASE_ID $DEPLOY_COMMIT_SHA" ]]; then
  printf '线上版本标记与本次产物不一致。\n' >&2
  exit 1
fi

PLAYWRIGHT_BASE_URL="$DEPLOY_SITE_URL" mise run test:published
pending_verification=false
printf '发布并验证成功。版本 %s，提交 %s。\n' "$DEPLOY_RELEASE_ID" "$DEPLOY_COMMIT_SHA"
