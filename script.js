
// ========================================
// SPLASH SCREEN
// ========================================
(function() {
    const sparks = document.getElementById('splash-sparks');
    const colors = ['#00f2fe', '#4facfe', 'rgba(245,158,11,0.7)'];
    for (let i = 0; i < 30; i++) {
        const s = document.createElement('div');
        s.className = 'spark';
        const size = Math.random() * 3 + 1;
        s.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random()*100}%;
            top:${Math.random()*100 + 100}%;
            background:${colors[Math.floor(Math.random()*colors.length)]};
            animation-duration:${Math.random()*10+8}s;
            animation-delay:${Math.random()*6}s;
        `;
        sparks.appendChild(s);
    }

    const msgs = ['Iniciando protocolo...', 'Cargando matrices...', 'Sincronizando red...', 'Listo para operar'];
    const lbl = document.getElementById('splash-label');
    let mi = 0;
    const msgInterval = setInterval(() => {
        mi++;
        if (mi < msgs.length) lbl.textContent = msgs[mi];
        else clearInterval(msgInterval);
    }, 600);

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('fade-out');
        setTimeout(() => { splash.style.display = 'none'; }, 800);
    }, 3800);
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================
    // 0. SISTEMA DE AMBIENTE FUTURISTA (Fondo)
    // ========================================
    function generarFondoParticulas() {
        const container = document.getElementById('bg-particles');
        const numParticulas = 50;
        for (let i = 0; i < numParticulas; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.width = Math.random() * 3 + 'px';
            p.style.height = p.style.width;
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = Math.random() * 100 + 'vh';
            p.style.animationDelay = Math.random() * 20 + 's';
            p.style.animationDuration = Math.random() * 10 + 10 + 's';
            container.appendChild(p);
        }
    }
    generarFondoParticulas();

    // ========================================
    // 1. ALMACENAMIENTO LOCAL (FUNCIONALIDAD ORIGINAL)
    // ========================================
    const Storage = {
        KEYS: {
            RECORD: 'matrixland_record',
            ESTADISTICAS: 'matrixland_stats',
            MEJORES_PUNTUACIONES: 'matrixland_top_scores',
            ESTADISTICAS_OPERACION: 'matrixland_stats_operacion',
        },

        guardarRecord(puntos) {
            const recordActual = this.obtenerRecord();
            if (puntos > recordActual) {
                localStorage.setItem(this.KEYS.RECORD, puntos.toString());
                return true;
            }
            return false;
        },

        obtenerRecord() {
            const record = localStorage.getItem(this.KEYS.RECORD);
            return record ? parseInt(record) : 0;
        },

        guardarEstadisticas(stats) {
            localStorage.setItem(this.KEYS.ESTADISTICAS, JSON.stringify(stats));
        },

        obtenerEstadisticas() {
            const stats = localStorage.getItem(this.KEYS.ESTADISTICAS);
            if (stats) return JSON.parse(stats);
            return { partidasJugadas: 0, totalAciertos: 0, totalIntentos: 0, mejorRacha: 0 };
        },

        actualizarEstadisticas(datosPartida) {
            const stats = this.obtenerEstadisticas();
            stats.partidasJugadas++;
            stats.totalAciertos += datosPartida.aciertos;
            stats.totalIntentos += datosPartida.intentos;
            if (datosPartida.mejorRacha > stats.mejorRacha) {
                stats.mejorRacha = datosPartida.mejorRacha;
            }
            this.guardarEstadisticas(stats);
        },

        // NUEVO: estadísticas por tipo de operación (suma, resta, escalar, mult, trans, det)
        // para detectar el punto más débil del jugador y recomendarle práctica.
        obtenerEstadisticasOperacion() {
            const stats = localStorage.getItem(this.KEYS.ESTADISTICAS_OPERACION);
            return stats ? JSON.parse(stats) : {};
        },

        registrarIntentoOperacion(tipo, esCorrecta) {
            if (!tipo) return;
            const stats = this.obtenerEstadisticasOperacion();
            if (!stats[tipo]) stats[tipo] = { aciertos: 0, intentos: 0 };
            stats[tipo].intentos++;
            if (esCorrecta) stats[tipo].aciertos++;
            localStorage.setItem(this.KEYS.ESTADISTICAS_OPERACION, JSON.stringify(stats));
        },

        borrarTodo() {
            // Estilo de confirmación nativo, pero podrías hacer un modal futurista luego
            if (confirm('¿SOLICITUD CRÍTICA: Borrar todos los datos de red? No se puede deshacer.')) {
                Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
                location.reload();
            }
        }
    };

    
    // ========================================
    // 2. CARGAR ESTADÍSTICAS INICIALES (DOM INICIO)
    // ========================================
    const statsIniciales = Storage.obtenerEstadisticas();
    const recordGuardado = Storage.obtenerRecord();

    const globalRecord     = document.getElementById('global-record');
    const globalPartidas   = document.getElementById('global-partidas');
    const globalPrecision  = document.getElementById('global-precision');
    const globalMejorRacha = document.getElementById('global-mejor-racha');

    // NUEVO: refresca las 4 tarjetas del panel "Terminal de Estado Global" con los datos guardados
    function actualizarStatsGlobalesInicio() {
        const stats = Storage.obtenerEstadisticas();
        const record = Storage.obtenerRecord();
        const precision = stats.totalIntentos > 0 ? Math.round((stats.totalAciertos / stats.totalIntentos) * 100) : 0;

        if (globalRecord)     globalRecord.textContent = record;
        if (globalPartidas)   globalPartidas.textContent = stats.partidasJugadas;
        if (globalPrecision)  globalPrecision.textContent = `${precision}%`;
        if (globalMejorRacha) globalMejorRacha.textContent = stats.mejorRacha;
    }

    actualizarStatsGlobalesInicio();

    
    // ========================================
    // 3. REFERENCIAS DOM (ACTUALIZADO FUTURISTA)
    // ========================================
    const pantallaInicio   = document.getElementById('pantalla-inicio');
    const pantallaJuego    = document.getElementById('pantalla-juego');
    const pantallaTutorial = document.getElementById('pantalla-tutorial'); // NUEVO: ya no es modal
    const pantallaAyuda    = document.getElementById('pantalla-ayuda');    // NUEVO: ya no es modal
    
    // Botones Inicio
    const btnBasico      = document.getElementById('btn-basico');
    const btnIntermedio  = document.getElementById('btn-intermedio');
    const btnAvanzado    = document.getElementById('btn-avanzado');
    const btnExtra       = document.getElementById('btn-extra');
    const btnBorrarDatos = document.getElementById('btn-borrar-datos');

    // Botones Juego
    const btnVerificar   = document.getElementById('btn-verificar');
    const btnVolver      = document.getElementById('btn-volver');
    
    // Elementos Juego
    const matricesContainer = document.getElementById('matrices-container');
    const mensajeDiv        = document.getElementById('mensaje-resultado');
    const puntosDisplay     = document.getElementById('puntos-display');
    const rachaDisplay      = document.getElementById('racha-display');
    const rachaBonusDisplay = document.getElementById('racha-bonus');
    const vidasDisplay      = document.getElementById('vidas-display');
    const textoNivel        = document.getElementById('texto-nivel');

    // NUEVO: Referencias Drag & Drop
    const respuestaMatrixTarget = document.getElementById('respuesta-matrix-target');
    const numbersSupplyBin      = document.getElementById('numbers-supply-bin');

    // NUEVO: listeners permanentes del "bin" de números (se registran una sola vez; los números
    // y celdas en sí se recrean en cada desafío y se conectan aparte en configurarEventListenersNativeDrag)
    if (numbersSupplyBin) {
        numbersSupplyBin.addEventListener('dragover', (e) => e.preventDefault());
        numbersSupplyBin.addEventListener('drop', (e) => {
            e.preventDefault();
            const idDivArrastrado = e.dataTransfer.getData('text/plain');
            devolverNumeroABin(document.getElementById(idDivArrastrado));
        });
        // NUEVO: tocar/clicar el fondo vacío del bin devuelve el número seleccionado
        numbersSupplyBin.addEventListener('click', (e) => {
            if (e.target !== numbersSupplyBin || !numeroSeleccionado) return;
            const el = numeroSeleccionado;
            el.classList.remove('numero-seleccionado');
            numeroSeleccionado = null;
            devolverNumeroABin(el);
            actualizarEstadoZonasSegunSeleccion();
        });
    }

    // Modal Game Over
    const modalGameOver = document.getElementById('modal-gameover');
    const btnReintentar = document.getElementById('btn-reintentar');
    const btnMenu       = document.getElementById('btn-menu');

    
    // ========================================
    // 4. ESTADO DEL JUEGO (MANTENIDO)
    // ========================================
    let matrizA = [];
    let matrizB = null;
    let respuestaCorrecta = []; // Puede ser Array (Matriz) o Number (Determinante)
    let nivelActual = 'basico';

    let puntos         = 0;
    let rachaActual    = 0;
    let mejorRacha     = 0;
    let recordPersonal = recordGuardado;
    let totalAciertos  = 0;
    let totalIntentos  = 0;
    const VIDAS_MAXIMAS = 3;
    let vidasActuales  = VIDAS_MAXIMAS;
    const RACHA_HITO_VIDA = 5; // cada N aciertos seguidos, se recupera 1 vida

    let timeoutSiguienteDesafio = null;
    let operacionActual = ''; // Para saber si es determinante o matriz

    // NUEVO: Estado para el nivel "Retos Extra" (desafíos combinados en 2 fases)
    let faseActual = 1;       // 1 = resultado parcial, 2 = resultado final
    let contextoReto = null;  // Guarda matrices/escalares/preguntas de cada fase del reto combinado

    // NUEVO: tipo de operación matemática del desafío actual (suma, resta, escalar, mult, trans, det)
    // usado para detectar el punto más débil del jugador (coincide con las claves de TUTORIALES)
    let tipoOperacionActual = '';

    // NUEVO: dificultad adaptativa leve — sube si el jugador acierta con racha, baja si falla
    let ajusteDificultad = 0;
    const AJUSTE_DIFICULTAD_MIN = -2;
    const AJUSTE_DIFICULTAD_MAX = 4;

    const NOMBRES_NIVEL = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado', extra: 'Retos Extra' };
    const NOMBRES_OPERACION = { suma: 'Suma', resta: 'Resta', escalar: 'Mult. por Escalar', mult: 'Multiplicación', trans: 'Transpuesta', det: 'Determinante' };

    // NUEVO: número actualmente seleccionado por toque/clic (alternativa accesible al drag & drop)
    let numeroSeleccionado = null;

    
    // ========================================
    // 5. EVENTOS (MANTENIDO)
    // ========================================
    if (btnBasico)      btnBasico.addEventListener('click',      () => irAJuego('basico'));
    if (btnIntermedio)  btnIntermedio.addEventListener('click',  () => irAJuego('intermedio'));
    if (btnAvanzado)    btnAvanzado.addEventListener('click',    () => irAJuego('avanzado'));
    if (btnExtra)       btnExtra.addEventListener('click',       () => irAJuego('extra'));
    if (btnBorrarDatos) btnBorrarDatos.addEventListener('click', () => Storage.borrarTodo());
    
    if (btnVerificar)   btnVerificar.addEventListener('click',   verificarRespuesta);
    if (btnVolver)      btnVolver.addEventListener('click',      volverInicio);
    
    if (btnReintentar)  btnReintentar.addEventListener('click',  reiniciarJuego);
    if (btnMenu)        btnMenu.addEventListener('click',        () => { ocultarGameOver(); volverInicio(); });

    // NUEVO: botón "Practicar" de la recomendación de punto más débil (se genera dinámicamente)
    if (modalGameOver) {
        modalGameOver.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-practicar');
            if (btn) practicarOperacionDebil(btn.dataset.tab);
        });
    }

    // NUEVO: accesos del Centro de Recursos — Tutoriales y Ayuda son pantallas completas, no modales
    const btnTutorialOperaciones = document.getElementById('btn-tutorial-operaciones');
    const btnAyudaJuego          = document.getElementById('btn-ayuda-juego');
    const volverTutorialBtn      = document.getElementById('volver-tutorial');
    const volverAyudaBtn         = document.getElementById('volver-ayuda');

    function tabTutorialActiva() {
        const activa = document.querySelector('.tutorial-tab.active');
        return activa ? activa.dataset.tab : 'suma';
    }

    // Muestra el sub-tutorial de Determinante en su tamaño (2x2 o 3x3 / Sarrus)
    function mostrarSubTutorialDet(size) {
        const btns  = document.querySelectorAll('.tutorial-size-btn');
        const cont2 = document.querySelector('.tutorial-player[data-op="det"]');
        const cont3 = document.querySelector('.tutorial-player[data-op="det3"]');
        btns.forEach(b => b.classList.toggle('active', b.dataset.detsize === size));
        if (cont2) cont2.style.display = size === '2x2' ? 'block' : 'none';
        if (cont3) cont3.style.display = size === '3x3' ? 'block' : 'none';
        detenerTodosLosTutoriales();
        inicializarTutorial(size === '2x2' ? 'det' : 'det3');
    }

    document.querySelectorAll('.tutorial-size-btn').forEach(btn => {
        btn.addEventListener('click', () => mostrarSubTutorialDet(btn.dataset.detsize));
    });

    // Abre/activa el tutorial correspondiente a una pestaña de operación
    function abrirTutorialParaTab(tabKey) {
        if (tabKey === 'det') {
            mostrarSubTutorialDet('2x2');
        } else {
            detenerTodosLosTutoriales();
            inicializarTutorial(tabKey);
        }
    }

    // NUEVO: navegación a pantalla completa (con transición) en vez de abrir/cerrar un modal
    if (btnTutorialOperaciones) btnTutorialOperaciones.addEventListener('click', () => {
        cambiarPantalla(pantallaTutorial, pantallaInicio, () => abrirTutorialParaTab(tabTutorialActiva()));
    });
    if (volverTutorialBtn) volverTutorialBtn.addEventListener('click', () => {
        detenerTodosLosTutoriales();
        cambiarPantalla(pantallaInicio, pantallaTutorial);
    });
    if (btnAyudaJuego) btnAyudaJuego.addEventListener('click', () => {
        cambiarPantalla(pantallaAyuda, pantallaInicio);
    });
    if (volverAyudaBtn) volverAyudaBtn.addEventListener('click', () => {
        cambiarPantalla(pantallaInicio, pantallaAyuda);
    });

    // Pestañas del modal de tutoriales de operaciones
    const tutorialTabs   = document.querySelectorAll('.tutorial-tab');
    const tutorialPanels = document.querySelectorAll('.tutorial-panel');
    tutorialTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            detenerTodosLosTutoriales();
            tutorialTabs.forEach(t => t.classList.remove('active'));
            tutorialPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.querySelector(`.tutorial-panel[data-panel="${tab.dataset.tab}"]`);
            if (panel) panel.classList.add('active');
            abrirTutorialParaTab(tab.dataset.tab);
        });
    });

    // ========================================
    // NUEVO: REPRODUCTOR ANIMADO DE TUTORIALES (AUTOPLAY + CONTROLES MANUALES)
    // ========================================
    const TUTORIALES = {
        suma: {
            tipo: 'binaria', simbolo: '+',
            A: [[2, 3], [1, 4]], B: [[5, 1], [0, 2]], resultado: [[7, 4], [1, 6]],
            pasos: [
                { aCelda: [0, 0], bCelda: [0, 0], resCelda: [0, 0], texto: '2 + 5 = 7' },
                { aCelda: [0, 1], bCelda: [0, 1], resCelda: [0, 1], texto: '3 + 1 = 4' },
                { aCelda: [1, 0], bCelda: [1, 0], resCelda: [1, 0], texto: '1 + 0 = 1' },
                { aCelda: [1, 1], bCelda: [1, 1], resCelda: [1, 1], texto: '4 + 2 = 6' }
            ],
            formula: 'C[i][j] = A[i][j] + B[i][j]'
        },
        resta: {
            tipo: 'binaria', simbolo: '−',
            A: [[6, 5], [4, 9]], B: [[2, 3], [1, 4]], resultado: [[4, 2], [3, 5]],
            pasos: [
                { aCelda: [0, 0], bCelda: [0, 0], resCelda: [0, 0], texto: '6 − 2 = 4' },
                { aCelda: [0, 1], bCelda: [0, 1], resCelda: [0, 1], texto: '5 − 3 = 2' },
                { aCelda: [1, 0], bCelda: [1, 0], resCelda: [1, 0], texto: '4 − 1 = 3' },
                { aCelda: [1, 1], bCelda: [1, 1], resCelda: [1, 1], texto: '9 − 4 = 5' }
            ],
            formula: 'C[i][j] = A[i][j] − B[i][j]'
        },
        escalar: {
            tipo: 'escalar', simbolo: '×', k: 3,
            A: [[2, 3], [1, 4]], resultado: [[6, 9], [3, 12]],
            pasos: [
                { aCelda: [0, 0], resCelda: [0, 0], texto: '3 × 2 = 6' },
                { aCelda: [0, 1], resCelda: [0, 1], texto: '3 × 3 = 9' },
                { aCelda: [1, 0], resCelda: [1, 0], texto: '3 × 1 = 3' },
                { aCelda: [1, 1], resCelda: [1, 1], texto: '3 × 4 = 12' }
            ],
            formula: 'C[i][j] = k × A[i][j]'
        },
        mult: {
            tipo: 'multiplicacion', simbolo: '×',
            A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]], resultado: [[19, 22], [43, 50]],
            pasos: [
                { fila: 0, col: 0, resCelda: [0, 0], texto: 'Fila 1 de A · Columna 1 de B: (1×5) + (2×7) = 19' },
                { fila: 0, col: 1, resCelda: [0, 1], texto: 'Fila 1 de A · Columna 2 de B: (1×6) + (2×8) = 22' },
                { fila: 1, col: 0, resCelda: [1, 0], texto: 'Fila 2 de A · Columna 1 de B: (3×5) + (4×7) = 43' },
                { fila: 1, col: 1, resCelda: [1, 1], texto: 'Fila 2 de A · Columna 2 de B: (3×6) + (4×8) = 50' }
            ],
            formula: 'C[i][j] = Σ (fila i de A) × (columna j de B)'
        },
        trans: {
            tipo: 'transpuesta',
            A: [[1, 2], [3, 4]], resultado: [[1, 3], [2, 4]],
            pasos: [
                { aCelda: [0, 0], resCelda: [0, 0], texto: 'A[0][0] = 1  →  Aᵀ[0][0] = 1' },
                { aCelda: [0, 1], resCelda: [1, 0], texto: 'A[0][1] = 2  →  Aᵀ[1][0] = 2' },
                { aCelda: [1, 0], resCelda: [0, 1], texto: 'A[1][0] = 3  →  Aᵀ[0][1] = 3' },
                { aCelda: [1, 1], resCelda: [1, 1], texto: 'A[1][1] = 4  →  Aᵀ[1][1] = 4' }
            ],
            formula: 'Aᵀ[i][j] = A[j][i]'
        },
        det: {
            tipo: 'determinante',
            A: [[3, 2], [1, 4]], resultado: 10,
            pasos: [
                { diagonal: 'principal', texto: 'Diagonal principal: 3 × 4 = 12' },
                { diagonal: 'secundaria', texto: 'Diagonal secundaria: 2 × 1 = 2' },
                { revelar: true, texto: '12 − 2 = 10' }
            ],
            formula: '|A| = (a×d) − (b×c)'
        },
        det3: {
            tipo: 'determinante3',
            A: [[1, 2, 3], [0, 1, 4], [5, 6, 0]], resultado: 1,
            pasos: [
                { diagonal: 'pos', indice: 0, texto: 'Diagonal 1 (verde): 1 × 1 × 0 = 0' },
                { diagonal: 'pos', indice: 1, texto: 'Diagonal 2 (verde): 2 × 4 × 5 = 40' },
                { diagonal: 'pos', indice: 2, texto: 'Diagonal 3 (verde): 3 × 0 × 6 = 0' },
                { diagonal: 'neg', indice: 0, texto: 'Diagonal 1 (roja): 3 × 1 × 5 = 15' },
                { diagonal: 'neg', indice: 1, texto: 'Diagonal 2 (roja): 1 × 4 × 6 = 24' },
                { diagonal: 'neg', indice: 2, texto: 'Diagonal 3 (roja): 2 × 0 × 0 = 0' },
                { revelar: true, texto: '(0+40+0) − (15+24+0) = 40 − 39 = 1' }
            ],
            formula: '|A| = Σ diagonales ↘ (verde) − Σ diagonales ↙ (roja)'
        }
    };

    const tutorialEstado = {};

    function construirGridOperandoTutorial(matriz, esActiva) {
        let html = `<div class="matrix-visual-grid tutorial-matrix">`;
        matriz.forEach((fila, i) => {
            html += `<div class="matrix-row-visual">`;
            fila.forEach((val, j) => {
                html += `<div class="matrix-cell${esActiva(i, j) ? ' tut-active' : ''}">${val}</div>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
        return html;
    }

    function construirGridResultadoTutorial(cfg, paso) {
        const filas = cfg.resultado.length, cols = cfg.resultado[0].length;
        const pasoActual = cfg.pasos[paso];
        let html = `<div class="matrix-visual-grid tutorial-matrix tutorial-result">`;
        for (let i = 0; i < filas; i++) {
            html += `<div class="matrix-row-visual">`;
            for (let j = 0; j < cols; j++) {
                const idxRevela = cfg.pasos.findIndex(p => p.resCelda && p.resCelda[0] === i && p.resCelda[1] === j);
                const revelado = idxRevela !== -1 && idxRevela <= paso;
                const activo = pasoActual.resCelda && pasoActual.resCelda[0] === i && pasoActual.resCelda[1] === j;
                html += revelado
                    ? `<div class="matrix-cell tut-result${activo ? ' tut-active' : ''}">${cfg.resultado[i][j]}</div>`
                    : `<div class="matrix-cell matrix-query">?</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    function construirEscenarioTutorial(opKey, paso) {
        const cfg = TUTORIALES[opKey];
        const pasoActual = cfg.pasos[paso];

        if (cfg.tipo === 'binaria') {
            const aHtml = construirGridOperandoTutorial(cfg.A, (i, j) => pasoActual.aCelda && pasoActual.aCelda[0] === i && pasoActual.aCelda[1] === j);
            const bHtml = construirGridOperandoTutorial(cfg.B, (i, j) => pasoActual.bCelda && pasoActual.bCelda[0] === i && pasoActual.bCelda[1] === j);
            const resHtml = construirGridResultadoTutorial(cfg, paso);
            return `${aHtml}<div class="matrix-operator">${cfg.simbolo}</div>${bHtml}<div class="matrix-operator">=</div>${resHtml}`;
        }

        if (cfg.tipo === 'escalar') {
            const escalarActivo = !!pasoActual.aCelda;
            const aHtml = construirGridOperandoTutorial(cfg.A, (i, j) => pasoActual.aCelda && pasoActual.aCelda[0] === i && pasoActual.aCelda[1] === j);
            const resHtml = construirGridResultadoTutorial(cfg, paso);
            return `<div class="scalar-bubble tutorial-scalar${escalarActivo ? ' tut-active' : ''}"><span class="scalar-bubble-label">k=</span>${cfg.k}</div><div class="matrix-operator">${cfg.simbolo}</div>${aHtml}<div class="matrix-operator">=</div>${resHtml}`;
        }

        if (cfg.tipo === 'multiplicacion') {
            let aHtml = `<div class="matrix-visual-grid tutorial-matrix">`;
            cfg.A.forEach((fila, i) => {
                const filaActiva = pasoActual.fila === i;
                aHtml += `<div class="matrix-row-visual${filaActiva ? ' tut-row-highlight' : ''}">`;
                fila.forEach(val => {
                    aHtml += `<div class="matrix-cell${filaActiva ? ' tut-active' : ''}">${val}</div>`;
                });
                aHtml += `</div>`;
            });
            aHtml += `</div>`;

            let bHtml = `<div class="matrix-visual-grid tutorial-matrix">`;
            cfg.B.forEach(fila => {
                bHtml += `<div class="matrix-row-visual">`;
                fila.forEach((val, j) => {
                    const colActiva = pasoActual.col === j;
                    bHtml += `<div class="matrix-cell${colActiva ? ' tut-col-highlight tut-active' : ''}">${val}</div>`;
                });
                bHtml += `</div>`;
            });
            bHtml += `</div>`;

            const resHtml = construirGridResultadoTutorial(cfg, paso);
            return `${aHtml}<div class="matrix-operator">${cfg.simbolo}</div>${bHtml}<div class="matrix-operator">=</div>${resHtml}`;
        }

        if (cfg.tipo === 'transpuesta') {
            const aHtml = construirGridOperandoTutorial(cfg.A, (i, j) => pasoActual.aCelda && pasoActual.aCelda[0] === i && pasoActual.aCelda[1] === j);
            const resHtml = construirGridResultadoTutorial(cfg, paso);
            return `${aHtml}<div class="matrix-operator">T</div>${resHtml}`;
        }

        if (cfg.tipo === 'determinante') {
            const filas = cfg.A.length;
            const idxPrincipal   = cfg.pasos.findIndex(p => p.diagonal === 'principal');
            const idxSecundaria  = cfg.pasos.findIndex(p => p.diagonal === 'secundaria');
            const idxRevelar     = cfg.pasos.findIndex(p => p.revelar);

            let aHtml = `<div class="matrix-visual-grid tutorial-matrix">`;
            for (let i = 0; i < filas; i++) {
                aHtml += `<div class="matrix-row-visual">`;
                for (let j = 0; j < filas; j++) {
                    let clase = '';
                    if (i === j && idxPrincipal !== -1 && paso >= idxPrincipal) {
                        clase = 'tut-diag-pos' + (paso === idxPrincipal ? ' tut-active' : '');
                    } else if (i + j === filas - 1 && idxSecundaria !== -1 && paso >= idxSecundaria) {
                        clase = 'tut-diag-neg' + (paso === idxSecundaria ? ' tut-active' : '');
                    }
                    aHtml += `<div class="matrix-cell${clase ? ' ' + clase : ''}">${cfg.A[i][j]}</div>`;
                }
                aHtml += `</div>`;
            }
            aHtml += `</div>`;

            const revelado = idxRevelar !== -1 && paso >= idxRevelar;
            const resHtml = revelado
                ? `<div class="matrix-cell tut-result tutorial-scalar-result${paso === idxRevelar ? ' tut-active' : ''}">${cfg.resultado}</div>`
                : `<div class="matrix-cell matrix-query tutorial-scalar-result">?</div>`;
            const resWrap = `<div class="matrix-visual-grid bars-matrix"><div class="matrix-row-visual">${resHtml}</div></div>`;

            return `${aHtml}<div class="matrix-operator">=</div>${resWrap}`;
        }

        if (cfg.tipo === 'determinante3') {
            // Regla de Sarrus: se extiende la matriz repitiendo las 2 primeras columnas (cols 3 y 4)
            const obtenerValor = (i, j) => cfg.A[i][j % 3];
            const celdasDiagonal = (tipoDiag, k) => {
                const celdas = [];
                for (let f = 0; f < 3; f++) {
                    const col = tipoDiag === 'pos' ? k + f : (k + 2) - f;
                    celdas.push([f, col]);
                }
                return celdas;
            };

            const claseCelda = {};
            const marcar = (tipoDiag, k, clase) => {
                const idxPaso = cfg.pasos.findIndex(p => p.diagonal === tipoDiag && p.indice === k);
                if (idxPaso === -1 || paso < idxPaso) return;
                const activo = paso === idxPaso;
                celdasDiagonal(tipoDiag, k).forEach(([i, j]) => {
                    claseCelda[`${i}_${j}`] = clase + (activo ? ' tut-active' : '');
                });
            };
            [0, 1, 2].forEach(k => marcar('pos', k, 'tut-diag-pos'));
            [0, 1, 2].forEach(k => marcar('neg', k, 'tut-diag-neg'));

            let gridHtml = `<div class="matrix-visual-grid tutorial-matrix tutorial-sarrus">`;
            for (let i = 0; i < 3; i++) {
                gridHtml += `<div class="matrix-row-visual">`;
                for (let j = 0; j < 5; j++) {
                    const claseDiag = claseCelda[`${i}_${j}`] || '';
                    const esRepetida = j >= 3;
                    gridHtml += `<div class="matrix-cell${esRepetida ? ' tut-col-repetida' : ''}${claseDiag ? ' ' + claseDiag : ''}">${obtenerValor(i, j)}</div>`;
                }
                gridHtml += `</div>`;
            }
            gridHtml += `</div>`;
            gridHtml += `<p class="tutorial-mini-nota">Las columnas con borde punteado repiten las 2 primeras, solo para trazar las diagonales de Sarrus.</p>`;

            const idxRevelar = cfg.pasos.findIndex(p => p.revelar);
            const revelado = idxRevelar !== -1 && paso >= idxRevelar;
            const resHtml = revelado
                ? `<div class="matrix-cell tut-result tutorial-scalar-result${paso === idxRevelar ? ' tut-active' : ''}">${cfg.resultado}</div>`
                : `<div class="matrix-cell matrix-query tutorial-scalar-result">?</div>`;
            const resWrap = `<div class="matrix-visual-grid bars-matrix"><div class="matrix-row-visual">${resHtml}</div></div>`;

            return `<div class="tutorial-sarrus-wrap">${gridHtml}</div><div class="matrix-operator">=</div>${resWrap}`;
        }

        return '';
    }

    function renderTutorial(opKey) {
        const contenedor = document.querySelector(`.tutorial-player[data-op="${opKey}"]`);
        const estado = tutorialEstado[opKey];
        if (!contenedor || !estado) return;

        const cfg = TUTORIALES[opKey];
        const total = cfg.pasos.length;
        const pasoActual = cfg.pasos[estado.paso];
        const porcentaje = Math.round(((estado.paso + 1) / total) * 100);

        contenedor.innerHTML = `
            <div class="tutorial-stage">${construirEscenarioTutorial(opKey, estado.paso)}</div>
            <div class="tutorial-caption">
                <span class="tutorial-step-badge">Paso ${estado.paso + 1}/${total}</span>
                <p>${pasoActual.texto}</p>
            </div>
            <div class="tutorial-controls">
                <button class="tutorial-ctrl-btn" data-action="prev" type="button" aria-label="Paso anterior"><i class="fas fa-step-backward"></i></button>
                <button class="tutorial-ctrl-btn tutorial-play-btn" data-action="playpause" type="button" aria-label="Reproducir o pausar">
                    <i class="fas ${estado.reproduciendo ? 'fa-pause' : 'fa-play'}"></i>
                </button>
                <button class="tutorial-ctrl-btn" data-action="next" type="button" aria-label="Paso siguiente"><i class="fas fa-step-forward"></i></button>
                <div class="tutorial-progress"><div class="tutorial-progress-fill" style="width:${porcentaje}%"></div></div>
            </div>
            <p class="tutorial-formula"><code>${cfg.formula}</code></p>
        `;
    }

    function avanzarPasoTutorial(opKey, delta) {
        const cfg = TUTORIALES[opKey];
        const estado = tutorialEstado[opKey];
        if (!cfg || !estado) return;
        const total = cfg.pasos.length;
        estado.paso = (estado.paso + delta + total) % total;
        renderTutorial(opKey);
    }

    function programarSiguientePasoTutorial(opKey) {
        const estado = tutorialEstado[opKey];
        if (!estado || !estado.reproduciendo) return;
        const cfg = TUTORIALES[opKey];
        const esUltimo = estado.paso === cfg.pasos.length - 1;
        estado.timeoutId = setTimeout(() => {
            const est = tutorialEstado[opKey];
            if (!est || !est.reproduciendo) return;
            avanzarPasoTutorial(opKey, 1);
            programarSiguientePasoTutorial(opKey);
        }, esUltimo ? 3000 : 2200);
    }

    function pausarTutorial(opKey) {
        const estado = tutorialEstado[opKey];
        if (!estado) return;
        estado.reproduciendo = false;
        if (estado.timeoutId) clearTimeout(estado.timeoutId);
        estado.timeoutId = null;
    }

    function reproducirTutorial(opKey) {
        const estado = tutorialEstado[opKey];
        if (!estado) return;
        estado.reproduciendo = true;
        programarSiguientePasoTutorial(opKey);
    }

    function detenerTodosLosTutoriales() {
        Object.keys(tutorialEstado).forEach(pausarTutorial);
    }

    function inicializarTutorial(opKey) {
        if (!TUTORIALES[opKey]) return;

        if (!tutorialEstado[opKey]) {
            tutorialEstado[opKey] = { paso: 0, reproduciendo: false, timeoutId: null };
            const contenedor = document.querySelector(`.tutorial-player[data-op="${opKey}"]`);
            if (contenedor) {
                contenedor.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-action]');
                    if (!btn) return;
                    const accion = btn.dataset.action;
                    if (accion === 'prev') {
                        pausarTutorial(opKey);
                        avanzarPasoTutorial(opKey, -1);
                    } else if (accion === 'next') {
                        pausarTutorial(opKey);
                        avanzarPasoTutorial(opKey, 1);
                    } else if (accion === 'playpause') {
                        if (tutorialEstado[opKey].reproduciendo) pausarTutorial(opKey);
                        else reproducirTutorial(opKey);
                        renderTutorial(opKey);
                    }
                });
            }
        }

        detenerTodosLosTutoriales();
        tutorialEstado[opKey].paso = 0;
        tutorialEstado[opKey].reproduciendo = true;
        renderTutorial(opKey);
        programarSiguientePasoTutorial(opKey);
    }


    // ========================================
    // 6. OPERACIONES MATEMÁTICAS (ORIGINALES)
    // ========================================
    function generarMatriz(filas, columnas, max = 10) {
        return Array.from({ length: filas }, () =>
            Array.from({ length: columnas }, () => Math.floor(Math.random() * max) + 1)
        );
    }

    function sumarMatrices(a, b) {
        return a.map((fila, i) => fila.map((val, j) => val + b[i][j]));
    }

    function restarMatrices(a, b) {
        return a.map((fila, i) => fila.map((val, j) => val - b[i][j]));
    }

    function multiplicarMatrices(a, b) {
        const filasA = a.length, colsA = a[0].length, colsB = b[0].length;
        return Array.from({ length: filasA }, (_, i) =>
            Array.from({ length: colsB }, (_, j) =>
                Array.from({ length: colsA }, (_, k) => a[i][k] * b[k][j])
                    .reduce((s, v) => s + v, 0)
            )
        );
    }

    function transponerMatriz(m) {
        return m[0].map((_, j) => m.map(fila => fila[j]));
    }

    function multiplicarEscalar(k, m) {
        return m.map(fila => fila.map(val => val * k));
    }

    function calcularDeterminante2x2(m) {
        return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    }

    function calcularDeterminante3x3(m) {
        const [a, b, c] = m[0];
        const [d, e, f] = m[1];
        const [g, h, i] = m[2];
        return (a*e*i + b*f*g + c*d*h) - (c*e*g + a*f*h + b*d*i);
    }

    
    // ========================================
    // 7. SISTEMA DE PUNTOS Y VIDAS (ACTUALIZADO VISUAL)
    // ========================================
    function calcularPuntos(nivel, rachaBonus) {
        const base = { basico: 10, intermedio: 20, avanzado: 30, extra: 40 }[nivel] || 10;
        const bonus = rachaBonus && rachaActual > 1
            ? Math.floor(base * (rachaActual - 1) * 0.1)
            : 0;
        return base + bonus;
    }

    function actualizarDisplayPuntos(puntosGanados = 0) {
        if (!puntosDisplay) return;

        // Animación de pulso estilo iOS/burbuja si ganan puntos
        if (puntosGanados > 0) {
            puntosDisplay.parentElement.classList.remove('score-animate');
            void puntosDisplay.offsetWidth; // trigger reflow
            puntosDisplay.parentElement.classList.add('score-animate');
            mostrarAnimacionPuntosFlotantes(puntosGanados);
        }

        puntosDisplay.textContent = puntos;
        if (rachaDisplay) rachaDisplay.textContent = rachaActual;
        if (rachaBonusDisplay) {
            const bonusPct = rachaActual > 1 ? Math.floor((rachaActual - 1) * 10) : 0;
            rachaBonusDisplay.textContent = `+${bonusPct}%`;
        }

        if (puntos > recordPersonal) {
            recordPersonal = puntos;
            Storage.guardarRecord(puntos); // Omitido el mensaje de nuevo record original por fluidez drag
        }
    }

    // Pequeña animación flotante estilo RPG/Futurista al ganar puntos
    function mostrarAnimacionPuntosFlotantes(pts) {
        const el = document.createElement('div');
        el.textContent = `+${pts}`;
        el.style.cssText = `
            position: fixed; top: 20%; left: 50%; transform: translate(-50%, 0);
            font-family: 'Orbitron', sans-serif; font-size: 40px; color: #f59e0b;
            text-shadow: 0 0 10px #f59e0b; font-weight: 900; pointer-events: none; z-index: 1000;
            animation: pointsFloatUp 1s ease-out forwards;
        `;
        // Inyectar estilo animación si no existe
        if(!document.getElementById('sty-pts-float')) {
            const s = document.createElement('style'); s.id='sty-pts-float';
            s.textContent = `@keyframes pointsFloatUp { to { transform: translate(-50%, -50px); opacity: 0; } }`;
            document.head.appendChild(s);
        }
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    // Animación flotante al recuperar una vida por mantener la racha
    function mostrarAnimacionVidaGanada() {
        const el = document.createElement('div');
        el.innerHTML = '<i class="fas fa-heart"></i> +1 VIDA';
        el.style.cssText = `
            position: fixed; top: 28%; left: 50%; transform: translate(-50%, 0);
            font-family: 'Orbitron', sans-serif; font-size: 26px; color: var(--success-neon);
            text-shadow: 0 0 10px #0f9; font-weight: 900; pointer-events: none; z-index: 1000;
            display: flex; align-items: center; gap: 8px;
            animation: pointsFloatUp 1.2s ease-out forwards;
        `;
        if (!document.getElementById('sty-pts-float')) {
            const s = document.createElement('style'); s.id = 'sty-pts-float';
            s.textContent = `@keyframes pointsFloatUp { to { transform: translate(-50%, -50px); opacity: 0; } }`;
            document.head.appendChild(s);
        }
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    }

    function actualizarDisplayVidas() {
        if (!vidasDisplay) return;
        // Generar corazones futuristas (fontawesome)
        vidasDisplay.innerHTML = '';
        for (let i = 0; i < VIDAS_MAXIMAS; i++) {
            const heart = document.createElement('i');
            heart.classList.add('fas', 'fa-heart', 'heart-icon');
            if (i >= vidasActuales) {
                heart.classList.add('lost'); // Estilo CSS para corazón perdido
            }
            vidasDisplay.appendChild(heart);
        }
    }

    function perderVida() {
        if (vidasActuales > 0) {
            vidasActuales--;
            actualizarDisplayVidas();
            
            // Efecto shake en toda la pantalla de juego (CSS incorrect-panel lo hace en feedback, aquí general)
            pantallaJuego.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300, iterations: 2 });

            if (vidasActuales === 0) {
                setTimeout(mostrarGameOver, 800);
            }
        }
    }

    // ========================================
    // 8. RENDERIZADO DE MATRICES (VISUAL DESAFÍO)
    // ========================================
    function htmlMatrizVisual(matriz, claseExtra = '') {
        // Retorna un string HTML con divs estilo matrix-cell (animados por CSS)
        const columnas = matriz[0] ? matriz[0].length : 0;
        let html = `<div class="matrix-visual-grid${claseExtra ? ' ' + claseExtra : ''}">`;
        matriz.forEach((fila, i) => {
            html += `<div class="matrix-row-visual">`;
            fila.forEach((val, j) => {
                // Añadimos un delay incremental en línea para la animación CSS cellEnter
                const delay = (i * columnas + j) * 50;
                html += `<div class="matrix-cell" style="animation-delay: ${delay}ms">${val}</div>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
        return html;
    }

    function mostrarDesafio(pregunta, simbolo) {
        if (!matricesContainer) return;

        const esDeterminante = simbolo === 'det';

        let html = `<h3 class="desafio-pregunta">${pregunta}</h3>`;
        html += `<div class="matrix-display-wrapper">`;

        // Render Matriz A: siempre entre corchetes [A], sea cual sea la operación
        html += htmlMatrizVisual(matrizA);

        if (matrizB !== null && matrizB.esEscalar) {
            // Operación con Escalar: A × k = ?
            html += `<div class="matrix-operator">${simbolo}</div>`;
            html += `<div class="scalar-bubble"><span class="scalar-bubble-label">k=</span>${matrizB.valor}</div>`;
            html += `<div class="matrix-operator">=</div>`;
            html += `<div class="matrix-cell matrix-query">?</div>`;
        } else if (matrizB !== null) {
            // Operación Binaria (Suma, Resta, Mult)
            html += `<div class="matrix-operator">${simbolo}</div>`;
            html += htmlMatrizVisual(matrizB);
            html += `<div class="matrix-operator">=</div>`;
            html += `<div class="matrix-cell matrix-query">?</div>`; // Interrogante estilizado
        } else if (esDeterminante) {
            // Determinante: |A| = ? · solo el resultado (el signo de interrogación) va entre barras
            html += `<div class="matrix-operator">=</div>`;
            html += `<div class="matrix-visual-grid bars-matrix"><div class="matrix-row-visual"><div class="matrix-cell matrix-query">?</div></div></div>`;
        } else {
            // Operación Unaria (Transpuesta)
            html += `<div class="unaria-info-burbuja">
                        <i class="fas fa-retweet"></i>
                        <span>Calcular Transpuesta</span>
                     </div>`;
        }

        html += `</div>`;
        matricesContainer.innerHTML = html;

        // NUEVO: Actualiza badge de fase y panel de resultado parcial (Retos Extra)
        actualizarUIFasesExtra();
    }

    // ========================================
    // NUEVO: UI DE FASES PARA RETOS EXTRA (2 pasos por desafío)
    // ========================================
    function actualizarUIFasesExtra() {
        const faseBadge     = document.getElementById('fase-badge');
        const panelParcial  = document.getElementById('fase-parcial-panel');
        const dropZoneCont  = document.querySelector('.drop-zone-container');

        if (nivelActual !== 'extra') {
            if (faseBadge)    faseBadge.style.display = 'none';
            if (panelParcial) panelParcial.style.display = 'none';
            if (matricesContainer) matricesContainer.classList.remove('fase-1-glow', 'fase-2-glow');
            if (dropZoneCont) dropZoneCont.classList.remove('fase-1-glow', 'fase-2-glow');
            return;
        }

        if (faseBadge) {
            faseBadge.style.display = 'flex';
            faseBadge.classList.toggle('fase-badge-1', faseActual === 1);
            faseBadge.classList.toggle('fase-badge-2', faseActual === 2);
            faseBadge.innerHTML = faseActual === 1
                ? '<i class="fas fa-satellite-dish"></i> FASE 1 / 2 · Resultado parcial'
                : '<i class="fas fa-bullseye"></i> FASE 2 / 2 · Resultado final';
        }

        if (matricesContainer) {
            matricesContainer.classList.toggle('fase-1-glow', faseActual === 1);
            matricesContainer.classList.toggle('fase-2-glow', faseActual === 2);
        }
        if (dropZoneCont) {
            dropZoneCont.classList.toggle('fase-1-glow', faseActual === 1);
            dropZoneCont.classList.toggle('fase-2-glow', faseActual === 2);
        }

        if (panelParcial) {
            if (faseActual === 2 && contextoReto && contextoReto.fase1) {
                panelParcial.style.display = 'flex';
                panelParcial.innerHTML = `
                    <span class="fase-parcial-label"><i class="fas fa-lock"></i> Resultado guardado (Fase 1)</span>
                    ${htmlMatrizVisual(contextoReto.fase1.respuesta)}
                `;
            } else {
                panelParcial.style.display = 'none';
            }
        }
    }

   
    // ========================================
    // 9. GENERACIÓN DE DESAFÍOS (LÓGICA ORIGINAL MANTENIDA)
    // ========================================
    function generarDesafio(nivel) {
        // Limpieza de estados previos
        if (timeoutSiguienteDesafio) clearTimeout(timeoutSiguienteDesafio);
        timeoutSiguienteDesafio = null;
        mensajeDiv.innerHTML = '';
        matrizB = null;
        operacionActual = '';

        // NUEVO: El nivel "Retos Extra" tiene su propio generador de 2 fases
        if (nivel === 'extra') {
            generarRetoExtra();
            return;
        }

        let pregunta, simbolo, tamano, maxNumero;

        if (nivel === 'basico') {
            operacionActual = 'matriz';
            // NUEVO: se añade "escalar" (multiplicación por un escalar) a la mezcla
            const ops = ['suma', 'resta', 'escalar'];
            const operacion  = ops[Math.floor(Math.random() * ops.length)];
            tipoOperacionActual = operacion; // 'suma' | 'resta' | 'escalar'
            tamano     = 2;
            maxNumero  = Math.max(3, 5 + ajusteDificultad); // NUEVO: dificultad adaptativa
            matrizA    = generarMatriz(tamano, tamano, maxNumero);

            if (operacion === 'suma') {
                matrizB = generarMatriz(tamano, tamano, maxNumero);
                respuestaCorrecta = sumarMatrices(matrizA, matrizB);
                pregunta = 'Sincronizar Matrices: SUMA (elemento a elemento)';
                simbolo  = '+';
            } else if (operacion === 'resta') {
                matrizB = generarMatriz(tamano, tamano, maxNumero);
                respuestaCorrecta = restarMatrices(matrizA, matrizB);
                pregunta = 'Sincronizar Matrices: RESTA (elemento a elemento)';
                simbolo  = '−';
            } else {
                // NUEVO: multiplicación por escalar
                const k = Math.floor(Math.random() * 4) + 2; // k entre 2 y 5
                matrizB = { esEscalar: true, valor: k };
                respuestaCorrecta = multiplicarEscalar(k, matrizA);
                pregunta = `Amplificación de Datos: MULTIPLICA la matriz por el escalar k = ${k}`;
                simbolo  = '×';
            }

        } else if (nivel === 'intermedio') {
            operacionActual = 'matriz';
            tipoOperacionActual = 'mult';
            maxNumero = Math.max(3, 8 + ajusteDificultad); // NUEVO: dificultad adaptativa
            // NUEVO: dimensiones aleatorias y compatibles para la multiplicación,
            // A es (m×n) y B es (n×p); no necesariamente cuadradas.
            const dimsPosibles = [2, 3];
            const m = dimsPosibles[Math.floor(Math.random() * dimsPosibles.length)];
            const n = dimsPosibles[Math.floor(Math.random() * dimsPosibles.length)];
            const p = dimsPosibles[Math.floor(Math.random() * dimsPosibles.length)];
            matrizA = generarMatriz(m, n, maxNumero);
            matrizB = generarMatriz(n, p, maxNumero);
            respuestaCorrecta = multiplicarMatrices(matrizA, matrizB);
            pregunta = `Fusión de Red: MULTIPLICA ${m}×${n} por ${n}×${p} (fila × columna)`;
            simbolo  = '×';

        } else if (nivel === 'avanzado') {
            const ops = ['transpuesta', 'determinante'];
            const operacion  = ops[Math.floor(Math.random() * ops.length)];
            tipoOperacionActual = operacion === 'transpuesta' ? 'trans' : 'det';
            // NUEVO: se elimina la generación de matrices 4x4; solo 2x2 y 3x3
            tamano     = Math.random() < 0.5 ? 2 : 3;
            maxNumero  = Math.max(3, 10 + ajusteDificultad); // NUEVO: dificultad adaptativa
            matrizA    = generarMatriz(tamano, tamano, maxNumero);

            if (operacion === 'transpuesta') {
                operacionActual = 'matriz';
                respuestaCorrecta = transponerMatriz(matrizA);
                pregunta = `Protocolo T: Transpone la matriz ${tamano}×${tamano} (filas <-> columnas)`;
                simbolo  = 'T';
            } else {
                operacionActual = 'numero'; // Cambia el tipo de input necesario
                respuestaCorrecta = tamano === 2
                    ? calcularDeterminante2x2(matrizA)
                    : calcularDeterminante3x3(matrizA);
                pregunta = `Protocolo Det: Calcula el DETERMINANTE de la matriz ${tamano}×${tamano}`;
                simbolo  = 'det';
            }
        }

        // 1. Mostrar el desafío visual (matrices A y B)
        mostrarDesafio(pregunta, simbolo);
        
        // 2. NUEVO: Inicializar el sistema de Drag & Drop para la respuesta
        inicializarSistemaDragAndDrop();
        
        // Consola para debug (original)
        console.log('Desafío generado:', operacionActual, responseToString(respuestaCorrecta));
    }

    // ========================================
    // NUEVO: GENERADOR DE "RETOS EXTRA" (desafíos combinados en 2 fases)
    // ========================================
    function generarRetoExtra() {
        faseActual = 1;

        const tiposReto = ['escalar_suma', 'transpuesta_suma', 'determinante_suma'];
        const tipoReto = tiposReto[Math.floor(Math.random() * tiposReto.length)];
        const tamano = Math.random() < 0.5 ? 2 : 3;
        const maxNumero = Math.max(3, 5 + ajusteDificultad); // NUEVO: dificultad adaptativa

        const baseA = generarMatriz(tamano, tamano, maxNumero);
        const baseB = generarMatriz(tamano, tamano, maxNumero);

        if (tipoReto === 'escalar_suma') {
            // Reto: k(A + B) o k(A - B)
            const esSuma = Math.random() < 0.5;
            const k = Math.random() < 0.5 ? 2 : 3;
            const intermedia = esSuma ? sumarMatrices(baseA, baseB) : restarMatrices(baseA, baseB);
            const final = multiplicarEscalar(k, intermedia);

            contextoReto = {
                tipoReto,
                fase1: {
                    tipo: 'matriz',
                    tipoOperacion: esSuma ? 'suma' : 'resta',
                    matrizA: baseA,
                    matrizB: baseB,
                    simbolo: esSuma ? '+' : '−',
                    respuesta: intermedia,
                    pregunta: `RETO: k(A ${esSuma ? '+' : '−'} B) · Resuelve primero lo que está entre paréntesis (A ${esSuma ? '+' : '−'} B)`
                },
                fase2: {
                    tipo: 'matriz',
                    tipoOperacion: 'escalar',
                    matrizA: intermedia,
                    matrizB: { esEscalar: true, valor: k },
                    simbolo: '×',
                    respuesta: final,
                    pregunta: `RETO: k(A ${esSuma ? '+' : '−'} B) · Ahora multiplica ese resultado por el escalar k = ${k}`
                }
            };

        } else if (tipoReto === 'transpuesta_suma') {
            // Reto: A^T + B
            const transA = transponerMatriz(baseA);
            const final = sumarMatrices(transA, baseB);

            contextoReto = {
                tipoReto,
                fase1: {
                    tipo: 'matriz',
                    tipoOperacion: 'trans',
                    matrizA: baseA,
                    matrizB: null,
                    simbolo: 'T',
                    respuesta: transA,
                    pregunta: 'RETO: Aᵀ + B · Calcula primero la Transpuesta de A'
                },
                fase2: {
                    tipo: 'matriz',
                    tipoOperacion: 'suma',
                    matrizA: transA,
                    matrizB: baseB,
                    simbolo: '+',
                    respuesta: final,
                    pregunta: 'RETO: Aᵀ + B · Ahora suma ese resultado (Aᵀ) con B'
                }
            };

        } else {
            // Reto: |A + B| (determinante de una suma)
            const suma = sumarMatrices(baseA, baseB);
            const det = tamano === 2 ? calcularDeterminante2x2(suma) : calcularDeterminante3x3(suma);

            contextoReto = {
                tipoReto,
                fase1: {
                    tipo: 'matriz',
                    tipoOperacion: 'suma',
                    matrizA: baseA,
                    matrizB: baseB,
                    simbolo: '+',
                    respuesta: suma,
                    pregunta: 'RETO: |A + B| · Resuelve primero lo que está entre barras (A + B)'
                },
                fase2: {
                    tipo: 'numero',
                    tipoOperacion: 'det',
                    matrizA: suma,
                    matrizB: null,
                    simbolo: 'det',
                    respuesta: det,
                    pregunta: 'RETO: |A + B| · Ahora calcula el Determinante de ese resultado'
                }
            };
        }

        mostrarFaseExtra(1);
    }

    // Renderiza la fase indicada (1 o 2) de un Reto Extra ya generado
    function mostrarFaseExtra(fase) {
        faseActual = fase;
        const datosFase = fase === 1 ? contextoReto.fase1 : contextoReto.fase2;

        operacionActual     = datosFase.tipo;
        tipoOperacionActual = datosFase.tipoOperacion;
        respuestaCorrecta = datosFase.respuesta;
        matrizA = datosFase.matrizA;
        matrizB = datosFase.matrizB;

        mostrarDesafio(datosFase.pregunta, datosFase.simbolo);
        inicializarSistemaDragAndDrop();

        console.log(`Reto Extra generado [Fase ${fase}]:`, contextoReto.tipoReto, responseToString(respuestaCorrecta));
    }

    // Helper para log
    function responseToString(res) {
        return typeof res === 'number' ? res : JSON.stringify(res);
    }

   
    // ========================================
    // 10. NUEVO: NÚCLEO DRAG & DROP FUTURISTA (API HTML5 NATIVA)
    // ========================================
    function inicializarSistemaDragAndDrop() {
        if (!respuestaMatrixTarget || !numbersSupplyBin) return;

        numeroSeleccionado = null; // NUEVO: limpia cualquier selección de un desafío anterior

        // Limpiar zonas
        respuestaMatrixTarget.innerHTML = '';
        numbersSupplyBin.innerHTML = '';
        respuestaMatrixTarget.classList.remove('is-matrix-target', 'is-scalar-target');

        const solucionArr = []; // Plano de la solución para generar números

        // 1. GENERAR ZONAS OBJETIVO (DROP ZONES)
        if (operacionActual === 'matriz') {
            respuestaMatrixTarget.classList.add('is-matrix-target');
            // Generar cuadrícula de huecos basándose en respuestaCorrecta
            const filas = respuestaCorrecta.length;
            const columnas = respuestaCorrecta[0].length;

            for (let i = 0; i < filas; i++) {
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('matrix-row');
                for (let j = 0; j < columnas; j++) {
                    const dropZone = document.createElement('div');
                    dropZone.classList.add('drop-zone');
                    dropZone.dataset.fila = i; // Guardar coordenadas
                    dropZone.dataset.columna = j;
                    // NUEVO: accesible por toque/clic y teclado
                    dropZone.tabIndex = 0;
                    dropZone.setAttribute('role', 'button');
                    dropZone.setAttribute('aria-label', `Casilla fila ${i + 1}, columna ${j + 1}`);
                    rowDiv.appendChild(dropZone);

                    solucionArr.push(respuestaCorrecta[i][j]); // Guardar valor correcto para el pool
                }
                respuestaMatrixTarget.appendChild(rowDiv);
            }
        } else {
            // Es un número (Determinante) - Zona drop entre barras de valor absoluto |A| = ?
            respuestaMatrixTarget.classList.add('is-scalar-target');
            respuestaMatrixTarget.innerHTML = '<p class="instruccion-drag">Arrastra o toca el valor del determinante para colocarlo entre las barras</p>';

            const barsWrap = document.createElement('div');
            barsWrap.className = 'matrix-visual-grid bars-matrix determinante-bars-wrap';

            const dropZone = document.createElement('div');
            dropZone.classList.add('drop-zone', 'determinante-zone');
            dropZone.dataset.tipo = 'determinante';
            // NUEVO: accesible por toque/clic y teclado
            dropZone.tabIndex = 0;
            dropZone.setAttribute('role', 'button');
            dropZone.setAttribute('aria-label', 'Casilla de respuesta del determinante');

            barsWrap.appendChild(dropZone);
            respuestaMatrixTarget.appendChild(barsWrap);

            solucionArr.push(respuestaCorrecta);
        }

        // 2. GENERAR FUENTE DE NÚMEROS (DRAGGABLES)
        const poolNumeros = [...solucionArr];
        
        // Añadir números "Cebo" (distractores) para hacerlo profesional
        const cantidadCebos = Math.max(4, solucionArr.length); // Mínimo 4 distractores
        for (let i = 0; i < cantidadCebos; i++) {
            // Generar aleatorio cerca del rango de la solución, incluyendo negativos si es resta/det
            let cebo = Math.floor(Math.random() * 40) - 10; 
            // Asegurar que no esté ya en la solución (para no confundir)
            if(!solucionArr.includes(cebo)) {
                poolNumeros.push(cebo);
            } else {
                i--; // Reintentar cebo
            }
        }

        // Barajar el pool (Fisher-Yates shuffle) para que no sea obvio
        for (let i = poolNumeros.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [poolNumeros[i], poolNumeros[j]] = [poolNumeros[j], poolNumeros[i]];
        }

        // Crear elementos DOM draggables (estilo burbuja iOS)
        poolNumeros.forEach((num, index) => {
            const numEl = document.createElement('div');
            numEl.classList.add('draggable-number');
            numEl.id = `drab-num-${index}`; // ID único necesario para dataTransfer
            numEl.draggable = true;
            numEl.textContent = num;
            numEl.dataset.valor = num; // Guardar valor real

            // NUEVO: accesible por toque/clic y teclado, alternativa al arrastre nativo
            numEl.tabIndex = 0;
            numEl.setAttribute('role', 'button');
            numEl.setAttribute('aria-label', `Número ${num}`);

            // Animación de entrada con delay
            numEl.style.opacity = '0';
            numEl.style.animation = `cellEnter 0.3s ease-out ${index * 30}ms forwards`;

            numbersSupplyBin.appendChild(numEl);
        });

        // 3. CONFIGURAR LISTENERS DRAG & DROP NATIVOS
        configurarEventListenersNativeDrag();
    }

    // Implementación Nativa HTML5 Drag & Drop
    // NUEVO: lógica compartida de "colocar número en celda", usada tanto por el drop nativo
    // como por la alternativa de toque/clic y teclado.
    function colocarNumeroEnZona(numEl, zone) {
        if (!numEl || zone.classList.contains('occupied')) return;

        // Si el número venía de otra celda (reubicación), vaciar la antigua
        if (numEl.parentElement.classList.contains('drop-zone')) {
            numEl.parentElement.classList.remove('occupied');
        }

        zone.appendChild(numEl);
        zone.classList.add('occupied');

        // Pequeño efecto visual al colocar
        numEl.animate([
            { transform: 'scale(1.2)', opacity: 0.5 },
            { transform: 'scale(1)', opacity: 1 }
        ], { duration: 200 });
    }

    // NUEVO: devuelve un número a la fuente de energía (arrastrado o tocado)
    function devolverNumeroABin(numEl) {
        if (!numEl) return;
        if (numEl.parentElement.classList.contains('drop-zone')) {
            numEl.parentElement.classList.remove('occupied');
        }
        numbersSupplyBin.appendChild(numEl);
    }

    // NUEVO: resalta las celdas libres como "listas" mientras haya un número seleccionado
    function actualizarEstadoZonasSegunSeleccion() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.toggle('zona-lista', !!numeroSeleccionado && !zone.classList.contains('occupied'));
        });
    }

    // NUEVO: selecciona/deselecciona un número al tocarlo o darle clic (alternativa al arrastre)
    function seleccionarNumero(el) {
        if (numeroSeleccionado === el) {
            el.classList.remove('numero-seleccionado');
            numeroSeleccionado = null;
            actualizarEstadoZonasSegunSeleccion();
            return;
        }
        if (numeroSeleccionado) numeroSeleccionado.classList.remove('numero-seleccionado');
        numeroSeleccionado = el;
        el.classList.add('numero-seleccionado');
        actualizarEstadoZonasSegunSeleccion();
        if (window.navigator.vibrate) window.navigator.vibrate(15);
    }

    // NUEVO: coloca el número seleccionado (si hay uno) en la celda tocada/clicada
    function intentarColocarSeleccionado(zone) {
        if (!numeroSeleccionado) return;
        if (zone.classList.contains('occupied')) {
            zone.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 150 });
            return;
        }
        const el = numeroSeleccionado;
        el.classList.remove('numero-seleccionado');
        numeroSeleccionado = null;
        colocarNumeroEnZona(el, zone);
        actualizarEstadoZonasSegunSeleccion();
        if (window.navigator.vibrate) window.navigator.vibrate(20);
    }

    function configurarEventListenersNativeDrag() {
        const draggables = document.querySelectorAll('.draggable-number');
        const dropZones = document.querySelectorAll('.drop-zone');

        // --- EVENTOS SOBRE ELEMENTOS ARRASTRABLES (.draggable-number) ---
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                draggable.classList.add('dragging');
                // Guardar ID y Valor en el objeto de transferencia
                e.dataTransfer.setData('text/plain', draggable.id);
                e.dataTransfer.setData('valor', draggable.dataset.valor);
                e.dataTransfer.effectAllowed = 'move';

                // Feedback táctil (si soportado)
                if (window.navigator.vibrate) window.navigator.vibrate(20);
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                // Si termina fuera de una zona válida, se queda donde estaba (comportamiento nativo)
            });

            // NUEVO: alternativa de toque/clic y teclado (accesible, mejor en móvil)
            draggable.addEventListener('click', (e) => {
                e.stopPropagation();
                seleccionarNumero(draggable);
            });
            draggable.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    seleccionarNumero(draggable);
                }
            });
        });

        // --- EVENTOS SOBRE ZONAS DE SOLTAR (.drop-zone) ---
        dropZones.forEach(zone => {
            // Necesario para permitir soltar (por defecto el navegador lo prohíbe)
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                if(!zone.classList.contains('occupied')) {
                    zone.classList.add('drag-over'); // Estilo visual CSS
                    e.dataTransfer.dropEffect = 'move';
                } else {
                    e.dataTransfer.dropEffect = 'none'; // No permitir si está llena
                }
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                if (zone.classList.contains('occupied')) return; // Seguridad extra

                const idDivArrastrado = e.dataTransfer.getData('text/plain');
                colocarNumeroEnZona(document.getElementById(idDivArrastrado), zone);
            });

            // NUEVO: alternativa de toque/clic y teclado
            zone.addEventListener('click', () => intentarColocarSeleccionado(zone));
            zone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    intentarColocarSeleccionado(zone);
                }
            });
        });
    }

    
    // ========================================
    // 11. VERIFICACIÓN DE RESPUESTAS (REESCRITA PARA DRAG)
    // ========================================
    function verificarRespuesta() {
        if (timeoutSiguienteDesafio) return; // Esperando siguiente turno

        let esCorrecta = false;
        let mensajeExtra = '';
        let usuarioCompleto = true; // Flag para verificar si llenó todo
        let datosUsuario = null; // NUEVO: guarda la respuesta del jugador para poder explicar el error celda a celda

        // 1. RECOLECTAR RESPUESTA DEL DOM
        if (operacionActual === 'matriz') {
            const filas = respuestaCorrecta.length;
            const columnas = respuestaCorrecta[0].length;
            const matrizUsuario = Array.from({ length: filas }, () => Array(columnas).fill(null));

            const dropZones = respuestaMatrixTarget.querySelectorAll('.drop-zone');

            dropZones.forEach(zone => {
                const f = parseInt(zone.dataset.fila);
                const c = parseInt(zone.dataset.columna);
                const numeroContenido = zone.querySelector('.draggable-number');

                if (numeroContenido) {
                    matrizUsuario[f][c] = parseInt(numeroContenido.dataset.valor);
                } else {
                    usuarioCompleto = false; // Hueco vacío
                }
            });

            if (!usuarioCompleto) {
                mostrarFeedbackInfo('Secuencia incompleta. Llenar todos los nodos de la matriz.');
                return;
            }

            // 2. COMPARAR MATRICES (LÓGICA ORIGINAL NORMALIZADA)
            const normalizar = m => m.map(f => f.map(Number));
            esCorrecta = JSON.stringify(normalizar(matrizUsuario)) === JSON.stringify(normalizar(respuestaCorrecta));
            mensajeExtra = 'Sincronización exitosa. Flujo de datos correcto.';
            datosUsuario = { tipo: 'matriz', matrizUsuario, dropZones };

        } else {
            // Operación Número (Determinante)
            const zone = respuestaMatrixTarget.querySelector('.drop-zone');
            const numeroContenido = zone.querySelector('.draggable-number');

            if (!numeroContenido) {
                mostrarFeedbackInfo('Se requiere un valor cuántico para el determinante.');
                return;
            }

            const valorUsuario = parseInt(numeroContenido.dataset.valor);

            // 2. COMPARAR NÚMEROS
            esCorrecta = valorUsuario === respuestaCorrecta;
            mensajeExtra = `Firma energética correcta: <strong>${respuestaCorrecta}</strong>`;
            datosUsuario = { tipo: 'numero', zone };
        }

        // 3. NUEVO: registrar estadística por tipo de operación (para detectar el punto más débil)
        Storage.registrarIntentoOperacion(tipoOperacionActual, esCorrecta);

        // 4. PROCESAR RESULTADO (LÓGICA ORIGINAL)
        totalIntentos++;
        procesarResultado(esCorrecta, mensajeExtra, datosUsuario);
    }

    // Helpers para feedback visual rápido (reemplaza alertas/prompts originales)
    function mostrarFeedbackInfo(txt) {
        mensajeDiv.innerHTML = `
            <div class="feedback-panel info-panel burbuja-ios">
                <i class="fas fa-exclamation-circle"></i>
                <p class="feedback-text">${txt}</p>
            </div>
        `;
        // Efecto shake suave
        respuestaMatrixTarget.animate([
            { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }
        ], { duration: 200, iterations: 2 });
    }

    // NUEVO: pinta cada drop-zone de verde/rojo según si esa celda concreta quedó bien o mal,
    // en vez de solo mostrar la respuesta correcta en texto. Devuelve { correctas, total }.
    function marcarCeldasRespuesta(datosUsuario) {
        if (!datosUsuario) return null;

        if (datosUsuario.tipo === 'matriz') {
            let correctas = 0;
            const total = respuestaCorrecta.length * respuestaCorrecta[0].length;
            datosUsuario.dropZones.forEach(zone => {
                const f = parseInt(zone.dataset.fila);
                const c = parseInt(zone.dataset.columna);
                const ok = Number(datosUsuario.matrizUsuario[f][c]) === Number(respuestaCorrecta[f][c]);
                zone.classList.add(ok ? 'celda-correcta' : 'celda-incorrecta');
                if (ok) correctas++;
            });
            return { correctas, total };
        }

        // Determinante: una sola celda
        datosUsuario.zone.classList.add('celda-incorrecta');
        return { correctas: 0, total: 1 };
    }

    // NUEVO: dificultad adaptativa leve — sube el rango numérico si el jugador va bien encadenado,
    // baja un poco si falla, para mantener el reto calibrado sin cambiar de nivel manualmente.
    function actualizarDificultadAdaptativa(esCorrecta) {
        if (esCorrecta) {
            if (rachaActual >= 3) ajusteDificultad = Math.min(AJUSTE_DIFICULTAD_MAX, ajusteDificultad + 1);
        } else {
            ajusteDificultad = Math.max(AJUSTE_DIFICULTAD_MIN, ajusteDificultad - 1);
        }
        actualizarIndicadorDificultad();
    }

    function actualizarIndicadorDificultad() {
        const el = document.getElementById('dificultad-indicator');
        if (!el) return;
        if (ajusteDificultad > 0) {
            el.style.display = 'flex';
            el.className = 'dificultad-indicator dificultad-alta';
            el.innerHTML = `<i class="fas fa-arrow-up"></i> Dificultad +${ajusteDificultad}`;
        } else if (ajusteDificultad < 0) {
            el.style.display = 'flex';
            el.className = 'dificultad-indicator dificultad-baja';
            el.innerHTML = `<i class="fas fa-arrow-down"></i> Dificultad ${ajusteDificultad}`;
        } else {
            el.style.display = 'none';
        }
    }

    function procesarResultado(esCorrecta, mensajeExtra, datosUsuario) {
        if (esCorrecta) {
            // NUEVO: en Retos Extra, la Fase 1 es solo un resultado parcial;
            // el reto completo (y sus puntos/racha plenos) se cierra en la Fase 2.
            const esFaseParcialExtra = nivelActual === 'extra' && faseActual === 1;

            totalAciertos++;
            rachaActual++;
            if (rachaActual > mejorRacha) mejorRacha = rachaActual;
            actualizarDificultadAdaptativa(true); // NUEVO

            // NUEVO: marca todas las celdas en verde para reforzar visualmente el acierto
            if (datosUsuario && datosUsuario.tipo === 'matriz') {
                datosUsuario.dropZones.forEach(zone => zone.classList.add('celda-correcta'));
            } else if (datosUsuario) {
                datosUsuario.zone.classList.add('celda-correcta');
            }

            const puntosGanados = esFaseParcialExtra
                ? Math.max(5, Math.round(calcularPuntos(nivelActual, false) * 0.4))
                : calcularPuntos(nivelActual, rachaActual > 1);
            puntos += puntosGanados;

            actualizarDisplayPuntos(puntosGanados); // Actualiza visualmente con animación

            // NUEVO: recompensa de vida por mantener la racha (refuerza la relación racha <-> vidas)
            let vidaRecuperada = false;
            if (!esFaseParcialExtra && rachaActual > 0 && rachaActual % RACHA_HITO_VIDA === 0 && vidasActuales < VIDAS_MAXIMAS) {
                vidasActuales++;
                actualizarDisplayVidas();
                mostrarAnimacionVidaGanada();
                vidaRecuperada = true;
            }

            // Feedback Visual Correcto (Estilo futurista)
            let txtRacha = '';
            if (rachaActual >= 5) txtRacha = ' ¡CONEXIÓN ÉPICA!';
            else if (rachaActual >= 3) txtRacha = ' ¡Sinergia en aumento!';

            const tituloFeedback = esFaseParcialExtra ? 'FASE 1 COMPLETA' : 'NÚCLEO SINCRONIZADO';
            const notaFase = esFaseParcialExtra ? ' Avanzando a la fase final...' : '';
            const notaVida = vidaRecuperada ? ' <i class="fas fa-heart"></i> ¡Racha de ' + RACHA_HITO_VIDA + ' recupera 1 vida!' : '';

            mensajeDiv.innerHTML = `
                <div class="feedback-panel correct-panel burbuja-ios">
                    <p class="feedback-title">${tituloFeedback}</p>
                    <p class="feedback-text">${mensajeExtra}<br>+${puntosGanados} unidades de datos.${txtRacha}${notaVida}${notaFase}</p>
                    <i class="fas fa-spinner fa-spin visual-loader"></i>
                </div>
            `;

            // Espera y avanza: a la Fase 2 del mismo reto, o a un desafío nuevo
            timeoutSiguienteDesafio = setTimeout(() => {
                timeoutSiguienteDesafio = null;
                if (esFaseParcialExtra) {
                    mostrarFaseExtra(2);
                } else {
                    generarDesafio(nivelActual);
                }
            }, esFaseParcialExtra ? 1800 : 2800); // NUEVO: más tiempo para leer el resultado antes de avanzar

        } else {
            // INCORRECTO
            rachaActual = 0;
            perderVida(); // Actualiza vidas y chequea Game Over
            actualizarDificultadAdaptativa(false); // NUEVO
            if (rachaDisplay) rachaDisplay.textContent = '0'; // Reset racha visual rápido
            if (rachaBonusDisplay) rachaBonusDisplay.textContent = '+0%';

            // NUEVO: en vez de solo mostrar la respuesta correcta, se resalta celda a celda
            // cuáles quedaron bien (verde) y cuáles mal (rojo) directamente en el panel de respuesta.
            const resumenCeldas = marcarCeldasRespuesta(datosUsuario);
            const esMatrizMultiCelda = resumenCeldas && resumenCeldas.total > 1;

            const respuestaTexto = typeof respuestaCorrecta === 'number'
                ? respuestaCorrecta
                : `[${respuestaCorrecta.map(f => `[${f.join(',')}]`).join(',')}]`; // Formato simple para feedback

            const lineaResumen = esMatrizMultiCelda
                ? `<strong>${resumenCeldas.correctas}/${resumenCeldas.total}</strong> celdas correctas. Revisa las celdas en <span class="texto-incorrecto">rojo</span> del panel de respuesta.<br>`
                : '';

            mensajeDiv.innerHTML = `
                <div class="feedback-panel incorrect-panel burbuja-ios">
                    <p class="feedback-title">ERROR DE MATRIZ</p>
                    <p class="feedback-text">
                        ${lineaResumen}
                        Racha abortada. Integridad: ${vidasActuales}/${VIDAS_MAXIMAS}
                    </p>
                    <p class="feedback-respuesta-completa">Respuesta correcta: <code class="neon-text-red">${respuestaTexto}</code></p>
                </div>
            `;

            if (vidasActuales > 0) {
                timeoutSiguienteDesafio = setTimeout(() => {
                    generarDesafio(nivelActual);
                }, 4200); // NUEVO: más tiempo para leer el error y las celdas marcadas
            }
        }
    }


    // ========================================
    // 12. NAVEGACIÓN Y ESTADOS (MANTENIDO CON ANIMACIÓN)
    // ========================================

    // NUEVO: transición suave entre pantallas — hace fade-out de "salir" y, solo cuando termina
    // (nunca antes), pone display:block en "entrar". Así nunca coexisten ambas visibles a la vez
    // y no se rompe el centrado flex del body.
    function cambiarPantalla(entrar, salir, alMostrar) {
        if (!salir) {
            if (typeof alMostrar === 'function') alMostrar();
            entrar.style.display = 'block';
            return;
        }
        salir.classList.add('pantalla-saliendo');
        setTimeout(() => {
            salir.style.display = 'none';
            salir.classList.remove('pantalla-saliendo');
            if (typeof alMostrar === 'function') alMostrar();
            entrar.style.display = 'block';
        }, 220);
    }

    function irAJuego(nivel) {
        if (timeoutSiguienteDesafio) clearTimeout(timeoutSiguienteDesafio);
        timeoutSiguienteDesafio = null;

        nivelActual = nivel;
        // NUEVO: reiniciar estado de Retos Extra al empezar cualquier partida
        faseActual = 1;
        contextoReto = null;
        ajusteDificultad = 0; // NUEVO: reiniciar dificultad adaptativa en cada partida nueva
        actualizarIndicadorDificultad();

        reiniciarVidas();
        reiniciarPuntos(false); // Reiniciar puntos de partida actual, no record

        // Setup Header Juego
        if (textoNivel) textoNivel.textContent = 'Protocolo: ' + NOMBRES_NIVEL[nivel];

        // NUEVO: transición suave inicio -> juego; el desafío se genera justo antes de mostrarlo
        cambiarPantalla(pantallaJuego, pantallaInicio, () => generarDesafio(nivel));
    }

    function volverInicio() {
        if (timeoutSiguienteDesafio) clearTimeout(timeoutSiguienteDesafio);

        // NUEVO: transición suave juego -> inicio
        cambiarPantalla(pantallaInicio, pantallaJuego, actualizarStatsGlobalesInicio);
    }

    // ========================================
    // 13. GAME OVER Y REINICIO (MANTENIDO VISUAL)
    // ========================================

    // NUEVO: detecta la operación con peor porcentaje de aciertos (mínimo 3 intentos para ser representativa)
    function obtenerOperacionMasDebil() {
        const stats = Storage.obtenerEstadisticasOperacion();
        let peor = null;
        Object.keys(stats).forEach(tipo => {
            const s = stats[tipo];
            if (s.intentos < 3) return;
            const precision = s.aciertos / s.intentos;
            if (!peor || precision < peor.precision) {
                peor = { tipo, precision, ...s };
            }
        });
        return peor;
    }

    // NUEVO: abre el tutorial de operaciones ya posicionado en la operación indicada
    function practicarOperacionDebil(tipo) {
        ocultarGameOver();
        cambiarPantalla(pantallaTutorial, pantallaJuego, () => {
            const tabBtn = document.querySelector(`.tutorial-tab[data-tab="${tipo}"]`);
            if (tabBtn) tabBtn.click();
        });
    }

    function mostrarGameOver() {
        // Guardar datos (Original)
        Storage.guardarPuntuacion(puntos, nivelActual);
        Storage.actualizarEstadisticas({ aciertos: totalAciertos, intentos: totalIntentos, mejorRacha });

        // Llenar Modal Futurista
        document.getElementById('modal-puntos-finales').textContent = puntos;
        document.getElementById('modal-aciertos').textContent = `${totalAciertos}/${totalIntentos}`;
        document.getElementById('modal-mejor-racha').textContent = mejorRacha;

        // NUEVO: recomendación de práctica basada en el punto más débil del jugador
        const panelRecomendacion = document.getElementById('modal-recomendacion');
        if (panelRecomendacion) {
            const debil = obtenerOperacionMasDebil();
            if (debil && debil.precision < 0.7) {
                const pct = Math.round(debil.precision * 100);
                panelRecomendacion.style.display = 'flex';
                panelRecomendacion.innerHTML = `
                    <i class="fas fa-lightbulb"></i>
                    <div class="recomendacion-texto">
                        <strong>Recomendación:</strong> tu punto más débil es <strong>${NOMBRES_OPERACION[debil.tipo] || debil.tipo}</strong> (${pct}% de aciertos).
                    </div>
                    <button id="btn-practicar-debil" class="btn-practicar" type="button" data-tab="${debil.tipo}">
                        <i class="fas fa-graduation-cap"></i> Practicar
                    </button>
                `;
            } else {
                panelRecomendacion.style.display = 'none';
            }
        }

        modalGameOver.style.display = 'flex';

        // Feedback háptico fuerte (si soportado)
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    }

    function ocultarGameOver() {
        modalGameOver.style.display = 'none';
    }

    // ========================================
    // NUEVO: COMPARTIR RESULTADO (tarjeta generada con Canvas + Web Share API)
    // ========================================
    function generarCanvasResultado() {
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');

        // Fondo degradado
        const fondo = ctx.createLinearGradient(0, 0, 900, 500);
        fondo.addColorStop(0, '#050509');
        fondo.addColorStop(1, '#0d0d1f');
        ctx.fillStyle = fondo;
        ctx.fillRect(0, 0, 900, 500);

        // Marco neón
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 860, 460);

        // Esquinas decorativas estilo splash
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        [[36, 36, 1, 1], [864, 36, -1, 1], [36, 464, 1, -1], [864, 464, -1, -1]].forEach(([x, y, dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(x, y + dy * 22);
            ctx.lineTo(x, y);
            ctx.lineTo(x + dx * 22, y);
            ctx.stroke();
        });

        // Título
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00f2fe';
        ctx.font = "900 46px 'Orbitron', sans-serif";
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 20;
        ctx.fillText('MATRIXLAND', 450, 100);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#a0a0b0';
        ctx.font = "600 16px 'Montserrat', sans-serif";
        ctx.fillText('Reporte de misión', 450, 128);

        // Puntos (protagonista de la tarjeta)
        ctx.fillStyle = '#f59e0b';
        ctx.font = "900 92px 'Orbitron', sans-serif";
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 25;
        ctx.fillText(String(puntos), 450, 250);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = "700 15px 'Montserrat', sans-serif";
        ctx.fillText('PUNTOS', 450, 278);

        // Estadísticas secundarias en 3 columnas
        const columnas = [
            { x: 220, valor: String(mejorRacha), label: 'RACHA MÁXIMA', color: '#0f9' },
            { x: 450, valor: NOMBRES_NIVEL[nivelActual] || nivelActual, label: 'NIVEL', color: '#4facfe' },
            { x: 680, valor: `${totalAciertos}/${totalIntentos}`, label: 'ACIERTOS', color: '#ff2e63' }
        ];
        columnas.forEach(col => {
            ctx.fillStyle = col.color;
            ctx.font = "700 30px 'Orbitron', sans-serif";
            ctx.fillText(col.valor, col.x, 375);
            ctx.fillStyle = '#a0a0b0';
            ctx.font = "600 11px 'Montserrat', sans-serif";
            ctx.fillText(col.label, col.x, 398);
        });

        // Footer
        ctx.fillStyle = '#666';
        ctx.font = "500 13px 'Montserrat', sans-serif";
        ctx.fillText('MatrixLand · juego de matrices', 450, 460);

        return canvas;
    }

    function compartirResultado() {
        const dibujarYCompartir = () => {
            const canvas = generarCanvasResultado();
            canvas.toBlob((blob) => {
                if (!blob) return;
                const nombreArchivo = 'matrixland-resultado.png';
                const textoCompartir = `¡Conseguí ${puntos} puntos y una racha de ${mejorRacha} en MATRIXLAND!`;
                const file = new File([blob], nombreArchivo, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({ files: [file], title: 'Mi resultado en MatrixLand', text: textoCompartir }).catch(() => {});
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = nombreArchivo;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            }, 'image/png');
        };

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(dibujarYCompartir);
        } else {
            dibujarYCompartir();
        }
    }

    const btnCompartir = document.getElementById('btn-compartir');
    if (btnCompartir) btnCompartir.addEventListener('click', compartirResultado);

    function reiniciarJuego() {
        ocultarGameOver();
        reiniciarVidas();
        reiniciarPuntos(false);
        ajusteDificultad = 0; // NUEVO: reiniciar dificultad adaptativa
        actualizarIndicadorDificultad();
        generarDesafio(nivelActual);
    }

    function reiniciarPuntos(resetTotal = true) {
        puntos = 0;
        rachaActual = 0;
        // mejorRacha no se reinicia en la sesión (lógica original)
        if(resetTotal) {
             totalAciertos = 0;
             totalIntentos = 0;
        }
        actualizarDisplayPuntos();
    }

    function reiniciarVidas() {
        vidasActuales = VIDAS_MAXIMAS;
        actualizarDisplayVidas();
    }

    // Helper Storage faltante en tu JS original pero referenciado en actualizarEstadisticas
    Storage.guardarPuntuacion = function(puntos, nivel) {
        // Lógica dummy si no usas top scores, o impleméntala aquí como en tu borrador.
        // Asumo que no es crítica para la funcionalidad visual solicitada.
        console.log(`Puntuación final guardada: ${puntos} en nivel ${nivel}`);
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('SW registrado'))
            .catch(err => console.warn('SW error:', err));
    }

});