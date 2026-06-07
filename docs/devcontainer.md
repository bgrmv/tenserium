# Dev-container — руководство

## Что это и зачем

Dev-container — изолированная Linux-среда (Docker), идентичная CI (GitHub Actions = Ubuntu).
Вся разработка, сборка и тесты ведутся внутри контейнера; на Windows нужен только Docker и VS Code.

| Аспект | Локально (Windows) | Dev-container |
|--------|--------------------|---------------|
| Node.js | Установлен вручную, версия любая | Node 24, закреплена в образе |
| pnpm | Глобально установлен | Управляется через `corepack` по `packageManager` в `package.json` |
| Кэш pnpm | `%LOCALAPPDATA%\pnpm\store` | Именованный Docker volume `tenserium-pnpm-store` |
| Соответствие CI | Не гарантировано | 1-в-1 с GitHub Actions |
| Линейные окончания | Windows CRLF (надо настраивать) | LF из коробки |

---

## Требования

- **Docker Desktop** (Windows) — запущен и работает
- **VS Code** с расширением [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

---

## Первый запуск

1. Открыть папку проекта в VS Code.
2. VS Code покажет уведомление «Reopen in Container» → нажать.
   Альтернатива: `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**.
3. Первый запуск скачивает образ (~1 GB) и устанавливает зависимости — занимает 3–5 минут.
4. После открытия терминал уже внутри контейнера. Проверить:
   ```bash
   node -v   # v24.x.x
   pnpm -v   # 10.x.x
   ```

## Повторный запуск

Контейнер сохраняет состояние между сессиями. Просто выбрать **Reopen in Container** — зависимости уже установлены, установка не повторяется.

---

## Основные команды

```bash
pnpm start          # dev-сервер на http://localhost:4200
pnpm build          # production-сборка
pnpm test           # Vitest (unit-тесты)
pnpm lint           # ESLint
```

Порт 4200 пробрасывается автоматически — приложение открывается в браузере на хосте.

---

## Пересборка контейнера

Нужна, если изменился `.devcontainer/devcontainer.json` или образ:

`Ctrl+Shift+P` → **Dev Containers: Rebuild Container**

При пересборке `postCreateCommand` выполняется заново (`pnpm install`).
Docker volume с кэшем pnpm (`tenserium-pnpm-store`) сохраняется между пересборками.

---

## Структура `.devcontainer/devcontainer.json`

```jsonc
{
  "image": "mcr.microsoft.com/devcontainers/javascript-node:24",
  // pnpm store вынесен в отдельный volume — не теряется при пересборке
  "mounts": ["source=tenserium-pnpm-store,target=/pnpm-store,type=volume"],
  // corepack читает packageManager из package.json и устанавливает нужную версию pnpm
  "postCreateCommand": "corepack enable && corepack install && pnpm config set store-dir /pnpm-store && pnpm install",
  "forwardPorts": [4200]
}
```

---

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| Docker не запущен | Запустить Docker Desktop |
| `pnpm install` завис на первом запуске | Подождать — скачиваются пакеты; повторить **Rebuild** если завис >10 мин |
| Порт 4200 не открывается в браузере | VS Code → вкладка **Ports** → убедиться, что 4200 пробрасывается |
| Нужно обновить версию Node | Изменить тег образа в `devcontainer.json` (`javascript-node:24` → `javascript-node:26`) и выполнить **Rebuild** |
