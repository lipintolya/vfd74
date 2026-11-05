# nginx для vfd74.ru

Рабочая копия конфига лежит в репозитории, чтобы он не жил только на сервере.

| Файл | Куда на сервере |
|---|---|
| `vfd74.ru.conf` | `/etc/nginx/sites-available/vfd74.ru` |
| `vfd74-perf.conf` | `/etc/nginx/conf.d/vfd74-perf.conf` |
| `vfd74-security.conf` | `/etc/nginx/conf.d/vfd74-security.conf` |
| `../fail2ban/filter.d/vfd74-probe.conf` | `/etc/fail2ban/filter.d/vfd74-probe.conf` |
| `../fail2ban/jail.d/vfd74.local` | `/etc/fail2ban/jail.d/vfd74.local` |

Что внутри: кеш-заголовки одной переменной (`$vfd_cache_control`), Brotli, HSTS,
корректный тип для `site.webmanifest`; защита — лимиты запросов и соединений на IP,
таймауты против медленных клиентов, `server_tokens off`, 444 сканерам и чужим именам /
голому IP, fail2ban банит упёршихся в лимит и сканеры. Подробности — в комментариях файлов.

Применить (с бэкапом и проверкой):

```bash
apt-get install -y libnginx-mod-http-brotli-filter     # один раз
cp -a /etc/nginx /root/nginx-backup-$(date +%Y%m%d-%H%M%S)
scp deploy/nginx/vfd74-perf.conf root@SERVER:/etc/nginx/conf.d/
scp deploy/nginx/vfd74-security.conf root@SERVER:/etc/nginx/conf.d/
scp deploy/nginx/vfd74.ru.conf   root@SERVER:/etc/nginx/sites-available/vfd74.ru
ssh root@SERVER 'nginx -t && systemctl reload nginx'
# fail2ban
scp deploy/fail2ban/filter.d/vfd74-probe.conf root@SERVER:/etc/fail2ban/filter.d/
scp deploy/fail2ban/jail.d/vfd74.local        root@SERVER:/etc/fail2ban/jail.d/
ssh root@SERVER 'fail2ban-client -t && systemctl reload fail2ban && fail2ban-client status'
```

Проверить снаружи: `curl -skI https://SERVER_IP/` — обрыв рукопожатия (не 200),
`curl -sI https://vfd74.ru/ | grep -i server` — без версии, `curl -s -o /dev/null -w '%{http_code}' https://vfd74.ru/.env` — `000` (444).
Разбанить адрес: `fail2ban-client set vfd74-probe unbanip 1.2.3.4` (или `nginx-limit-req`).

### Чего nginx не может

Лимиты и fail2ban отсекают одиночные адреса: парсеры, сканеры, скрипты. Объёмная
DDoS-атака забивает канал VPS раньше, чем пакеты дойдут до nginx, — от неё спасает
только фильтрация до сервера (защищённый прокси / CDN перед сайтом, DNS в reg.ru
переключается на его адрес). Сайт статический, поэтому такой прокси может отдавать
его из кеша, даже если VPS недоступен.

Откат: вернуть файлы из `/root/nginx-backup-*`, `nginx -t`, `systemctl reload nginx`.

Заголовки не должны зависеть от git-деплоя: `git push production` их не меняет —
конфиг nginx применяется вручную по этой инструкции.

## Другие настройки сервера (не в git, зафиксированы здесь)

- `/etc/systemd/journald.conf.d/size.conf` — `SystemMaxUse=200M`. Диск VPS 8,7 ГБ, журнал
  systemd вырастал до ~900 МБ и занимал десятую часть диска. Вернуть размер вручную:
  `journalctl --vacuum-size=200M`, потом `systemctl restart systemd-journald`.
- Открыты только 22, 80, 443 (ufw); `unattended-upgrades` включены. fail2ban: jail-ы
  `sshd`, `nginx-limit-req`, `vfd74-probe` (с 2026-11-05; бан — только на 80/443).
  Статус: `fail2ban-client status vfd74-probe`.
- `/models/` отвечает 404 (`location = /models/` в `vfd74.ru.conf`); у файловых папок
  (`/media/`, `/_astro/`) 403 — так и задумано.
