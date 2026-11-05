#!/bin/bash
# Поднимает сервер vfd74.ru с нуля на чистой Ubuntu 24.04 (любой VPS-провайдер).
# Идемпотентен: можно запускать повторно — второй запуск после переключения DNS
# выпускает HTTPS-сертификат и ставит боевой конфиг nginx.
#
# С локальной машины (из корня репозитория), SSH-ключ уже на сервере:
#   scp -r deploy root@SERVER:/root/
#   scp .env root@SERVER:/root/deploy/env.production   # PUBLIC_SUPABASE_* для сборки
#   ssh root@SERVER 'bash /root/deploy/setup-server.sh'
#   git remote set-url production root@SERVER:/var/repo/vfd74.git
#   git push production main
# Когда A-записи vfd74.ru и www указывают на сервер — ещё раз:
#   ssh root@SERVER 'bash /root/deploy/setup-server.sh'
set -euo pipefail

DOMAIN="vfd74.ru"
REPO_DIR="/var/repo/vfd74.git"
BUILD_DIR="/var/www/$DOMAIN/build"
WEB_ROOT="/var/www/$DOMAIN/html"       # тот же путь, что в post-receive и nginx/vfd74.ru.conf
NODE_MAJOR="22"
SWAP_SIZE="2G"                         # страховка для npm ci + astro build
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export DEBIAN_FRONTEND=noninteractive

echo "==> Пакеты"
apt-get update -q
apt-get install -y -q nginx libnginx-mod-http-brotli-filter certbot python3-certbot-nginx \
  git rsync curl ca-certificates ufw fail2ban unattended-upgrades dnsutils

if ! command -v node >/dev/null || [ "$(node -v | cut -c2- | cut -d. -f1)" != "$NODE_MAJOR" ]; then
  echo "==> Node.js $NODE_MAJOR (NodeSource, в /usr/bin — post-receive видит его без nvm)"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -q nodejs
fi
echo "    node $(node -v), npm $(npm -v)"

if ! swapon --show | grep -q /swapfile; then
  echo "==> Swap $SWAP_SIZE"
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Журнал systemd не больше 200 МБ"
mkdir -p /etc/systemd/journald.conf.d
printf '[Journal]\nSystemMaxUse=200M\n' > /etc/systemd/journald.conf.d/size.conf
systemctl restart systemd-journald

echo "==> SSH только по ключу"
if [ -s /root/.ssh/authorized_keys ]; then
  # 00- раньше 50-cloud-init.conf: в sshd побеждает первое значение.
  printf 'PasswordAuthentication no\nKbdInteractiveAuthentication no\nPermitRootLogin prohibit-password\n' \
    > /etc/ssh/sshd_config.d/00-hardening.conf
  sshd -t && systemctl reload ssh
else
  echo "    ПРОПУЩЕНО: нет /root/.ssh/authorized_keys — сначала ssh-copy-id"
fi

echo "==> Файрвол: 22, 80, 443"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
systemctl enable --now fail2ban unattended-upgrades >/dev/null

echo "==> Git-репозиторий и хук автодеплоя"
mkdir -p "$BUILD_DIR" "$WEB_ROOT" "$(dirname "$REPO_DIR")"
[ -d "$REPO_DIR" ] || git init -q --bare "$REPO_DIR"
install -m 755 "$SCRIPT_DIR/post-receive" "$REPO_DIR/hooks/post-receive"

if [ -f "$SCRIPT_DIR/env.production" ]; then
  install -m 600 "$SCRIPT_DIR/env.production" "$BUILD_DIR/.env.production"
  rm -f "$SCRIPT_DIR/env.production"
fi
[ -f "$BUILD_DIR/.env.production" ] || echo "    ВНИМАНИЕ: нет $BUILD_DIR/.env.production (PUBLIC_SUPABASE_*) — сборка упадёт"

echo "==> nginx"
install -m 644 "$SCRIPT_DIR/nginx/vfd74-perf.conf" /etc/nginx/conf.d/vfd74-perf.conf
rm -f /etc/nginx/sites-enabled/default
SITE="/etc/nginx/sites-available/$DOMAIN"
CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
SERVER_IP="$(curl -4 -fsS https://ifconfig.me || true)"

if [ ! -f "$CERT" ]; then
  # Пока сертификата нет — сайт по http: можно проверить сборку и выпустить сертификат.
  cat > "$SITE" <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN www.$DOMAIN;
    root $WEB_ROOT;
    index index.html;
    location / { try_files \$uri \$uri/ =404; }
    error_page 404 /404.html;
}
NGINX
  ln -sf "$SITE" "/etc/nginx/sites-enabled/$DOMAIN"
  nginx -t && systemctl reload nginx

  APEX_IP="$(dig +short A "$DOMAIN" @1.1.1.1 | tail -1)"
  WWW_IP="$(dig +short A "www.$DOMAIN" @1.1.1.1 | tail -1)"
  if [ -n "$SERVER_IP" ] && [ "$APEX_IP" = "$SERVER_IP" ] && [ "$WWW_IP" = "$SERVER_IP" ]; then
    echo "==> DNS указывает сюда — выпускаю сертификат"
    # Без e-mail: Let's Encrypt с 2025 не шлёт напоминаний, продление — certbot.timer.
    certbot certonly --nginx -n --agree-tos --register-unsafely-without-email -d "$DOMAIN" -d "www.$DOMAIN"
  else
    echo "    HTTPS отложен: $DOMAIN → '${APEX_IP:-нет}', www → '${WWW_IP:-нет}', сервер $SERVER_IP."
    echo "    Пропиши A-записи на $SERVER_IP и запусти скрипт ещё раз."
  fi
fi

if [ -f "$CERT" ]; then
  echo "==> Боевой конфиг nginx (https, www → apex, кеш, HSTS)"
  install -m 644 "$SCRIPT_DIR/nginx/vfd74.ru.conf" "$SITE"
  ln -sf "$SITE" "/etc/nginx/sites-enabled/$DOMAIN"
  nginx -t && systemctl reload nginx
fi

echo
echo "Готово. Сайт: $WEB_ROOT, деплой: git push production main"
