# Design System — Cobrança Inteligente

## Scene

Administrador em sala com monitor grande (tema claro, sidebar escura). Cobrador e cliente ao ar livre no celular (superfícies sólidas, alto contraste).

## Color Strategy

Restrained — neutros puros com acento preto ≤10% da superfície.

### Primitives (OKLCH)

| Token | Light | Dark |
|-------|-------|------|
| `--bg-base` | oklch(0.97 0 0) | oklch(0.12 0 0) |
| `--bg-surface` | oklch(1 0 0) | oklch(0.16 0 0) |
| `--bg-muted` | oklch(0.94 0 0) | oklch(0.2 0 0) |
| `--bg-sidebar` | oklch(0.14 0 0) | oklch(0.08 0 0) |
| `--text-primary` | oklch(0.14 0 0) | oklch(0.96 0 0) |
| `--text-secondary` | oklch(0.42 0.018 250) | oklch(0.72 0.012 240) |
| `--text-muted` | oklch(0.52 0.014 250) | oklch(0.58 0.012 240) |
| `--accent` | oklch(0.14 0 0) | oklch(0.96 0 0) |
| `--accent-fg` | oklch(0.99 0 0) | oklch(0.14 0.02 250) |
| `--border` | oklch(0.88 0.01 240) | oklch(0.28 0.014 250) |
| `--destructive` | oklch(0.55 0.2 25) | oklch(0.62 0.18 25) |
| `--success` | oklch(0.52 0.14 155) | oklch(0.65 0.13 155) |
| `--warning` | oklch(0.68 0.14 75) | oklch(0.75 0.12 75) |

## Typography

- **Family**: IBM Plex Sans (UI), IBM Plex Mono (dados)
- **Scale**: 0.6875rem · 0.75rem · 0.8125rem · 0.875rem · 1rem · 1.125rem · 1.25rem · 1.5rem
- **Headings**: peso 600, sem caixa alta decorativa

## Spacing & Radius

- Base 4px; painéis `--radius-panel: 10px`; controles `--radius-control: 8px`
- Sombras: apenas `--shadow-panel` e `--shadow-elevated` (sem glow)

## Z-Index

dropdown 30 · sticky 40 · overlay 50 · modal 60 · toast 70

## Components

Button · Input · Select · Badge · Panel · Dialog · Tabs · MetricStrip · IconButton · BottomNav · AdminSidebar

## Bans

Sem `backdrop-blur` decorativo · sem gradient text · sem side-stripe borders · sem emoji