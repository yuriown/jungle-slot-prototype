# 🎰 Cosmic Nova • iGaming Slot Machine Prototype
### *Frontend Game Developer Showcase • Jungle Gaming*

> Protótipo jogável de alta performance de um caça-níqueis de vídeo (*5x3 Video Slot*) desenvolvido em **React 18**, **TypeScript** e **PixiJS (v8)**, simulando a arquitetura completa de um jogo de cassino online (*iGaming*) com backend autoritativo via WebSocket.

---

## 🎮 Demonstração & Quickstart

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev

# 3. Acesse no navegador:
# http://localhost:5173
```

Para validar a integridade de tipagem e gerar a build de produção:
```bash
npm run build
```

---

## 🎯 Alinhamento com a Vaga (Jungle Gaming)

Este projeto foi construído para demonstrar na prática as competências fundamentais da vaga de **Junior Frontend Game Developer**:

| Requisito Jungle Gaming | Implementação no Projeto |
| :--- | :--- |
| **Mecânicas e Animações 2D com PixiJS** | 5 rolos verticais com física de aceleração contínua, amortecimento elástico (*bounce-back*) baseado na Lei de Hooke, raios laser de paylines e sistema de partículas estelares a **60 FPS estáveis**. |
| **Interfaces de Jogo com React & TypeScript** | Interface reativa componentizada, modal customizado de Auto Spin (com presets e contador fino), atalhos de teclado (Barra de Espaço), modo Turbo e Fullscreen. |
| **Arquitetura Autoritativa & WebSockets** | Backend simulado (`MockSlotServer`) com comunicação assíncrona por eventos, cálculo de RTP (~96.5%), latência dinâmica com jitter e painel inspetor de frames WebSocket em tempo real. |
| **Separação de Responsabilidades** | Isolamento de ciclo de vida e estado através do custom hook `useSlotGame`, garantindo que o PixiJS gerencie a renderização WebGL e o React gerencie a UI sem re-renderizações desnecessárias. |
| **Profiling, Debugging & Testabilidade** | Monitor de FPS e Frame Time (ms) em tempo real, sandbox para injeção de cenários de teste (*Jackpot 5x WILD*, *Big Win*, *Near Miss*) e controle de latência de rede. |

---

## 🏛️ Arquitetura do Sistema

```
                      ┌────────────────────────────────────────┐
                      │              React UI Layer            │
                      │  (Header, BottomControls, Modals, Dev) │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          useSlotGame() Hook            │
                      │  (State Machine, AutoSpin, Controller) │
                      └───────────┬────────────────┬───────────┘
                                  │                │
            ┌─────────────────────┴──────┐         └────────────────────┐
            ▼                            ▼                              ▼
┌───────────────────────┐   ┌───────────────────────────┐   ┌────────────────────────┐
│  PixiJS Game Engine   │   │     Mock WebSocket API    │   │      Sound Service     │
│   (SlotEngine.ts)     │   │    (mockSlotServer.ts)    │   │    (soundService.ts)   │
├───────────────────────┤   ├───────────────────────────┤   ├────────────────────────┤
│ • 5x Reel Controllers │   │ • Authoritative RNG       │   │ • Web Audio API Synth  │
│ • Symbol Sprite Pool  │   │ • Payline Evaluator       │   │ • Spin Hum & Reel Thud │
│ • Payline Laser Layer │   │ • Latency & Jitter Sim    │   │ • Win Chimes & Fanfare │
│ • Star Particle Burst │   │ • JSON Frame Emitter      │   │ • Zero External Files  │
│ • 60 FPS Ticker Loop  │   │ • Live Stream Logger      │   │ • Instant Load Time    │
└───────────────────────┘   └───────────────────────────┘   └────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   └── slot.types.ts         # Contratos TypeScript estritos (Símbolos, Paylines, Frames WS)
├── hooks/
│   └── useSlotGame.ts        # Custom hook com a orquestração do jogo e controle de Auto Spin
├── services/
│   ├── mockSlotServer.ts     # Servidor Mock autoritativo (RNG, latência, RTP ~96.5%, Hit Rate ~26.5%)
│   └── soundService.ts       # Síntese sonora procedural via Web Audio API
├── game/
│   ├── SlotEngine.ts         # Controlador central PixiJS v8 (Scene Graph, Ticker, Resize, Cleanup)
│   ├── Reel.ts               # Coluna de rolo individual com física de aceleração e amortecimento elástico
│   ├── SymbolSprite.ts       # Renderização vetorial e procedural de símbolos em alta resolução
│   ├── PaylineOverlay.ts     # Traçado dinâmico de raios laser nas combinações vencedoras
│   ├── ParticleSystem.ts     # Emitter de partículas (poeira estelar de fundo e explosão de vitória)
│   └── slotConfig.ts         # Configurações de grid, 10 paylines, tabela de pagamentos e física
├── components/
│   ├── SlotGameCanvas.tsx    # Wrapper React do Canvas com ciclo de vida e destroy() seguro
│   ├── GameHeader.tsx        # Medidor 60 FPS, Ping WS, Toggle Áudio, Fullscreen e Modais
│   ├── BottomControls.tsx    # Saldo, Último Ganho, Bet +/-, Turbo, Auto Spin e Hero SPIN
│   ├── AutoSpinModal.tsx     # Modal centralizado de configuração de rodadas automáticas
│   ├── NetworkLogPanel.tsx   # Painel lateral de streaming de pacotes WebSocket e Sandbox Dev
│   ├── PaytableModal.tsx     # Tabela de multiplicadores de símbolos e diagramas das 10 paylines
│   ├── BigWinOverlay.tsx     # Celebração animada para Big Win (>=15x) e Mega Jackpot (>=40x)
│   └── StatsModal.tsx        # Estatísticas de sessão, total apostado/pago e cálculo de RTP em tempo real
├── index.css                 # Design system Cyberpunk/Neon com glassmorphism e responsividade
├── App.tsx                   # Componente raiz declarativo
└── main.tsx
```

---

## 🔬 Destaques de Engenharia para a Entrevista

### 1. Gestão de Ciclo de Vida do WebGL & PixiJS v8
- O componente `SlotGameCanvas` gerencia o Canvas via `useRef` e `useEffect`.
- Ao desmontar o componente ou redimensionar a tela, o método `destroy()` é executado com liberação explícita de texturas e nós do *Scene Graph*, prevenindo vazamentos de memória (*memory leaks*) e perda de contexto WebGL.

### 2. Física dos Rolos e Efeito de Bounce
- O movimento dos rolos utiliza um buffer vertical cíclico (3 linhas visíveis + 1 linha superior + 1 linha inferior de margem).
- Ao receber o resultado do servidor, cada rolo para de forma escalonada (Rolo 1 ao 5) e aciona um amortecimento de mola com física harmônica amortecida (*spring damping*), simulando o peso mecânico de caça-níqueis físicos.

### 3. Modelo Matemático Equilibrado (Medium Volatility)
- **Hit Frequency**: ~26.5% (em média 1 vitória a cada 3.5 a 4 rodadas).
- **RTP Teórico**: ~96.5%.
- **Símbolo WILD (5%)**: Atua como coringa e substitui qualquer símbolo para conectar combinações da esquerda para a direita.

### 4. Sandbox de Injeção de Cenários (Network Dev)
No painel lateral **Network Dev**, é possível testar e demonstrar cenários específicos:
- 💎 **Jackpot Épico (5x WILD)**: 5 coringas alinhados na linha central com celebração de Big Win.
- 🚀 **Big Win (Foguetes 5x)**: Combinações múltiplas simultâneas com foguetes espaciais.
- 🌌 **Vitória Multi-Linha**: Conexões premiadas em 3 linhas distintas.
- ⚡ **Near Miss (Suspense)**: 2 Wilds nos primeiros rolos e parada sem ganho no 3º rolo.
- ❌ **Loss**: Rodada sem ganho.
- ⏱️ **Controle de Latência**: Slider de 30ms a 1500ms com jitter dinâmico para demonstrar resiliência com lag.

---

## 🛠️ Tecnologias Utilizadas

- **React 18**
- **TypeScript 5**
- **PixiJS 8** (WebGL2 / WebGPU)
- **Vite**
- **Web Audio API**
- **Lucide React** (Ícones da interface)
- **Canvas Confetti** (Efeitos comemorativos)

---

Desenvolvido com foco em **Game Feel**, **Performance 60 FPS** e **Código Limpo**.
