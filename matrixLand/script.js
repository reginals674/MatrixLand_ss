document.addEventListener('DOMContentLoaded', () => {
    
    const pantallaInicio = document.getElementById('pantalla-inicio');
    const pantallaJuego = document.getElementById('pantalla-juego');
    const btnBasico = document.getElementById('btn-basico');
    const btnIntermedio = document.getElementById('btn-intermedio');
    const btnAvanzado = document.getElementById('btn-avanzado');
    const btnVerificar = document.getElementById('btn-verificar');
    const btnVolver = document.getElementById('btn-volver');

    let matrizA = [];
    let matrizB = [];
    let respuestaCorrecta = [];
    let nivelActual = 'basico'; 
    
   if (btnBasico) {
        btnBasico.addEventListener('click', function() {
            irAJuego('basico');  
        });
    }

    if (btnIntermedio) {
        btnIntermedio.addEventListener('click', function() {
            irAJuego('intermedio');  
        });
    }

    if (btnAvanzado) {
        btnAvanzado.addEventListener('click', function() {
            irAJuego('avanzado'); 
        });
    }
    
    
    if (btnVerificar) {
        btnVerificar.addEventListener('click', verificarRespuesta);
    }
    
    if (btnVolver) {
        btnVolver.addEventListener('click', volverInicio);
    }

    
   function generarMatriz(filas, columnas, max = 10) {
        const matriz = [];
        
        for (let i = 0; i < filas; i++) {
            const fila = [];
            
            for (let j = 0; j < columnas; j++) {
                const numeroAleatorio = Math.floor(Math.random() * max) + 1;
                fila.push(numeroAleatorio);
            }
            
            matriz.push(fila);
        }
        
        return matriz;
    }

    // Operaciones con matrices
    function sumarMatrices(matrizA, matrizB) {
        const resultado = [];
        
        for (let i = 0; i < matrizA.length; i++) {
            const fila = [];
            
            for (let j = 0; j < matrizA[i].length; j++) {
                const suma = matrizA[i][j] + matrizB[i][j];
                fila.push(suma);
            }
            
            resultado.push(fila);
        }
        
        return resultado;
    }

    function restarMatrices(matrizA, matrizB) {
        const resultado = [];
        
        for (let i = 0; i < matrizA.length; i++) {
            const fila = [];
            
            for (let j = 0; j < matrizA[i].length; j++) {
                const resta = matrizA[i][j] - matrizB[i][j];
                fila.push(resta);
            }
            
            resultado.push(fila);
        }
        
        return resultado;
    }


    function multiplicarMatrices(matrizA, matrizB) {
        const resultado = [];
        const filasA = matrizA.length;
        const columnasA = matrizA[0].length;
        const columnasB = matrizB[0].length;
        
        
        for (let i = 0; i < filasA; i++) {
            resultado[i] = [];
            for (let j = 0; j < columnasB; j++) {
                resultado[i][j] = 0;
            }
        }
        
        // Multiplicar
        for (let i = 0; i < filasA; i++) {
            for (let j = 0; j < columnasB; j++) {
                for (let k = 0; k < columnasA; k++) {
                    resultado[i][j] += matrizA[i][k] * matrizB[k][j];
                }
            }
        }
        
        return resultado;
    }


    function transponerMatriz(matriz) {
        const filas = matriz.length;
        const columnas = matriz[0].length;
        const resultado = [];
        
        for (let j = 0; j < columnas; j++) {
            resultado[j] = [];
            for (let i = 0; i < filas; i++) {
                resultado[j][i] = matriz[i][j];
            }
        }
        
        return resultado;
    }


    function calcularDeterminante2x2(matriz) {
        
        return (matriz[0][0] * matriz[1][1]) - (matriz[0][1] * matriz[1][0]);
    }


    function calcularDeterminante3x3(matriz) {
        const a = matriz[0][0], b = matriz[0][1], c = matriz[0][2];
        const d = matriz[1][0], e = matriz[1][1], f = matriz[1][2];
        const g = matriz[2][0], h = matriz[2][1], i = matriz[2][2];
        
        // Diagonal principal (+)
        const suma = (a * e * i) + (b * f * g) + (c * d * h);
        
        // Diagonal secundaria (-)
        const resta = (c * e * g) + (a * f * h) + (b * d * i);
        
        return suma - resta;
    }
   
    function calcularDeterminante4x4(matriz) {
        let det = 0;
        
        for (let j = 0; j < 4; j++) {
            // Crear submatriz 3x3
            const submatriz = [];
            for (let i = 1; i < 4; i++) {
                const fila = [];
                for (let k = 0; k < 4; k++) {
                    if (k !== j) {
                        fila.push(matriz[i][k]);
                    }
                }
                submatriz.push(fila);
            }
            
            // Calcular cofactor
            const cofactor = matriz[0][j] * calcularDeterminante3x3(submatriz);
            
            // Alternar signo
            if (j % 2 === 0) {
                det += cofactor;
            } else {
                det -= cofactor;
            }
        }
        
        return det;
    }


    function mostrarMatriz(matriz, contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        let html = '<div style="display: inline-block; margin: 10px;">';
        
        for (let i = 0; i < matriz.length; i++) {
            html += '<div style="display: flex;">';
            
            for (let j = 0; j < matriz[i].length; j++) {
                html += `
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 5px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 20px;
                    ">
                        ${matriz[i][j]}
                    </div>
                `;
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        contenedor.innerHTML += html;
    }

   function mostrarDesafio(pregunta, simbolo) {
        const container = document.getElementById('matrices-container');
        
        // Limpiar contenedor
        container.innerHTML = `<h3 style="margin-bottom: 20px;">${pregunta}</h3>`;
        
        // Crear un contenedor flex para alinear todo
        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.justifyContent = 'center';
        flexContainer.style.alignItems = 'center';
        flexContainer.style.flexWrap = 'wrap';
        flexContainer.style.gap = '10px';
        container.appendChild(flexContainer);
        
        // Mostrar primera matriz
        mostrarMatriz(matrizA, 'matrices-container');
        
        // Si hay segunda matriz (suma, resta, multiplicación)
        if (matrizB !== null) {
            container.innerHTML += `
                <div style="font-size: 40px; margin: 0 10px; display: inline-block; vertical-align: middle; color: #667eea; font-weight: bold;">
                    ${simbolo}
                </div>
            `;
            mostrarMatriz(matrizB, 'matrices-container');
            container.innerHTML += `
                <div style="font-size: 40px; margin: 0 10px; display: inline-block; vertical-align: middle; color: #667eea; font-weight: bold;">
                    =
                </div>
                <div style="font-size: 40px; margin: 0 10px; display: inline-block; vertical-align: middle; color: #764ba2; font-weight: bold;">
                    ?
                </div>
            `;
        } else {
            // Para transpuesta o determinante
            if (simbolo === 'T') {
                container.innerHTML += `
                    <div style="font-size: 24px; margin: 20px 0; padding: 15px; background: #f0f9ff; border-radius: 10px; color: #1e40af;">
                        Recuerda: La transpuesta intercambia filas por columnas.<br>
                        Formato de respuesta: [[a,b,c],[d,e,f],[g,h,i]]
                    </div>
                `;
            } else if (simbolo === 'det') {
                container.innerHTML += `
                    <div style="font-size: 24px; margin: 20px 0; padding: 15px; background: #fef2f2; border-radius: 10px; color: #991b1b;">
                        Recuerda: El determinante es un número.<br>
                        Formato de respuesta: Solo escribe el número
                    </div>
                `;
            }
        }
    }
    
    
    function generarDesafio(nivel) {
        let operacion;
        let tamano;
        let maxNumero;
        let pregunta;
        let simbolo;
        
        
        if (nivel === 'basico') {
            console.log('Nivel Básico: Suma y Resta');
            
            const operaciones = ['suma', 'resta'];
            operacion = operaciones[Math.floor(Math.random() * operaciones.length)];
            tamano = 2;
            maxNumero = 5;
            
            matrizA = generarMatriz(tamano, tamano, maxNumero);
            matrizB = generarMatriz(tamano, tamano, maxNumero);
            
            if (operacion === 'suma') {
                respuestaCorrecta = sumarMatrices(matrizA, matrizB);
                pregunta = 'SUMA estas matrices (elemento por elemento):';
                simbolo = '+';
            } else {
                respuestaCorrecta = restarMatrices(matrizA, matrizB);
                pregunta = 'RESTA estas matrices (elemento por elemento):';
                simbolo = '-';
            }
            
        } 
        
        else if (nivel === 'intermedio') {
            console.log('Nivel Intermedio: Multiplicación de Matrices');
            
            operacion = 'multiplicacion';
            tamano = Math.random() < 0.6 ? 2 : 3;
            maxNumero = 8;
            
            matrizA = generarMatriz(tamano, tamano, maxNumero);
            matrizB = generarMatriz(tamano, tamano, maxNumero);
            
            respuestaCorrecta = multiplicarMatrices(matrizA, matrizB);
            pregunta = `MULTIPLICA estas matrices ${tamano}x${tamano} (fila × columna):`;
            simbolo = '×';
            
        } 
        
        else if (nivel === 'avanzado') {
            console.log(' Nivel Avanzado: Transpuesta y Determinante');
            
            const operaciones = ['transpuesta', 'determinante'];
            operacion = operaciones[Math.floor(Math.random() * operaciones.length)];
            tamano = Math.random() < 0.7 ? 3 : 4;
            maxNumero = 10;
            
            if (operacion === 'transpuesta') {
                matrizA = generarMatriz(tamano, tamano, maxNumero);
                respuestaCorrecta = transponerMatriz(matrizA);
                pregunta = `Calcula la TRANSPUESTA de esta matriz ${tamano}x${tamano}:`;
                simbolo = 'T';
                matrizB = null;
                
            } else if (operacion === 'determinante') {
                matrizA = generarMatriz(tamano, tamano, maxNumero);
                
               
                if (tamano === 3) {
                    respuestaCorrecta = calcularDeterminante3x3(matrizA);
                } else {
                    respuestaCorrecta = calcularDeterminante4x4(matrizA);
                }
                
                pregunta = `Calcula el DETERMINANTE de esta matriz ${tamano}x${tamano}:`;
                simbolo = 'det';
                matrizB = null;
            }
        }
        
        // Mostrar el desafío en pantalla
        mostrarDesafio(pregunta, simbolo);
        
        
    }
    
   
    function irAJuego(nivel) {
        console.log(' Iniciando juego en nivel:', nivel);
        
        // Guardar nivel actual
        nivelActual = nivel;
        
        // Cambiar pantallas
        pantallaInicio.style.display = 'none';
        pantallaJuego.style.display = 'block';
        
        // Mostrar nombre del nivel
        const textoNivel = document.getElementById('texto-nivel');
        if (textoNivel) {
            if (nivel === 'basico') {
                textoNivel.textContent = ' Básico - Suma y Resta';
                textoNivel.style.color = '#3b82f6';
            } else if (nivel === 'intermedio') {
                textoNivel.textContent = ' Intermedio - Multiplicación';
                textoNivel.style.color = '#10b981';
            } else if (nivel === 'avanzado') {
                textoNivel.textContent = 'Avanzado - Transpuesta y Determinante';
                textoNivel.style.color = '#ef4444';
            }
        }
        
        // Generar desafío según el nivel
        generarDesafio(nivel);
        
        // Limpiar input y mensaje
        const inputRespuesta = document.getElementById('respuesta-usuario');
        const mensajeDiv = document.getElementById('mensaje-resultado');
        
        if (inputRespuesta) inputRespuesta.value = '';
        if (mensajeDiv) mensajeDiv.innerHTML = '';
    }
    
    
    function volverInicio() {
        console.log('Volviendo al inicio...');
        pantallaInicio.style.display = 'block';
        pantallaJuego.style.display = 'none';
        
        // Limpiar mensaje
        const mensajeDiv = document.getElementById('mensaje-resultado');
        const inputRespuesta = document.getElementById('respuesta-usuario');
        
        if (mensajeDiv) mensajeDiv.innerHTML = '';
        if (inputRespuesta) inputRespuesta.value = '';
    }
    
    
    function verificarRespuesta() {
        const inputRespuesta = document.getElementById('respuesta-usuario');
        const mensajeDiv = document.getElementById('mensaje-resultado');
        const respuestaUsuario = inputRespuesta.value.trim();
        
        if (!respuestaUsuario) {
            mensajeDiv.innerHTML = `
                <p style="color: orange; font-size: 18px; margin-top: 20px;">
                    Por favor, ingresa una respuesta
                </p>
            `;
            return;
        }
        
        let esCorrecta = false;
        
        // Si la respuesta correcta es un número (determinante)
        if (typeof respuestaCorrecta === 'number') {
            const numeroUsuario = parseFloat(respuestaUsuario);
            esCorrecta = numeroUsuario === respuestaCorrecta;
            
            if (esCorrecta) {
                mensajeDiv.innerHTML = `
                    <div style="background: #d1fae5; padding: 20px; border-radius: 10px; margin-top: 20px; border: 3px solid #10b981;">
                        <p style="color: #065f46; font-size: 28px; font-weight: bold; margin: 0;">
                            ¡CORRECTO! 
                        </p>
                        <p style="color: #047857; font-size: 18px; margin: 10px 0 0 0;">
                            El determinante es <strong>${respuestaCorrecta}</strong>
                        </p>
                    </div>
                `;
            } else {
                mensajeDiv.innerHTML = `
                    <div style="background: #fee2e2; padding: 20px; border-radius: 10px; margin-top: 20px; border: 3px solid #ef4444;">
                        <p style="color: #991b1b; font-size: 24px; font-weight: bold; margin: 0;">
                            Incorrecto
                        </p>
                        <p style="color: #b91c1c; font-size: 18px; margin: 10px 0 0 0;">
                            La respuesta correcta es: <strong>${respuestaCorrecta}</strong>
                        </p>
                    </div>
                `;
            }
        } 
        // Si la respuesta correcta es una matriz
        else {
            try {
                const matrizUsuario = JSON.parse(respuestaUsuario);
                esCorrecta = JSON.stringify(matrizUsuario) === JSON.stringify(respuestaCorrecta);
                
                if (esCorrecta) {
                    mensajeDiv.innerHTML = `
                        <div style="background: #d1fae5; padding: 20px; border-radius: 10px; margin-top: 20px; border: 3px solid #10b981;">
                            <p style="color: #065f46; font-size: 28px; font-weight: bold; margin: 0;">
                                ¡CORRECTO!
                            </p>
                            <p style="color: #047857; font-size: 18px; margin: 10px 0 0 0;">
                                ¡Excelente trabajo! La matriz es correcta.
                            </p>
                        </div>
                    `;
                } else {
                    mensajeDiv.innerHTML = `
                        <div style="background: #fee2e2; padding: 20px; border-radius: 10px; margin-top: 20px; border: 3px solid #ef4444;">
                            <p style="color: #991b1b; font-size: 24px; font-weight: bold; margin: 0;">
                                Incorrecto
                            </p>
                            <p style="color: #b91c1c; font-size: 18px; margin: 10px 0 0 0;">
                                La respuesta correcta es:<br>
                                <code style="background: white; padding: 5px 10px; border-radius: 5px; display: inline-block; margin-top: 5px;">
                                    ${JSON.stringify(respuestaCorrecta)}
                                </code>
                            </p>
                        </div>
                    `;
                }
            } catch (error) {
                mensajeDiv.innerHTML = `
                    <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-top: 20px; border: 3px solid #f59e0b;">
                        <p style="color: #92400e; font-size: 20px; font-weight: bold; margin: 0;">
                            Formato incorrecto
                        </p>
                        <p style="color: #b45309; font-size: 16px; margin: 10px 0 0 0;">
                            Usa el formato: <code style="background: white; padding: 2px 8px; border-radius: 3px;">[[1,2],[3,4]]</code>
                        </p>
                    </div>
                `;
            }
        }
    }
    
});