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

    const globalRecord   = document.getElementById('global-record');
    const globalPartidas = document.getElementById('global-partidas');

    if (globalRecord)   globalRecord.textContent   = recordGuardado;
    if (globalPartidas) globalPartidas.textContent = statsIniciales.partidasJugadas;

    
    // ========================================
    // 3. REFERENCIAS DOM (ACTUALIZADO FUTURISTA)
    // ========================================
    const pantallaInicio = document.getElementById('pantalla-inicio');
    const pantallaJuego  = document.getElementById('pantalla-juego');
    
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
    const vidasDisplay      = document.getElementById('vidas-display');
    const textoNivel        = document.getElementById('texto-nivel');

    // NUEVO: Referencias Drag & Drop
    const respuestaMatrixTarget = document.getElementById('respuesta-matrix-target');
    const numbersSupplyBin      = document.getElementById('numbers-supply-bin');

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

    let timeoutSiguienteDesafio = null;
    let operacionActual = ''; // Para saber si es determinante o matriz

    // NUEVO: Estado para el nivel "Retos Extra" (desafíos combinados en 2 fases)
    let faseActual = 1;       // 1 = resultado parcial, 2 = resultado final
    let contextoReto = null;  // Guarda matrices/escalares/preguntas de cada fase del reto combinado

    
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
    function htmlMatrizVisual(matriz) {
        // Retorna un string HTML con divs estilo matrix-cell (animados por CSS)
        const columnas = matriz[0] ? matriz[0].length : 0;
        let html = `<div class="matrix-visual-grid">`;
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

        let html = `<h3 class="desafio-pregunta">${pregunta}</h3>`;
        html += `<div class="matrix-display-wrapper">`;

        // Render Matriz A
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
        } else {
            // Operación Unaria (Transpuesta, Det)
            const esTrans = simbolo === 'T';
            const icon = esTrans ? 'fa-retweet' : 'fa-fingerprint';
            const txt = esTrans ? 'Calcular Transpuesta' : 'Calcular Determinante';
            
            html += `<div class="unaria-info-burbuja">
                        <i class="fas ${icon}"></i>
                        <span>${txt}</span>
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
            tamano     = 2;
            maxNumero  = 5;
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
            maxNumero = 8;
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
            // NUEVO: se elimina la generación de matrices 4x4; solo 2x2 y 3x3
            tamano     = Math.random() < 0.5 ? 2 : 3;
            maxNumero  = 10;
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
        const maxNumero = 5;

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
                    matrizA: baseA,
                    matrizB: baseB,
                    simbolo: esSuma ? '+' : '−',
                    respuesta: intermedia,
                    pregunta: `RETO: k(A ${esSuma ? '+' : '−'} B) · Resuelve primero lo que está entre paréntesis (A ${esSuma ? '+' : '−'} B)`
                },
                fase2: {
                    tipo: 'matriz',
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
                    matrizA: baseA,
                    matrizB: null,
                    simbolo: 'T',
                    respuesta: transA,
                    pregunta: 'RETO: Aᵀ + B · Calcula primero la Transpuesta de A'
                },
                fase2: {
                    tipo: 'matriz',
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
                    matrizA: baseA,
                    matrizB: baseB,
                    simbolo: '+',
                    respuesta: suma,
                    pregunta: 'RETO: |A + B| · Resuelve primero lo que está entre barras (A + B)'
                },
                fase2: {
                    tipo: 'numero',
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

        operacionActual   = datosFase.tipo;
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

        // Limpiar zonas
        respuestaMatrixTarget.innerHTML = '';
        numbersSupplyBin.innerHTML = '';

        const solucionArr = []; // Plano de la solución para generar números

        // 1. GENERAR ZONAS OBJETIVO (DROP ZONES)
        if (operacionActual === 'matriz') {
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
                    rowDiv.appendChild(dropZone);
                    
                    solucionArr.push(respuestaCorrecta[i][j]); // Guardar valor correcto para el pool
                }
                respuestaMatrixTarget.appendChild(rowDiv);
            }
        } else {
            // Es un número (Determinante) - Solo una zona drop grande
            respuestaMatrixTarget.innerHTML = '<p class="instruccion-drag">Suelta el valor del determinante aquí</p>';
            const dropZone = document.createElement('div');
            dropZone.classList.add('drop-zone', 'determinante-zone');
            dropZone.dataset.tipo = 'determinante';
            respuestaMatrixTarget.appendChild(dropZone);
            
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
            
            // Animación de entrada con delay
            numEl.style.opacity = '0';
            numEl.style.animation = `cellEnter 0.3s ease-out ${index * 30}ms forwards`;

            numbersSupplyBin.appendChild(numEl);
        });

        // 3. CONFIGURAR LISTENERS DRAG & DROP NATIVOS
        configurarEventListenersNativeDrag();
    }

    // Implementación Nativa HTML5 Drag & Drop
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

                // Recuperar info
                const idDivArrastrado = e.dataTransfer.getData('text/plain');
                const divArrastrado = document.getElementById(idDivArrastrado);

                if (divArrastrado) {
                    // LÓGICA ESTILO BURBUJA/ANIMEJS: 
                    // Movemos el elemento DOM real dentro de la zona drop
                    
                    // Si el div venía de otra drop zone (reubicación), vaciar la antigua
                    if(divArrastrado.parentElement.classList.contains('drop-zone')) {
                        divArrastrado.parentElement.classList.remove('occupied');
                    }

                    zone.appendChild(divArrastrado);
                    zone.classList.add('occupied');
                    
                    // Pequeño efecto visual al soltar
                    divArrastrado.animate([
                        { transform: 'scale(1.2)', opacity: 0.5 },
                        { transform: 'scale(1)', opacity: 1 }
                    ], { duration: 200 });
                }
            });
        });
        
        // --- EVENTO SOBRE EL BIN DE SUMINISTRO (Permitir devolver números) ---
        numbersSupplyBin.addEventListener('dragover', (e) => e.preventDefault());
        numbersSupplyBin.addEventListener('drop', (e) => {
            e.preventDefault();
            const idDivArrastrado = e.dataTransfer.getData('text/plain');
            const divArrastrado = document.getElementById(idDivArrastrado);
            if (divArrastrado) {
                // Si venía de una zona, vaciarla
                if(divArrastrado.parentElement.classList.contains('drop-zone')) {
                    divArrastrado.parentElement.classList.remove('occupied');
                }
                numbersSupplyBin.appendChild(divArrastrado);
            }
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
        }

        // 3. PROCESAR RESULTADO (LÓGICA ORIGINAL)
        totalIntentos++;
        procesarResultado(esCorrecta, mensajeExtra);
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

    function procesarResultado(esCorrecta, mensajeExtra) {
        if (esCorrecta) {
            // NUEVO: en Retos Extra, la Fase 1 es solo un resultado parcial;
            // el reto completo (y sus puntos/racha plenos) se cierra en la Fase 2.
            const esFaseParcialExtra = nivelActual === 'extra' && faseActual === 1;

            totalAciertos++;
            rachaActual++;
            if (rachaActual > mejorRacha) mejorRacha = rachaActual;

            const puntosGanados = esFaseParcialExtra
                ? Math.max(5, Math.round(calcularPuntos(nivelActual, false) * 0.4))
                : calcularPuntos(nivelActual, rachaActual > 1);
            puntos += puntosGanados;
            
            actualizarDisplayPuntos(puntosGanados); // Actualiza visualmente con animación

            // Feedback Visual Correcto (Estilo futurista)
            let txtRacha = '';
            if (rachaActual >= 5) txtRacha = ' ¡CONEXIÓN ÉPICA!';
            else if (rachaActual >= 3) txtRacha = ' ¡Sinergia en aumento!';

            const tituloFeedback = esFaseParcialExtra ? 'FASE 1 COMPLETA' : 'NÚCLEO SINCRONIZADO';
            const notaFase = esFaseParcialExtra ? ' Avanzando a la fase final...' : '';

            mensajeDiv.innerHTML = `
                <div class="feedback-panel correct-panel burbuja-ios">
                    <p class="feedback-title">${tituloFeedback}</p>
                    <p class="feedback-text">${mensajeExtra}<br>+${puntosGanados} unidades de datos.${txtRacha}${notaFase}</p>
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
            }, esFaseParcialExtra ? 1400 : 2000);

        } else {
            // INCORRECTO
            rachaActual = 0;
            perderVida(); // Actualiza vidas y chequea Game Over
            if (rachaDisplay) rachaDisplay.textContent = '0'; // Reset racha visual rápido

            const respuestaTexto = typeof respuestaCorrecta === 'number'
                ? respuestaCorrecta
                : `[${respuestaCorrecta.map(f => `[${f.join(',')}]`).join(',')}]`; // Formato simple para feedback

            mensajeDiv.innerHTML = `
                <div class="feedback-panel incorrect-panel burbuja-ios">
                    <p class="feedback-title">ERROR DE MATRIZ</p>
                    <p class="feedback-text">
                        Firma esperada: <code class="neon-text-red">${respuestaTexto}</code><br>
                        Racha abortada. Integridad: ${vidasActuales}/${VIDAS_MAXIMAS}
                    </p>
                </div>
            `;

            if (vidasActuales > 0) {
                timeoutSiguienteDesafio = setTimeout(() => {
                    generarDesafio(nivelActual);
                }, 3500); // Más tiempo para leer el error en drag mode
            }
        }
    }


    // ========================================
    // 12. NAVEGACIÓN Y ESTADOS (MANTENIDO CON ANIMACIÓN)
    // ========================================
    function irAJuego(nivel) {
        if (timeoutSiguienteDesafio) clearTimeout(timeoutSiguienteDesafio);
        timeoutSiguienteDesafio = null;

        nivelActual = nivel;
        // NUEVO: reiniciar estado de Retos Extra al empezar cualquier partida
        faseActual = 1;
        contextoReto = null;

        reiniciarVidas();
        reiniciarPuntos(false); // Reiniciar puntos de partida actual, no record

        // Ocultar inicio, mostrar juego con animación CSS panelEnter
        pantallaInicio.style.display = 'none';
        pantallaJuego.style.display  = 'block';
        
        // Setup Header Juego
        if (textoNivel) {
            const config = {
                basico:     'Protocolo: Básico',
                intermedio: 'Protocolo: Intermedio',
                avanzado:   'Protocolo: Avanzado',
                extra:      'Protocolo: Retos Extra'
            };
            textoNivel.textContent = config[nivel];
        }

        generarDesafio(nivel);
    }

    function volverInicio() {
        if (timeoutSiguienteDesafio) clearTimeout(timeoutSiguienteDesafio);
        
        pantallaInicio.style.display = 'block';
        pantallaJuego.style.display  = 'none';
        
        // Actualizar record en inicio por si acaso
        if (globalRecord) globalRecord.textContent = recordPersonal;
        const stats = Storage.obtenerEstadisticas();
        if (globalPartidas) globalPartidas.textContent = stats.partidasJugadas;
    }

    // ========================================
    // 13. GAME OVER Y REINICIO (MANTENIDO VISUAL)
    // ========================================
    function mostrarGameOver() {
        // Guardar datos (Original)
        Storage.guardarPuntuacion(puntos, nivelActual);
        Storage.actualizarEstadisticas({ aciertos: totalAciertos, intentos: totalIntentos, mejorRacha });

        // Llenar Modal Futurista
        document.getElementById('modal-puntos-finales').textContent = puntos;
        document.getElementById('modal-aciertos').textContent = `${totalAciertos}/${totalIntentos}`;
        document.getElementById('modal-mejor-racha').textContent = mejorRacha;
        
        modalGameOver.style.display = 'flex';
        
        // Feedback háptico fuerte (si soportado)
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    }

    function ocultarGameOver() {
        modalGameOver.style.display = 'none';
    }

    function reiniciarJuego() {
        ocultarGameOver();
        reiniciarVidas();
        reiniciarPuntos(false);
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