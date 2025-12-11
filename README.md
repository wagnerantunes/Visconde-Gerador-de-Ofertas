# 🥩 Gerador de Ofertas - Visconde Carnes

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📋 Sobre o Projeto

Aplicação React moderna para criar **flyers de ofertas profissionais** para açougues e mercados. Com interface intuitiva e recursos avançados de customização.

## ✨ Funcionalidades

### 🎨 **Temas Sazonais**
- 8 temas pré-configurados (Semana, FDS, Carnaval, Páscoa, Junino, Natal, Ano Novo, Black Friday)
- Cores e ícones personalizados para cada tema
- Padrões de fundo exclusivos

### 🎯 **Gerenciamento de Produtos**
- ✅ **Adicionar produtos individualmente** com upload de imagem
- ✅ **Colar lista em lote** - parse automático de texto (ex: "Picanha - 69.90")
- ✅ **Editar produtos** inline
- ✅ **Remover produtos** com um clique
- ✅ **Drag & Drop** para reordenar produtos
- ✅ Produtos em **destaque** (ocupam 2 colunas)

### 🎨 **Customização Completa**
- **Cabeçalho**: Nome da loja, título, subtítulo, upload de logo
- **Rodapé**: Endereços, telefone, redes sociais
- **Layout**: Formato (Portrait/Story), número de colunas (1-5)
- **Data de validade** customizável

### 💾 **Persistência e Exportação**
- ✅ **Auto-save** no localStorage
- ✅ **Download** do flyer em PNG de alta qualidade
- ✅ Zoom ajustável (25% - 150%)

## 🚀 Como Usar

### Pré-requisitos
- Node.js instalado

### Instalação

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure a API Key do Gemini** (opcional):
   - Edite o arquivo `.env.local`
   - Adicione: `GEMINI_API_KEY=sua_chave_aqui`

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

## 📖 Guia de Uso

### 1️⃣ **Escolha o Tema**
- Vá na aba **"Tema"**
- Selecione o tema sazonal (ex: Carnaval, Natal)
- Ajuste formato e colunas

### 2️⃣ **Configure o Cabeçalho**
- Aba **"Cabeçalho"**
- Faça upload do logo (opcional)
- Edite nome da loja e textos

### 3️⃣ **Configure o Rodapé**
- Aba **"Rodapé"**
- Adicione endereços e telefone

### 4️⃣ **Adicione Produtos**
- Aba **"Produtos"**
- **Opção 1**: Adicione um por vez com foto
- **Opção 2**: Cole uma lista completa (ex: "Picanha - 69.90")
- **Opção 3**: Gerencie a lista (editar/remover/reordenar)

### 5️⃣ **Baixe o Flyer**
- Ajuste o zoom se necessário
- Clique no botão **Download** (ícone de download)
- Imagem PNG será salva automaticamente

## 🎨 Formatos de Lista Suportados

Ao usar "Colar Lista", você pode usar qualquer um destes formatos:

```
Picanha - 69.90
Contra Filé R$ 45.00
Linguiça Toscana 18,90 KG
Fraldinha - R$ 39,90
```

O sistema detecta automaticamente:
- Nome do produto
- Preço (com ou sem R$, vírgula ou ponto)
- Unidade (KG, Unid., Pct, 100g)

## 🛠️ Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **@dnd-kit** - Drag & Drop
- **html2canvas** - Geração de imagens
- **LocalStorage** - Persistência de dados

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 🔗 Links

- **AI Studio**: https://ai.studio/apps/drive/1pHiFMyTRagRH4WPS8evnQG5JpNRYfU_E
- **Documentação React**: https://react.dev
- **Documentação Vite**: https://vitejs.dev

## 📝 Licença

Projeto privado - Visconde Carnes © 2025

---

**Desenvolvido com ❤️ para facilitar a criação de ofertas incríveis!**
