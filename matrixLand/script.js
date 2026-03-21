document.addEventListener('DOMContentLoaded', () => {
    // ALMACENAMIENTO LOCAL
    const Storage = {
        KEYS: {
            RECORD: 'matrixland_record',
            ESTADISTICAS: 'matrixland_stats',
            MEJORES_PUNTUACIONES: 'matrixland_top_scores',
            PREFERENCIAS: 'matrixland_preferences'
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
            return {
                partidasJugadas: 0,
                totalAciertos: 0,
                totalIntentos: 0,
                mejorRacha: 0,
                tiempoTotal: 0,
                nivelMasJugado: 'basico'
            };
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

        guardarPuntuacion(puntos, nivel) {
            let topScores = this.obtenerTopPuntuaciones();
            topScores.push({ puntos, nivel, fecha: new Date().toISOString(), timestamp: Date.now() });
            topScores.sort((a, b) => b.puntos - a.puntos);
            topScores = topScores.slice(0, 10);
            localStorage.setItem(this.KEYS.MEJORES_PUNTUACIONES, JSON.stringify(topScores));
        },

        obtenerTopPuntuaciones() {
            const scores = localStorage.getItem(this.KEYS.MEJORES_PUNTUACIONES);
            return scores ? JSON.parse(scores) : [];
        },

        borrarTodo() {
            if (confirm('¿Estás seguro de borrar todos tus datos? Esta acción no se puede deshacer.')) {
                Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
                alert('Datos borrados exitosamente');
                location.reload();
            }
        }
    };

    
    // CARGAR ESTADÍSTICAS INICIALES
   

    const stats = Storage.obtenerEstadisticas();
    const recordGuardado = Storage.obtenerRecord();

    const globalRecord   = document.getElementById('global-record');
    const globalPartidas = document.getElementById('global-partidas');
    const globalAciertos = document.getElementById('global-aciertos');
    const globalRacha    = document.getElementById('global-racha');

    if (globalRecord)   globalRecord.textContent   = recordGuardado;
    if (globalPartidas) globalPartidas.textContent = stats.partidasJugadas;
    if (globalRacha)    globalRacha.textContent     = stats.mejorRacha;
    if (globalAciertos) {
        const precision = stats.totalIntentos > 0
            ? Math.round((stats.totalAciertos / stats.totalIntentos) * 100)
            : 0;
        globalAciertos.textContent = precision + '%';
    }

    
    // REFERENCIAS DOM
   

    const pantallaInicio = document.getElementById('pantalla-inicio');
    const pantallaJuego  = document.getElementById('pantalla-juego');
    const btnBasico      = document.getElementById('btn-basico');
    const btnIntermedio  = document.getElementById('btn-intermedio');
    const btnAvanzado    = document.getElementById('btn-avanzado');
    const btnVerificar   = document.getElementById('btn-verificar');
    const btnVolver      = document.getElementById('btn-volver');
    const btnReintentar  = document.getElementById('btn-reintentar');
    const btnMenu        = document.getElementById('btn-menu');
    const btnBorrarDatos = document.getElementById('btn-borrar-datos');
    const inputRespuesta = document.getElementById('respuesta-usuario');
    const mensajeDiv     = document.getElementById('mensaje-resultado');

    
    // ESTADO DEL JUEGO

    let matrizA = [];
    let matrizB = null;
    let respuestaCorrecta = [];
    let nivelActual = 'basico';

    let puntos         = 0;
    let rachaActual    = 0;
    let mejorRacha     = 0;
    let recordPersonal = recordGuardado;
    let totalAciertos  = 0;
    let totalIntentos  = 0;
    let vidasActuales  = 3;
    const VIDAS_MAXIMAS = 3;

    let timeoutSiguienteDesafio = null;

    
    // EVENTOS
   

    if (btnBasico)      btnBasico.addEventListener('click',      () => irAJuego('basico'));
    if (btnIntermedio)  btnIntermedio.addEventListener('click',  () => irAJuego('intermedio'));
    if (btnAvanzado)    btnAvanzado.addEventListener('click',    () => irAJuego('avanzado'));
    if (btnVerificar)   btnVerificar.addEventListener('click',   verificarRespuesta);
    if (btnVolver)      btnVolver.addEventListener('click',      volverInicio);
    if (btnReintentar)  btnReintentar.addEventListener('click',  reiniciarJuego);
    if (btnBorrarDatos) btnBorrarDatos.addEventListener('click', () => Storage.borrarTodo());

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            ocultarGameOver();
            volverInicio();
        });
    }

    if (inputRespuesta) {
        inputRespuesta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verificarRespuesta();
        });
    }

    
    // OPERACIONES CON MATRICES
 
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

    function calcularDeterminante3x3(m) {
        const [a, b, c] = m[0];
        const [d, e, f] = m[1];
        const [g, h, i] = m[2];
        return (a*e*i + b*f*g + c*d*h) - (c*e*g + a*f*h + b*d*i);
    }

    function calcularDeterminante4x4(m) {
        let det = 0;
        for (let j = 0; j < 4; j++) {
            const sub = m.slice(1).map(fila => fila.filter((_, k) => k !== j));
            const cofactor = m[0][j] * calcularDeterminante3x3(sub);
            det += j % 2 === 0 ? cofactor : -cofactor;
        }
        return det;
    }

    
    // PUNTOS Y ESTADÍSTICAS EN PANTALLA
 

    function calcularPuntos(nivel, rachaBonus) {
        const base = { basico: 10, intermedio: 20, avanzado: 30 }[nivel] || 10;
        const bonus = rachaBonus && rachaActual > 1
            ? Math.floor(base * (rachaActual - 1) * 0.1)
            : 0;
        return base + bonus;
    }

    function actualizarDisplayPuntos() {
        const puntosDisplay = document.getElementById('puntos-display');
        const rachaDisplay  = document.getElementById('racha-display');
        const recordDisplay = document.getElementById('record-display');

        if (puntosDisplay) {
            puntosDisplay.textContent = puntos;
            // ANIMACIÓN: pulso al cambiar puntos
            puntosDisplay.classList.remove('puntos-ganados');
            void puntosDisplay.offsetWidth; // reflow para reiniciar animación
            puntosDisplay.classList.add('puntos-ganados');
        }
        if (rachaDisplay) {
            rachaDisplay.textContent = rachaActual;
            rachaDisplay.parentElement.style.background = rachaActual >= 3
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #10b981, #059669)';
        }
        if (recordDisplay) recordDisplay.textContent = recordPersonal;

        if (puntos > recordPersonal) {
            recordPersonal = puntos;
            if (Storage.guardarRecord(puntos)) mostrarMensajeNuevoRecord();
        }
    }

    function mostrarAnimacionPuntos(puntosGanados) {
        const el = document.createElement('div');
        el.textContent = `+${puntosGanados} pts!`;
        el.style.cssText = `
            position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            font-size:48px;font-weight:bold;color:#f59e0b;
            font-family:'Orbitron',sans-serif;
            text-shadow:2px 2px 4px rgba(0,0,0,.3);
            animation:puntosAnimation 1s ease-out;
            pointer-events:none;z-index:1000;
        `;
        inyectarEstilo('puntos-animation-style', `
            @keyframes puntosAnimation {
                0%   { opacity:0; transform:translate(-50%,-50%) scale(.5); }
                50%  { opacity:1; transform:translate(-50%,-50%) scale(1.2); }
                100% { opacity:0; transform:translate(-50%,-80%) scale(1); }
            }
        `);
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    function mostrarMensajeNuevoRecord() {
        const el = document.createElement('div');
        el.textContent = ' ¡NUEVO RÉCORD! ';
        el.style.cssText = `
            position:fixed;top:20%;left:50%;
            transform:translate(-50%,-50%);
            font-family:'Orbitron',sans-serif;
            font-size:36px;font-weight:bold;color:#f59e0b;
            text-shadow:3px 3px 6px rgba(0,0,0,.5);
            animation:recordAnimation 2s ease-out;
            pointer-events:none;z-index:1000;
            background:rgba(255,255,255,.95);
            padding:20px 40px;border-radius:15px;
            border:4px solid #f59e0b;
        `;
        inyectarEstilo('record-animation-style', `
            @keyframes recordAnimation {
                0%   { opacity:0; transform:translate(-50%,-50%) scale(.5) rotate(-10deg); }
                50%  { opacity:1; transform:translate(-50%,-50%) scale(1.2) rotate(5deg); }
                100% { opacity:0; transform:translate(-50%,-50%) scale(1) rotate(0deg); }
            }
        `);
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }

    function inyectarEstilo(id, css) {
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id;
            s.textContent = css;
            document.head.appendChild(s);
        }
    }

    function reiniciarPuntos() {
        puntos = 0;
        rachaActual = 0;
        mejorRacha  = 0;
        totalAciertos = 0;
        totalIntentos = 0;
        actualizarDisplayPuntos();
    }

   
    // SISTEMA DE VIDAS
   
    function actualizarDisplayVidas() {
        const vidasDisplay = document.getElementById('vidas-display');
        if (!vidasDisplay) return;
        vidasDisplay.textContent =
            '❤️'.repeat(vidasActuales) + '🖤'.repeat(VIDAS_MAXIMAS - vidasActuales);
       
        vidasDisplay.classList.remove('vida-perdida');
        void vidasDisplay.offsetWidth;
        vidasDisplay.classList.add('vida-perdida');
    }

    function perderVida() {
        if (vidasActuales > 0) {
            vidasActuales--;
            actualizarDisplayVidas();

           
            const cardVidas = document.querySelector('.stat-vidas');
            if (cardVidas) {
                cardVidas.classList.remove('danger-flash');
                void cardVidas.offsetWidth;
                cardVidas.classList.add('danger-flash');
            }

            if (vidasActuales === 0) setTimeout(mostrarGameOver, 1000);
        }
    }

    function reiniciarVidas() {
        vidasActuales = VIDAS_MAXIMAS;
        actualizarDisplayVidas();
    }

    
    // GAME OVER
    

    function mostrarGameOver() {
        Storage.guardarPuntuacion(puntos, nivelActual);
        Storage.actualizarEstadisticas({ aciertos: totalAciertos, intentos: totalIntentos, mejorRacha });

        document.getElementById('modal-puntos-finales').textContent = puntos;
        document.getElementById('modal-aciertos').textContent = `${totalAciertos}/${totalIntentos}`;
        document.getElementById('modal-mejor-racha').textContent = mejorRacha;
        document.getElementById('modal-gameover').style.display = 'flex';
    }

    function ocultarGameOver() {
        document.getElementById('modal-gameover').style.display = 'none';
    }

    function reiniciarJuego() {
        if (timeoutSiguienteDesafio) {
            clearTimeout(timeoutSiguienteDesafio);
            timeoutSiguienteDesafio = null;
        }
        ocultarGameOver();
        reiniciarVidas();
        reiniciarPuntos();
        generarDesafio(nivelActual);
        if (inputRespuesta) inputRespuesta.value = '';
        if (mensajeDiv)     mensajeDiv.innerHTML = '';
    }

    
    // RENDERIZADO DE MATRICES — con stagger animado
  

    function htmlMatriz(matriz, delayOffset = 0) {
        let cellIndex = 0;
        return `<div style="display:inline-block;margin:10px;vertical-align:middle;">` +
            matriz.map(fila =>
                `<div style="display:flex;">` +
                fila.map(val => {
                    const delay = (delayOffset + cellIndex) * 50;
                    cellIndex++;
                    return `<div class="matrix-cell" style="animation-delay:${delay}ms;">${val}</div>`;
                }).join('') +
                `</div>`
            ).join('') +
        `</div>`;
    }

    function mostrarDesafio(pregunta, simbolo) {
        const container = document.getElementById('matrices-container');

        let html = `<h3 style="margin-bottom:20px;color:#333;">${pregunta}</h3>`;
        html += `<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;">`;

        const celdas = matrizA.length * matrizA[0].length;
        html += htmlMatriz(matrizA, 0);

        if (matrizB !== null) {
            html += `<div style="font-size:40px;font-weight:bold;color:#667eea;">${simbolo}</div>`;
            html += htmlMatriz(matrizB, celdas);
            html += `<div style="font-size:40px;font-weight:bold;color:#667eea;">=</div>`;
            html += `<div style="font-size:40px;font-weight:bold;color:#764ba2;">?</div>`;
        } else {
            const esTrans  = simbolo === 'T';
            const color    = esTrans ? '#1e40af' : '#991b1b';
            const bgColor  = esTrans ? '#f0f9ff' : '#fef2f2';
            const mensaje  = esTrans
                ? 'La transpuesta intercambia filas por columnas.<br>Formato: <code>[[a,b],[c,d]]</code>'
                : 'El determinante es un número.<br>Escribe solo el número entero.';
            html += `<div style="font-size:18px;padding:15px;background:${bgColor};border-radius:10px;color:${color};"> ${mensaje}</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

   
    // GENERACIÓN DE DESAFÍOS
    

    function generarDesafio(nivel) {
        matrizB = null;

        let operacion, tamano, maxNumero, pregunta, simbolo;

        if (nivel === 'basico') {
            const ops = ['suma', 'resta'];
            operacion  = ops[Math.floor(Math.random() * ops.length)];
            tamano     = 2;
            maxNumero  = 5;
            matrizA    = generarMatriz(tamano, tamano, maxNumero);
            matrizB    = generarMatriz(tamano, tamano, maxNumero);

            if (operacion === 'suma') {
                respuestaCorrecta = sumarMatrices(matrizA, matrizB);
                pregunta = ' SUMA estas matrices (elemento por elemento):';
                simbolo  = '+';
            } else {
                respuestaCorrecta = restarMatrices(matrizA, matrizB);
                pregunta = ' RESTA estas matrices (elemento por elemento):';
                simbolo  = '−';
            }

        } else if (nivel === 'intermedio') {
            tamano    = Math.random() < 0.6 ? 2 : 3;
            maxNumero = 8;
            matrizA   = generarMatriz(tamano, tamano, maxNumero);
            matrizB   = generarMatriz(tamano, tamano, maxNumero);
            respuestaCorrecta = multiplicarMatrices(matrizA, matrizB);
            pregunta  = ` MULTIPLICA estas matrices ${tamano}×${tamano} (fila × columna):`;
            simbolo   = '×';

        } else if (nivel === 'avanzado') {
            const ops = ['transpuesta', 'determinante'];
            operacion  = ops[Math.floor(Math.random() * ops.length)];
            tamano     = Math.random() < 0.7 ? 3 : 4;
            maxNumero  = 10;
            matrizA    = generarMatriz(tamano, tamano, maxNumero);

            if (operacion === 'transpuesta') {
                respuestaCorrecta = transponerMatriz(matrizA);
                pregunta = ` Calcula la TRANSPUESTA de esta matriz ${tamano}×${tamano}:`;
                simbolo  = 'T';
            } else {
                respuestaCorrecta = tamano === 3
                    ? calcularDeterminante3x3(matrizA)
                    : calcularDeterminante4x4(matrizA);
                pregunta = ` Calcula el DETERMINANTE de esta matriz ${tamano}×${tamano}:`;
                simbolo  = 'det';
            }
        }

        mostrarDesafio(pregunta, simbolo);
        console.log('Desafío:', operacion || nivel, `(${tamano}x${tamano}) →`, respuestaCorrecta);
    }

   
    // NAVEGACIÓN
    

    function irAJuego(nivel) {
        if (timeoutSiguienteDesafio) {
            clearTimeout(timeoutSiguienteDesafio);
            timeoutSiguienteDesafio = null;
        }

        nivelActual = nivel;
        reiniciarVidas();
        reiniciarPuntos();

        pantallaInicio.style.display = 'none';
        pantallaJuego.style.display  = 'block';

       
        pantallaJuego.classList.remove('screen-enter');
        void pantallaJuego.offsetWidth;
        pantallaJuego.classList.add('screen-enter');

        const textoNivel = document.getElementById('texto-nivel');
        if (textoNivel) {
            const config = {
                basico:     { texto: ' Básico — Suma y Resta',                color: '#b6cbf7' },
                intermedio: { texto: ' Intermedio — Multiplicación',           color: '#fbfd88' },
                avanzado:   { texto: 'Avanzado — Transpuesta y Determinante', color: '#e9b9b9' }
            };
            textoNivel.textContent = config[nivel].texto;
            textoNivel.style.color  = config[nivel].color;
        }

        generarDesafio(nivel);
        if (inputRespuesta) { inputRespuesta.value = ''; inputRespuesta.focus(); }
        if (mensajeDiv)     mensajeDiv.innerHTML = '';
    }

    function volverInicio() {
        if (timeoutSiguienteDesafio) {
            clearTimeout(timeoutSiguienteDesafio);
            timeoutSiguienteDesafio = null;
        }

        pantallaInicio.style.display = 'block';
        pantallaJuego.style.display  = 'none';

       
        pantallaInicio.classList.remove('screen-enter');
        void pantallaInicio.offsetWidth;
        pantallaInicio.classList.add('screen-enter');

        reiniciarPuntos();
        reiniciarVidas();

        if (mensajeDiv)     mensajeDiv.innerHTML = '';
        if (inputRespuesta) inputRespuesta.value  = '';
    }

    
    // VERIFICACIÓN DE RESPUESTAS
  

    function verificarRespuesta() {
        if (timeoutSiguienteDesafio) return;

        const respuestaUsuario = inputRespuesta ? inputRespuesta.value.trim() : '';

        if (!respuestaUsuario) {
            mensajeDiv.innerHTML = '<p style="color:orange;font-size:18px;margin-top:20px;"> Por favor, ingresa una respuesta</p>';
            return;
        }

        totalIntentos++;
        let esCorrecta = false;

        if (typeof respuestaCorrecta === 'number') {
            const numUsuario = parseFloat(respuestaUsuario);
            esCorrecta = !isNaN(numUsuario) && numUsuario === respuestaCorrecta;
            procesarResultado(esCorrecta, `El determinante correcto es <strong>${respuestaCorrecta}</strong>`);
        } else {
            try {
                const matrizUsuario = JSON.parse(respuestaUsuario);
                const normalizar = m => m.map(f => f.map(Number));
                esCorrecta = JSON.stringify(normalizar(matrizUsuario)) === JSON.stringify(normalizar(respuestaCorrecta));
                procesarResultado(esCorrecta, '¡Excelente! La matriz es correcta.');
            } catch {
                // ANIMACIÓN: shake en el input cuando el formato es incorrecto
                if (inputRespuesta) {
                    inputRespuesta.classList.remove('input-shake');
                    void inputRespuesta.offsetWidth;
                    inputRespuesta.classList.add('input-shake');
                    setTimeout(() => inputRespuesta.classList.remove('input-shake'), 500);
                }
                mensajeDiv.innerHTML = `
                    <div style="background:#fef3c7;padding:20px;border-radius:10px;margin-top:20px;border:3px solid #f59e0b;">
                        <p style="color:#92400e;font-size:20px;font-weight:bold;margin:0;"> Formato incorrecto</p>
                        <p style="color:#b45309;font-size:16px;margin:10px 0 0;">
                            Usa el formato: <code style="background:white;padding:2px 8px;border-radius:3px;">[[1,2],[3,4]]</code>
                        </p>
                    </div>
                `;
            }
        }
    }

    function procesarResultado(esCorrecta, mensajeExtra) {
        if (esCorrecta) {
            totalAciertos++;
            rachaActual++;
            if (rachaActual > mejorRacha) mejorRacha = rachaActual;

            const puntosGanados = calcularPuntos(nivelActual, rachaActual > 1);
            puntos += puntosGanados;
            actualizarDisplayPuntos();
            mostrarAnimacionPuntos(puntosGanados);

            let mensajeRacha = '';
            if (rachaActual >= 5) mensajeRacha = '<br> ¡RACHA ÉPICA!';
            else if (rachaActual >= 3) mensajeRacha = '<br>¡Racha en llamas!';

            mensajeDiv.innerHTML = `
                <div style="background:#d1fae5;padding:20px;border-radius:10px;margin-top:20px;border:3px solid #10b981;">
                    <p style="color:#065f46;font-size:28px;font-weight:bold;margin:0;">¡CORRECTO!</p>
                    <p style="color:#047857;font-size:18px;margin:10px 0 0;">
                        ${mensajeExtra}<br>+${puntosGanados} puntos${mensajeRacha}
                    </p>
                    <p style="color:#059669;font-size:14px;margin:10px 0 0;font-style:italic;">Generando nuevo desafío...</p>
                </div>
            `;

            timeoutSiguienteDesafio = setTimeout(() => {
                timeoutSiguienteDesafio = null;
                generarDesafio(nivelActual);
                if (inputRespuesta) { inputRespuesta.value = ''; inputRespuesta.focus(); }
                mensajeDiv.innerHTML = '';
            }, 2000);

        } else {
            rachaActual = 0;
            perderVida();
            actualizarDisplayPuntos();

            const respuestaTexto = typeof respuestaCorrecta === 'number'
                ? respuestaCorrecta
                : `<code style="background:white;padding:5px 10px;border-radius:5px;display:inline-block;margin-top:5px;">${JSON.stringify(respuestaCorrecta)}</code>`;

            mensajeDiv.innerHTML = `
                <div style="background:#fee2e2;padding:20px;border-radius:10px;margin-top:20px;border:3px solid #ef4444;">
                    <p style="color:#991b1b;font-size:24px;font-weight:bold;margin:0;"> Incorrecto</p>
                    <p style="color:#b91c1c;font-size:18px;margin:10px 0 0;">
                        La respuesta correcta es: ${respuestaTexto}<br>
                         Racha perdida | Vidas: ${vidasActuales}/${VIDAS_MAXIMAS}
                    </p>
                </div>
            `;

            if (vidasActuales > 0) {
                timeoutSiguienteDesafio = setTimeout(() => {
                    timeoutSiguienteDesafio = null;
                    generarDesafio(nivelActual);
                    if (inputRespuesta) { inputRespuesta.value = ''; inputRespuesta.focus(); }
                    mensajeDiv.innerHTML = '';
                }, 3500);
            }
        }
    }

});