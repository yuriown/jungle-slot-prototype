# 🎰 Cosmic Nova 777 • Slot Machine Showcase (React + TypeScript + Pixi.js)

Aplicação web interativa de caça-níqueis (iGaming) desenvolvida com **React 18**, **TypeScript** e **PixiJS (v8)**, projetada especialmente para apresentações e testes técnicos de **Frontend Game Developer Júnior**.

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências (já instaladas)
npm install

# 2. Executar o servidor de desenvolvimento
npm run dev

# 3. Acesse a aplicação no navegador em:
# http://localhost:5173
```

---

## 🏛️ Arquitetura e Estrutura do Código

```
src/
├── types/
│   └── slot.types.ts         # Contratos tipados estritos (Símbolos, Paylines, WebSocket Payloads, Logs)
├── services/
│   ├── mockSlotServer.ts     # Servidor Mock autoritativo simulando WebSocket (RNG, latência, RTP 96.5%)
│   └── soundService.ts       # Síntese sonora procedural via Web Audio API (giro, parada, vitória, big win)
├── game/
│   ├── SlotEngine.ts         # Controlador central PixiJS v8 (Scene Graph, 60 FPS Ticker, Resize, Destroy)
│   ├── Reel.ts               # Coluna de rolo individual com física de aceleração e bounce back elástico
│   ├── SymbolSprite.ts       # Renderização vetorial e procedural de símbolos de alta fidelidade
│   ├── PaylineOverlay.ts     # Traçado dinâmico de raios laser e linhas de pagamento vencedoras
│   ├── ParticleSystem.ts     # Emitter de partículas (poeira estelar e explosões de vitória)
│   └── slotConfig.ts         # Configurações de rolos, 10 paylines, tabela de pagamentos e física
├── components/
│   ├── SlotGameCanvas.tsx    # Wrapper React com ciclo de vida (useRef/useEffect/destroy)
│   ├── GameHeader.tsx        # Medidor 60 FPS, Latência WS, Toggle Áudio e Botões de Modais
│   ├── BottomControls.tsx    # Saldo, Último Ganho, Seletores de Aposta, Turbo, Auto Spin e Hero SPIN
│   ├── NetworkLogPanel.tsx   # Painel lateral com inspetor de frames WebSocket e Sandbox de testes
│   ├── PaytableModal.tsx     # Tabela de multiplicadores de símbolos e diagramas das 10 paylines
│   ├── BigWinOverlay.tsx     # Celebração animada para Big Win (>=15x) e Mega Jackpot (>=40x)
│   └── StatsModal.tsx        # Estatísticas de sessão, total apostado/pago e cálculo de RTP em tempo real
├── index.css                 # Sistema de design Cyberpunk/Neon com glassmorphism e responsividade
├── App.tsx                   # Orquestrador React e sincronização com o Mock WebSocket
└── main.tsx
```

---

## 💡 Pontos-Chave para a Entrevista Técnica

### 1. Separação de Responsabilidades (React vs. PixiJS)
- **React**: Gerencia todo o estado da interface do usuário (UI), saldo, formulários de aposta, modais informativos e renderização do painel de rede.
- **PixiJS**: Gerencia a renderização gráfica de alta performance com WebGL/WebGPU a 60 FPS estáveis, utilizando um `Ticker` próprio e uma árvore de nós (`Scene Graph`).
- **Ponte de Comunicação**: O componente [SlotGameCanvas.tsx](file:///c:/Users/yuris/OneDrive/Área%20de%20Trabalho/prototipo/src/components/SlotGameCanvas.tsx) atua como ponte, expondo métodos imperativos controlados e garantindo a destruição de instâncias (`app.destroy(true)`) no hook `useEffect` para evitar vazamento de memória (*memory leaks*) e perda de contexto WebGL.

### 2. Backend Autoritativo (Mock WebSocket Server)
- Em conformidade com os padrões regulatórios da indústria de iGaming, **nenhum cálculo de ganho é realizado no cliente**.
- O cliente apenas despacha o evento `SPIN_REQUEST` para o `MockSlotServer`.
- O servidor processa o RNG, avalia as 10 linhas de pagamento, deduz a aposta, credita os ganhos e responde com `SPIN_RESPONSE`.
- Os rolos aceleram e desaceleram na combinação **exata** retornada pelo servidor.

### 3. Física de Giro e Animações
- **Aceleração e Velocidade Máxima**: Aceleração progressiva durante a espera da resposta de rede.
- **Parada Escalonada (Staggered Stop)**: Parada sequencial do Rolo 1 ao Rolo 5 (com intervalo configurável entre Normal e Turbo).
- **Bounce Back Elástico**: Amortecimento harmônico ao travar o rolo, simulando o peso mecânico de máquinas de caça-níqueis reais.
- **Overlays de Paylines**: Desenho dinâmico de raios laser com brilho difuso (*glow*) conectando as coordenadas `(reel, row)` dos símbolos premiados.

### 4. Sandbox de Demonstração (Injeção de Cenários)
No painel **Network Dev**, você pode selecionar cenários pré-configurados durante a entrevista:
- 💎 **Jackpot Épico (5x WILD)**: 5 coringas alinhados na linha central com animação comemorativa de Big Win.
- 🚀 **Big Win (Foguetes 5x)**: Múltiplas linhas simultâneas com foguetes espaciais.
- 🌌 **Vitória Multi-Linha**: Combinações em 3 linhas distintas.
- ⚡ **Near Miss (Suspense)**: 2 Wilds nos primeiros rolos e parada sem vitória (efeito clássico de retenção).
- ❌ **Loss**: Rodada sem ganho.
- ⏱️ **Slider de Latência**: Teste de latência simulada de 30ms a 1500ms para demonstrar a consistência do estado assíncrono.
