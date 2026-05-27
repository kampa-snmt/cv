// Variables globales
let currentLang = 'en';
let audioActual = null;
let botonActual = null;

// Idiomas con sus audios
const idiomas = [
    { nombre: "Español", nombre_en: "Spanish", bandera: "espana.svg", nivel_en: "Native", nivel_es: "Nativo", audio: "Espanol.mp3" },
    { nombre: "Galego", nombre_en: "Galician", bandera: "galicia.svg", nivel_en: "Native", nivel_es: "Nativo", audio: "Galego.mp3" },
    { nombre: "English", nombre_en: "English", bandera: "uk.svg", nivel_en: "Proficient (B2/C1)", nivel_es: "Competente (B2/C1)", audio: "English.mp3" },
    { nombre: "Português", nombre_en: "Portuguese", bandera: "portugal.svg", nivel_en: "Proficient (C1)", nivel_es: "Competente (C1)", audio: "Portugues.mp3" },
    { nombre: "中文", nombre_en: "Chinese", bandera: "china.svg", nivel_en: "Beginner (HSK1)", nivel_es: "Principiante (HSK1)", audio: "Chino.mp3" }
];

// Secciones a cargar
const secciones = [
    { id: "coaching", titulo_en: "🏀 Basketball Coaching Experience", titulo_es: "🏀 Experiencia como Entrenador", archivo_en: "Basketball Coaching Experience.json", archivo_es: "Experiencia de Entrenador.json" },
    { id: "internships", titulo_en: "📚 Elite Internships", titulo_es: "📚 Prácticas de Élite", archivo_en: "Elite Internships.json", archivo_es: "Prácticas Profesionales.json" },
    { id: "basketball-education", titulo_en: "🏀 Basketball Education", titulo_es: "🏀 Formación en Baloncesto", archivo_en: "Basketball Education.json", archivo_es: "Educación en Baloncesto.json" },
    { id: "playing", titulo_en: "🏃 Playing Experience", titulo_es: "🏃 Experiencia como Jugador", archivo_en: "Playing Experience.json", archivo_es: "Experiencia de Jugador.json" },
    { id: "other-work", titulo_en: "💼 Other Work Experience", titulo_es: "💼 Otras Experiencias", archivo_en: "Other Work Experience.json", archivo_es: "Otras Experiencias.json" },
    { id: "education", titulo_en: "🎓 Education & Qualifications", titulo_es: "🎓 Educación y Certificados", archivo_en: "Education & Qualifications.json", archivo_es: "Educación y Certificados.json" },
    { id: "skills", titulo_en: "🛠️ Skills", titulo_es: "🛠️ Habilidades", archivo_en: "Skills.json", archivo_es: "Habilidades.json" }
];

// Inicializar PDF
const pdfBtnInicial = document.getElementById('downloadPdfBtn');
if (pdfBtnInicial) {
    pdfBtnInicial.href = 'assets/docs/CV/Manuel Sanmartin - Basketball Coach.pdf';
}

// Cargar JSON
async function cargarJSON(lang, archivo) {
    const basePath = `assets/docs/${lang === 'en' ? 'en' : 'es'}/`;
    try {
        const response = await fetch(basePath + archivo);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`No se pudo cargar ${archivo}:`, error);
        return null;
    }
}

// Generar burbujas (con logos traducidos)
function generarBurbujas(experiencias) {
    if (!experiencias || !experiencias.length) return '<div class="loading">No hay información disponible</div>';
    
    return `<div class="grid-burbujas">${experiencias.map(exp => {
        // Traducir nombre del logo: CBG.png -> cbg
        let logoValue = '';
        if (exp.logo) {
            logoValue = exp.logo.replace('.png', '').toLowerCase();
        }
        return `
        <div class="burbuja" data-logo="${logoValue}" onclick="this.classList.toggle('abierta')">
            <div class="burbuja-header">
                <div class="burbuja-titulo">${exp.titulo || ''}</div>
                <div class="burbuja-periodo">${exp.periodo || ''}</div>
                <div class="burbuja-resumen">${exp.resumen || ''}</div>
                <div class="indicador-click">▼ Click for details ▼</div>
            </div>
            <div class="burbuja-detalle">
                <div class="detalle-contenido">
                    <span class="en">${exp.detalle || ''}</span>
                    <span class="es" style="display:none">${exp.detalle_es || exp.detalle || ''}</span>
                </div>
            </div>
        </div>
        `;
    }).join('')}</div>`;
}

// Generar Skills (mini burbujas)
function generarSkills(data) {
    if (!data || !data.contenido) return '<div class="skills-placeholder">Información de habilidades no disponible</div>';
    
    const contenido = data.contenido;
    let html = '<div class="grid-burbujas">';
    
    for (const categoria in contenido) {
        if (contenido[categoria] && contenido[categoria].items) {
            const itemsEn = contenido[categoria].items;
            const itemsEs = contenido[categoria].items_es || itemsEn;
            html += `
                <div class="burbuja" onclick="this.classList.toggle('abierta')">
                    <div class="burbuja-header">
                        <div class="burbuja-titulo">${contenido[categoria].titulo || categoria}</div>
                        <div class="burbuja-resumen">${itemsEn.slice(0, 3).join(' · ')}${itemsEn.length > 3 ? ' ...' : ''}</div>
                        <div class="indicador-click">▼ Click for details ▼</div>
                    </div>
                    <div class="burbuja-detalle">
                        <div class="detalle-contenido">
                            <span class="en">• ${itemsEn.join('<br>• ')}</span>
                            <span class="es" style="display:none">• ${itemsEs.join('<br>• ')}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    html += '</div>';
    return html;
}

// Generar Idiomas
function generarIdiomas() {
    return `<div class="idiomas-grid">${idiomas.map(idioma => `
        <div class="idioma-card">
            <img src="assets/images/flags/${idioma.bandera}" alt="${idioma.nombre}" class="idioma-bandera" onerror="this.style.display='none'">
            <div class="idioma-nombre"><span class="en">${idioma.nombre_en || idioma.nombre}</span><span class="es" style="display:none">${idioma.nombre}</span></div>
            <div class="idioma-nivel"><span class="en">${idioma.nivel_en}</span><span class="es" style="display:none">${idioma.nivel_es}</span></div>
            <button class="audio-btn" data-audio="${idioma.audio}">🔊 Escuchar</button>
        </div>
    `).join('')}</div>`;
}

// Configurar eventos de audio (play/pausa)
function configurarAudios() {
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.removeEventListener('click', audioHandler);
        btn.addEventListener('click', audioHandler);
    });
}

function audioHandler(e) {
    e.stopPropagation();
    const btn = this;
    const audioFile = btn.getAttribute('data-audio');
    
    // Si hay un audio sonando y NO es el mismo botón, lo paramos
    if (audioActual && botonActual !== btn) {
        audioActual.pause();
        audioActual.currentTime = 0;
        if (botonActual) botonActual.textContent = '🔊 Escuchar';
    }
    
    // Si es el mismo botón y está sonando, lo paramos
    if (audioActual && botonActual === btn && !audioActual.paused) {
        audioActual.pause();
        audioActual.currentTime = 0;
        btn.textContent = '🔊 Escuchar';
        audioActual = null;
        botonActual = null;
        return;
    }
    
    // Crear nuevo audio
    const audio = new Audio(`assets/audio/Languages/${audioFile}`);
    audioActual = audio;
    botonActual = btn;
    btn.textContent = '🔊 Reproduciendo...';
    
    audio.play().catch(err => console.log('Error:', err));
    
    audio.addEventListener('ended', () => {
        if (botonActual === btn) {
            btn.textContent = '🔊 Escuchar';
            audioActual = null;
            botonActual = null;
        }
    });
}

// Cargar todo el contenido dinámico
async function cargarTodo() {
    const container = document.getElementById('contenido-dinamico');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando contenido...</div>';
    
    let htmlFinal = '';
    
    for (const seccion of secciones) {
        const archivo = currentLang === 'en' ? seccion.archivo_en : seccion.archivo_es;
        const titulo = currentLang === 'en' ? seccion.titulo_en : seccion.titulo_es;
        const data = await cargarJSON(currentLang, archivo);
        
        let contenidoHtml = '';
        if (seccion.id === 'skills') {
            contenidoHtml = generarSkills(data);
        } else if (data && data.experiencias) {
            contenidoHtml = generarBurbujas(data.experiencias);
        } else if (data && data.educacion) {
            contenidoHtml = generarBurbujas(data.educacion);
        } else {
            contenidoHtml = '<div class="loading">No hay información disponible</div>';
        }
        
        htmlFinal += `
            <div class="macro-seccion">
                <div class="macro-header" onclick="this.parentElement.classList.toggle('contenido-oculto')">
                    <h2 class="macro-titulo">${titulo}</h2>
                    <span class="macro-toggle">▼</span>
                </div>
                <div class="macro-contenido">
                    ${contenidoHtml}
                </div>
            </div>
        `;
    }
    
    // Añadir sección idiomas
    htmlFinal += `
        <div class="macro-seccion">
            <div class="macro-header" onclick="this.parentElement.classList.toggle('contenido-oculto')">
                <h2 class="macro-titulo">🌐 Languages / Idiomas</h2>
                <span class="macro-toggle">▼</span>
            </div>
            <div class="macro-contenido">
                ${generarIdiomas()}
            </div>
        </div>
    `;
    
    container.innerHTML = htmlFinal;
    
    // Asegurar que todas las burbujas empiezan cerradas
    document.querySelectorAll('.burbuja').forEach(burbuja => {
        burbuja.classList.remove('abierta');
    });
    
    // Configurar audios
    configurarAudios();
    
    actualizarVisibilidadIdioma();
}

// Cambiar idioma
async function cambiarIdioma(lang) {
    currentLang = lang;
    localStorage.setItem('cv_lang', lang);
    
    // Actualizar botones
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Actualizar cover letter
    const coverLetterEn = document.querySelector('#coverLetter .en');
    const coverLetterEs = document.querySelector('#coverLetter .es');
    if (coverLetterEn && coverLetterEs) {
        if (lang === 'en') {
            coverLetterEn.style.display = 'inline';
            coverLetterEs.style.display = 'none';
        } else {
            coverLetterEn.style.display = 'none';
            coverLetterEs.style.display = 'inline';
        }
    }
    
    // Actualizar PDF según idioma
    const pdfBtn = document.getElementById('downloadPdfBtn');
    if (pdfBtn) {
        if (lang === 'en') {
            pdfBtn.href = 'assets/docs/CV/Manuel Sanmartin - Basketball Coach.pdf';
        } else {
            pdfBtn.href = 'assets/docs/CV/Manuel Sanmartin - Entrenador de Baloncesto.pdf';
        }
    }
    
    // Recargar secciones dinámicas
    await cargarTodo();
}

function actualizarVisibilidadIdioma() {
    const enTextos = document.querySelectorAll('.en');
    const esTextos = document.querySelectorAll('.es');
    
    if (currentLang === 'en') {
        enTextos.forEach(el => el.style.display = 'inline');
        esTextos.forEach(el => el.style.display = 'none');
    } else {
        enTextos.forEach(el => el.style.display = 'none');
        esTextos.forEach(el => el.style.display = 'inline');
    }
}

// Vídeo
function initVideo() {
    const playBtn = document.getElementById('playVideoBtn');
    const fotoContainer = document.getElementById('fotoContainer');
    const profileImg = document.getElementById('profileImg');
    let videoElement = null;
    let showingVideo = false;
    
    if (!playBtn) return;
    
    playBtn.addEventListener('click', () => {
        if (!showingVideo) {
            videoElement = document.createElement('video');
            videoElement.src = 'assets/video/Manuel Sanmartin - Self Intro.mp4';
            videoElement.autoplay = true;
            videoElement.loop = false;
            videoElement.muted = false;
            videoElement.style.width = '100%';
            videoElement.style.height = 'auto';
            videoElement.style.aspectRatio = '180 / 230';
            videoElement.style.objectFit = 'cover';
            videoElement.style.borderRadius = '15px';
            
            profileImg.style.display = 'none';
            fotoContainer.insertBefore(videoElement, profileImg);
            
            videoElement.play().catch(err => console.log('Error:', err));
            
            videoElement.addEventListener('ended', () => {
                videoElement.remove();
                profileImg.style.display = 'block';
                showingVideo = false;
                videoElement = null;
            });
            
            showingVideo = true;
            playBtn.textContent = '🎬 Reproduciendo...';
            playBtn.disabled = true;
            
            setTimeout(() => {
                if (showingVideo) {
                    playBtn.disabled = false;
                    playBtn.textContent = '🎥 Ver presentación';
                }
            }, 2000);
        }
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('cv_lang') || 'en';
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            cambiarIdioma(lang);
        });
    });
    
    cambiarIdioma(savedLang);
    initVideo();
});
