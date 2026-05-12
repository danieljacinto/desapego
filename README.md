# desapego.

Site minimalista para desapego de itens usados. 100% estático, hospedado no GitHub Pages.

## 🚀 Início rápido

```bash
npm install
npm run dev        # Site público em http://localhost:5173
npm run admin      # Painel admin em http://localhost:5174
```

## 📦 Estrutura do projeto

```
desapego/
├── public/
│   ├── products.json     ← dados dos produtos (edite aqui!)
│   ├── config.json       ← configurações (WhatsApp, nome, etc.)
│   └── images/           ← fotos dos itens
├── src/                  ← código do site público
├── admin/                ← painel administrativo (local)
└── .github/workflows/    ← deploy automático
```

## ✏️ Como adicionar um novo item

### Via painel admin (recomendado)
1. `npm run admin`
2. Preencha o formulário e clique em **Adicionar item**
3. Vá em **Exportar** e baixe o `products.json`
4. Mova o arquivo para `public/products.json`
5. Mova a foto para `public/images/nome-da-foto.jpg`
6. Faça commit e push

### Editando o JSON diretamente
Abra `public/products.json` e adicione um objeto:

```json
{
  "id": "abc123",
  "slug": "nome-do-item",
  "title": "Nome do Item",
  "description": "Descrição opcional do item.",
  "status": "available",
  "image": "/images/nome-do-item.jpg",
  "createdAt": "2024-01-20"
}
```

## ✅ Como marcar item como vendido

No painel admin: clique no ícone ✓ ao lado do item.

Ou edite `products.json` e mude `"status": "available"` para `"status": "sold"`.

## 📱 Como alterar o número do WhatsApp

**Via painel admin:** vá em **Configurações** e edite o campo "Número do WhatsApp".

**Via arquivo:** abra `public/config.json` e edite:
```json
{
  "whatsappNumber": "5511999999999"
}
```
> Formato: DDI + DDD + número, apenas dígitos. Ex: `5511987654321`

## 🌐 Deploy no GitHub Pages

### Primeira vez
1. Crie um repositório no GitHub
2. Vá em **Settings → Pages → Source** e selecione **GitHub Actions**
3. Faça push do projeto:

```bash
git init
git add .
git commit -m "primeiro commit"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

4. O GitHub Actions vai rodar e publicar automaticamente.

### Atualizações
```bash
npm run build          # opcional, só para testar
git add .
git commit -m "atualiza produtos"
git push
```

O deploy acontece automaticamente em ~1 minuto.

## 🔧 Customização avançada

### Mudar cores
Edite as variáveis CSS em `src/index.css`:
```css
:root {
  --color-bg: #fafaf8;        /* fundo */
  --color-accent: #1a1816;   /* cor de destaque */
}
```

### Mudar fontes
Edite os links do Google Fonts em `index.html` e as variáveis `--font-display` e `--font-body` no CSS.

## 📁 Formatos de imagem suportados
- JPG / JPEG
- PNG
- WEBP (recomendado, menor tamanho)

Tamanho sugerido: **800×600px** ou proporção 4:3.
