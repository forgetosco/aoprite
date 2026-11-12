# AOprite — Editor de Pixel Art e Animações

**Estúdio e titular dos direitos autorais:** Forge Tosco  
**Ano:** 2026 (12 de novembro de 2026)  
**Licença:** MIT  
**Arquitetura:** HTML5, CSS3 e JavaScript puros (zero frameworks, zero dependências externas, 100% offline)

---

## 1. Apresentação

O **AOprite** é um editor independente de pixel art e animações quadro a quadro projetado prioritariamente para dispositivos **Android** e telas sensíveis ao toque (orientação vertical/retrato prioritária com suporte adaptativo a paisagem).

Construído em um único arquivo HTML autocontido acompanhado de recursos opcionais de **Progressive Web App (PWA)**, o AOprite funciona:
- **Como aplicativo instalável (PWA)** na tela inicial do Android via HTTPS (ex.: GitHub Pages), com cache completo via Service Worker para inicialização e uso 100% offline.
- **Como arquivo HTML local autocontido (`index.html` / `AOprite.html`)**, podendo ser aberto diretamente do armazenamento do celular ou computador sem servidor local e sem conexão com a internet.

---

## 2. Funcionalidades Principais

### Desenho e Grade
- **Grades predefinidas e personalizadas:** 8×8, 16×16, 32×32 ou qualquer dimensão configurável de **1×1 até 64×64 pixels**.
- **Redimensionamento não-destrutivo:** Altere a largura e a altura preservando o conteúdo desenhado em todos os quadros, ou crie um novo sprite em branco.
- **Renderização pixel-perfect:** Ampliação nítida (`image-rendering: pixelated`), fundo quadriculado indicador de transparência, linhas de grade opcionais com guias centrais e controle de zoom (`-`, `FIT`, `+`).
- **Modo de Tela Cheia:** Controle visível no cabeçalho (`TELA` / `SAIR`) com suporte à Fullscreen API nativa e fallback automático para modo expandido em navegadores ou WebViews que restrinjam a API nativa.

### Ferramentas de Edição e Histórico por Quadro
- **Lápis (`LÁPIS`):** Traço contínuo pixel-perfect com interpolação de Bresenham.
- **Borracha (`APAGAR`):** Restaura pixels para o estado transparente (`.`).
- **Balde (`BALDE`):** Preenchimento de área contínua (*Flood Fill* BFS 4-conectado).
- **Conta-gotas (`GOTAS`):** Captura a cor do pixel tocado e seleciona automaticamente o Lápis (ou a Borracha se o pixel for transparente).
- **Seleção Livre por Contorno (`LAÇO`):** Contorne livremente qualquer região do quadro atual para destacar, **mover** (arrastando com o dedo/mouse), **copiar**, **cortar**, **colar** ou **cancelar**, preservando a transparência dos pixels e o isolamento entre quadros.
- **Desfazer / Refazer (`DESFAZ` / `REFAZ`):** Histórico de até 60 passos isolado individualmente por quadro.

### Paleta Oficial PICO-8 (16 Cores + Transparência)
Adota exatamente os índices `0` a `F` (hexadecimal) e `.` para transparência, compatível com o motor de referência **Neon-AO 1.0**:

| Índice | Caractere | Hexadecimal | Nome de Referência |
| :---: | :---: | :---: | :--- |
| 0 | `0` | `#000000` | Preto |
| 1 | `1` | `#1D2B53` | Azul Escuro |
| 2 | `2` | `#7E2553` | Roxo Escuro |
| 3 | `3` | `#5F574F` | Cinza Escuro |
| 4 | `4` | `#C2C3C7` | Cinza Claro |
| 5 | `5` | `#FFF1E8` | Branco Quente |
| 6 | `6` | `#AB5236` | Marrom |
| 7 | `7` | `#FF004D` | Vermelho |
| 8 | `8` | `#FFA300` | Laranja |
| 9 | `9` | `#FFEC27` | Amarelo |
| 10 | `A` | `#FF77A8` | Rosa |
| 11 | `B` | `#FFCCAA` | Pêssego |
| 12 | `C` | `#008751` | Verde Escuro |
| 13 | `D` | `#00E436` | Verde Claro |
| 14 | `E` | `#29ADFF` | Azul Claro |
| 15 | `F` | `#83769C` | Lavanda |
| -1 | `.` | Transparente | Transparência |

### Sistema de Animações e Timeline Compacta
- **Operações de quadros:** Adicionar (`+Q`), duplicar (`DUP`), reordenar (`<` e `>`), remover (`DEL`) e selecionar qualquer quadro para edição individual.
- **Miniaturas em tempo real:** Visualização instantânea de cada quadro na faixa da timeline.
- **Reprodução e velocidade:** Reproduzir/pausar (`▶` / `⏸`), ajuste de velocidade de **1 a 24 FPS** e alternância de repetição contínua (`LOOP`).

---

## 3. Arquitetura Interna (Sete Subsistemas)

O código-fonte mantém separação rigorosa de responsabilidades em sete subsistemas sob o namespace `window.AOprite`:
1. **`AOprite.Palette`**: Definição imutável das 16 cores PICO-8 e conversão bidirecional entre índices (`0..15` / `-1`) e caracteres (`'0'..'F'` / `'.'`).
2. **`AOprite.Model`**: Modelo de dados do sprite (`SpriteModel`), gerenciamento de múltiplos quadros, dimensões, FPS, loop e conversão para matrizes textuais.
3. **`AOprite.History`**: Gerenciador de pilhas de Undo/Redo contextualizadas por ID de quadro (`HistoryManager`).
4. **`AOprite.Tools`**: Algoritmos geométricos de desenho (Bresenham, Flood Fill, Conta-gotas) e seleção poligonal livre por contorno (Laço com Ray-Casting even-odd, recorte, cópia, colagem e movimentação com preservação de transparência).
5. **`AOprite.Storage`**: Persistência local (`localStorage`), serialização/desserialização validada do formato `.aop` (v1.0 e v2.0) e codificadores puros para exportação em **PNG**, **GIF89a animado** (compressor LZW próprio), **JSON estruturado** e **JavaScript (Neon-AO 1.0)**.
6. **`AOprite.Renderer`**: Renderizador Canvas 2D pixel-perfect para o palco principal, grade, máscara de seleção do Laço e miniaturas da timeline.
7. **`AOprite.EditorController`**: Orquestração de eventos de toque/ponteiro, atalhos, barra de ferramentas, timeline, modais, tela cheia e instalação PWA.

---

## 4. Instruções Específicas para Android

### Opção A — Instalar como Aplicativo (PWA) na Tela Inicial (Recomendado)
1. Acesse a URL hospedada do AOprite (via HTTPS, como no GitHub Pages) usando o **Google Chrome** (ou navegador compatível com PWA) no Android.
2. Toque no botão **`APP`** na barra superior do AOprite (ou abra a janela **`.AOP`** e toque em **`INSTALAR APLICATIVO (PWA)`**).
3. Caso o navegador exiba o prompt automático, confirme em **Instalar**.
4. Alternativamente, toque no menu de três pontos (`⋮`) do Chrome no canto superior direito e selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
5. O ícone do **AOprite** será adicionado à tela inicial do Android e abrirá em janela dedicada (`standalone`), funcionando **100% offline** mesmo em modo avião.

### Opção B — Uso como Arquivo HTML Local Autocontido
1. Copie o arquivo `index.html` (ou `AOprite.html`) para qualquer pasta do seu dispositivo Android.
2. Abra o arquivo em qualquer navegador móvel.
3. O AOprite detecta automaticamente o protocolo local (`file://`), desativa chamadas de rede de Service Worker/Manifest para evitar bloqueios de segurança do navegador e mantém todas as ferramentas, animações e exportações funcionando integralmente offline.

---

## 5. Documentação do Formato Nativo `.aop` (v1.0 e v2.0)

O formato `.aop` é um arquivo JSON estruturado codificado em UTF-8. O AOprite garante **retrocompatibilidade total**:
- Projetos de 1 quadro são salvos com `"version": "1.0"` (`schemaVersion: 1`), e projetos com múltiplos quadros utilizam `"version": "2.0"` (`schemaVersion: 2`).
- Qualquer arquivo `.aop` v1.0 criado na Etapa 1 pode ser aberto, editado e expandido com novos quadros na versão atual.
- Arquivos corrompidos, malformados ou fora dos limites de dimensão (`1×1` a `64×64`) são rejeitados com segurança pela camada de validação sem afetar o projeto aberto no editor.

### Estrutura de Exemplo (`.aop` v2.0)
```json
{
  "format": "AOprite",
  "version": "2.0",
  "schemaVersion": 2,
  "id": "aop_1762950000000_101",
  "name": "Moeda Girando",
  "width": 8,
  "height": 8,
  "fps": 10,
  "loop": true,
  "transparentSymbol": ".",
  "palette": [
    { "index": 0, "char": "0", "hex": "#000000" }
  ],
  "pixels": [-1, 9, 9, -1],
  "matrix": [
    "..9999..",
    ".988889."
  ],
  "activeFrameIndex": 0,
  "frames": [
    {
      "id": "frame_0",
      "index": 0,
      "duration": 100,
      "pixels": [-1, 9, 9, -1],
      "matrix": [
        "..9999..",
        ".988889."
      ]
    }
  ],
  "animations": [
    {
      "name": "default",
      "fps": 10,
      "loop": true,
      "frameOrder": [0]
    }
  ],
  "metadata": {
    "app": "AOprite",
    "stage": 3,
    "copyright": "Forge Tosco (2026)",
    "license": "MIT",
    "createdAt": "2026-11-12T00:00:00.000Z",
    "updatedAt": "2026-11-12T00:00:00.000Z",
    "selectedColor": 9,
    "showGrid": true
  }
}
```

---

## 6. Documentação das Exportações e Compatibilidade com Neon-AO 1.0

Na janela **`.AOP`** do cabeçalho, o AOprite oferece quatro formatos de exportação além do arquivo nativo `.aop`:

1. **`EXPORTAR PNG` (Imagem Estática):**
   - Gera um arquivo `.png` RGBA de 32 bits do quadro atualmente selecionado, nas dimensões exatas da grade e com fundo transparente real (`alpha = 0` nos pixels `.`).
2. **`EXPORTAR GIF` (Animação Completa):**
   - Codifica todos os quadros da timeline em um arquivo **GIF89a animado** utilizando compressor LZW próprio em JavaScript puro, preservando a velocidade configurada (FPS), a repetição em loop (extensão Netscape 2.0) e o índice de transparência.
3. **`EXPORTAR JSON` / `IMPORTAR JSON` (Dados Estruturados):**
   - Exporta e reimporta arquivos `.json` no formato `AOprite-JSON` v2.0 contendo dimensões, paleta PICO-8, FPS, duração em milissegundos/segundos, ordem dos quadros, vetores numéricos `pixels` e matrizes textuais `matrix`.
4. **`EXPORTAR JS (NEON-AO 1.0)` (Código JavaScript Pronto para Jogo):**
   - Gera um módulo `.js` diretamente utilizável no motor **Neon-AO 1.0** sem necessidade de alterar o motor:
     - **Sprites de 1 quadro:** Define `<NOME>_MATRIX` e compila `<NOME>_SPRITE` via `NeonAO.Graphics.createSprite(<NOME>_MATRIX)` para renderização direta com `gfx.drawSprite(<NOME>_SPRITE, x, y)`.
     - **Animações de múltiplos quadros:** Define `<NOME>_FRAMES`, `<NOME>_FPS`, `<NOME>_FRAME_DURATION`, `<NOME>_LOOP` e a função auxiliar `create<NOME>Animator()` que instancia `new NeonAO.SpriteAnimator(<NOME>_FRAMES, <NOME>_FRAME_DURATION, <NOME>_LOOP)`.

---

## 7. Publicação no GitHub e Hospedagem no GitHub Pages (HTTPS)

A estrutura de arquivos do projeto foi preparada com caminhos relativos (`./manifest.json`, `./sw.js`, `./icons/...`) e arquivo `.nojekyll`, garantindo funcionamento imediato tanto em domínio próprio quanto em subdiretórios do GitHub Pages (`https://<usuario>.github.io/<repositorio>/`).

### Estrutura de Publicação
```text
/
├── index.html                  # Aplicação completa autocontida (HTML + CSS + JS)
├── AOprite.html                # Cópia nomeada para uso local/portátil direto
├── manifest.json               # Web App Manifest com caminhos relativos (./)
├── sw.js                       # Service Worker offline-first relativo ao escopo
├── .nojekyll                   # Desativa processamento Jekyll no GitHub Pages
├── README.md                   # Documentação completa do projeto
├── LICENSE                     # Licença MIT — Copyright (c) 2026 Forge Tosco
└── icons/
    ├── icon.svg                # Ícone vetorial pixel-perfect
    ├── icon-192.png            # Ícone PWA 192×192 (purpose: any)
    ├── icon-512.png            # Ícone PWA 512×512 (purpose: any)
    ├── icon-maskable-512.png   # Ícone adaptável Android 512×512 (purpose: maskable)
    └── apple-touch-icon.png    # Ícone 180×180 para iOS/Safari
```

### Passo a Passo para Publicar no GitHub Pages
1. Crie um novo repositório público no GitHub (ex.: `aoprite`).
2. Envie os arquivos da raiz de publicação (`index.html`, `manifest.json`, `sw.js`, `.nojekyll`, `README.md`, `LICENSE` e a pasta `icons/`) para a branch `main`.
3. No GitHub, acesse **Settings** → **Pages** no menu lateral do repositório.
4. Em **Build and deployment** → **Source**, selecione **Deploy from a branch**.
5. Escolha a branch **`main`** e a pasta **`/ (root)`**, e clique em **Save**.
6. Aguarde cerca de 1 minuto até que o GitHub Pages disponibilize a URL com **HTTPS** (`https://<seu-usuario>.github.io/<nome-do-repositorio>/`).
7. Acesse a URL HTTPS pelo navegador no Android para instalar o PWA na tela inicial e utilizá-lo offline.

---

## 8. Privacidade, Segurança e Persistência Local

- **Zero coleta de dados:** O AOprite não realiza telemetria, analytics, sincronização em nuvem nem envia dados para servidores externos.
- **Armazenamento estritamente local:** Os projetos e a sessão ativa são gravados exclusivamente no `localStorage` do navegador do dispositivo (`aoprite_v1_saved_projects` e `aoprite_v1_working_project`) ou exportados diretamente em arquivos locais pelo usuário.
- **Ausência de metadados sensíveis:** Nenhum arquivo exportado (`.aop`, `.png`, `.gif`, `.json`, `.js`) inclui caminhos locais do sistema, identificadores de dispositivo ou dados pessoais.

---

## 9. Créditos e Direitos Autorais

- **Projeto:** AOprite — Editor de Pixel Art e Animações
- **Estúdio e Titular dos Direitos Autorais:** Forge Tosco
- **Ano:** 2026 (12 de novembro de 2026)
- **Licença do Código e Documentação:** [MIT License](./LICENSE)
- **Referência Técnica de Paleta e Matrizes:** A paleta de 16 cores segue o padrão clássico PICO-8 adotado pelo motor de referência Neon-AO 1.0. Nenhum código proprietário de terceiros nem o motor Neon-AO inteiro foram incorporados ao AOprite.
