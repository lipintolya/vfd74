# nginx для vfd74.ru

Рабочая копия конфига лежит в репозитории, чтобы он не жил только на сервере.

| Файл | Куда на сервере |
|---|---|
| `vfd74.ru.conf` | `/etc/nginx/sites-available/vfd74.ru` |
| `vfd74-perf.conf` | `/etc/nginx/conf.d/vfd74-perf.conf` |

Что внутри: кеш-заголовки одной переменной (`$vfd_cache_control`), Brotli, HSTS,
корректный тип для `site.webmanifest`. Подробности — в комментариях файлов.

Применить (с бэкапом и проверкой):

```bash
apt-get install -y libnginx-mod-http-brotli-filter     # один раз
cp -a /etc/nginx /root/nginx-backup-$(date +%Y%m%d-%H%M%S)
scp deploy/nginx/vfd74-perf.conf root@SERVER:/etc/nginx/conf.d/
scp deploy/nginx/vfd74.ru.conf   root@SERVER:/etc/nginx/sites-available/vfd74.ru
ssh root@SERVER 'nginx -t && systemctl reload nginx'
```

Откат: вернуть файлы из `/root/nginx-backup-*`, `nginx -t`, `systemctl reload nginx`.

Заголовки не должны зависеть от git-деплоя: `git push production` их не меняет —
конфиг nginx применяется вручную по этой инструкции.
