// ========== VARIABLES GLOBALES ==========
let currentLang = 'en';
let currentAudio = null;
let currentAudioBtn = null;
let currentAudioPlaying = false;

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

// Idiomas con configuración de audio
const idiomasConfig = {
    'Espanol.mp3': { textEn: '🔊 Hear', textEs: '🔊 Escuchar' },
    'English.mp3': { textEn: '🔊 Hear', textEs: '🔊 Escuchar' },
    'Galego.mp3': { textEn: '🔊 Hear', textEs: '🔊 Escoitar' },
    'Portugues.mp3': { textEn: '🔊 Hear', textEs: '🔊 Ouvir' },
    'Chino.mp3': { textEn: '🔊 Hear', textEs: '🔊 听' }
};

// ========== VÍDEO ==========
const playBtn = document.getElementById('playVideoBtn');
const profileImg = document.getElementById('profileImg');
const introVideo = document.getElementById('introVideo');
let videoVisible = false;
let videoPlaying = false;

function updateVideoButtonText() {
    if (!playBtn) return;
    if (!videoVisible) {
        playBtn.textContent = currentLang === 'en' ? '🎥 Watch intro' : '🎥 Ver presentación';
    } else if (videoPlaying) {
        playBtn.textContent = currentLang === 'en' ? '⏸ Pause' : '⏸ Pausa';
    } else {
        playBtn.textContent = currentLang === 'en' ? '▶ Resume' : '▶ Reanudar';
    }
}

if (playBtn && profileImg && introVideo) {
    playBtn.addEventListener('click', () => {
        if (!videoVisible) {
            profileImg.style.display = 'none';
            introVideo.style.display = 'block';
            introVideo.play();
            videoVisible = true;
            videoPlaying = true;
        } else if (videoPlaying) {
            introVideo.pause();
            videoPlaying = false;
        } else {
            introVideo.play();
            videoPlaying = true;
        }
        updateVideoButtonText();
    });

    introVideo.addEventListener('ended', () => {
        introVideo.style.display = 'none';
        profileImg.style.display = 'block';
        videoVisible = false;
        videoPlaying = false;
        updateVideoButtonText();
    });
}

// ========== FUNCIONES DE AUDIO ==========
function updateAudioButtonText(btn, audioFile, isPlaying, isPaused = false) {
    let text = '';
    const config = idiomasConfig[audioFile] || { textEn: '🔊 Hear', textEs: '🔊 Escuchar' };
    
    if (isPlaying) {
        text = currentLang === 'en' ? '⏸ Pause' : '⏸ Pausa';
    } else if (isPaused) {
        text = currentLang === 'en' ? '▶ Resume' : '▶ Reanudar';
    } else {
        text = currentLang === 'en' ? config.textEn : config.textEs;
    }
    btn.textContent = text;
}

function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentAudioBtn) {
            const audioFile = currentAudioBtn.getAttribute('data-audio');
            updateAudioButtonText(currentAudioBtn, audioFile, false);
            currentAudioBtn.classList.remove('playing');
        }
        currentAudio = null;
        currentAudioBtn = null;
        currentAudioPlaying = false;
    }
}

function pauseCurrentAudio() {
    if (currentAudio && currentAudioPlaying) {
        currentAudio.pause();
        currentAudioPlaying = false;
        if (currentAudioBtn) {
            const audioFile = currentAudioBtn.getAttribute('data-audio');
            updateAudioButtonText(currentAudioBtn, audioFile, false, true);
        }
    }
}

function resumeCurrentAudio() {
    if (currentAudio && !currentAudioPlaying) {
        currentAudio.play();
        currentAudioPlaying = true;
        if (currentAudioBtn) {
            const audioFile = currentAudioBtn.getAttribute('data-audio');
            updateAudioButtonText(currentAudioBtn, audioFile, true);
        }
    }
}

function playAudio(btn, audioFile) {
    const audio = new Audio(`assets/audio/Languages/${audioFile}`);
    currentAudio = audio;
    currentAudioBtn = btn;
    btn.classList.add('playing');
    updateAudioButtonText(btn, audioFile, true);
    
    audio.play();
    currentAudioPlaying = true;
    
    audio.addEventListener('ended', () => {
        if (currentAudioBtn === btn) {
            btn.classList.remove('playing');
            updateAudioButtonText(btn, audioFile, false);
            currentAudio = null;
            currentAudioBtn = null;
            currentAudioPlaying = false;
        }
    });
}

// ========== CARGA DE JSONS ==========
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

function generarBurbujas(experiencias) {
    if (!experiencias || !experiencias.length) return '<div class="loading">No hay información disponible</div>';
    
    return `<div class="grid-burbujas">${experiencias.map(exp => {
        let logoValue = '';
        if (exp.logo) {
            logoValue = exp.logo.replace('.png', '').toLowerCase();
            if (logoValue === 'blazers') logoValue = 'ballinamore';
            if (logoValue === 'nbg') logoValue = 'nbg';
            if (logoValue === 'xuven') logoValue = 'xuventude';
            if (logoValue === 'cbg') logoValue = 'cbog';
            if (logoValue === 'cbg2') logoValue = 'cbog2';
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

function generarIdiomas() {
    const idiomas = [
        { nombre: "Español", nombre_en: "Spanish", bandera: "espana.svg", nivel_en: "Native", nivel_es: "Nativo", audio: "Espanol.mp3" },
        { nombre: "Galego", nombre_en: "Galician", bandera: "galicia.svg", nivel_en: "Native", nivel_es: "Nativo", audio: "Galego.mp3" },
        { nombre: "English", nombre_en: "English", bandera: "uk.svg", nivel_en: "Proficient (B2/C1)", nivel_es: "Competente (B2/C1)", audio: "English.mp3" },
        { nombre: "Português", nombre_en: "Portuguese", bandera: "portugal.svg", nivel_en: "Proficient (C1)", nivel_es: "Competente (C1)", audio: "Portugues.mp3" },
        { nombre: "中文", nombre_en: "Chinese", bandera: "china.svg", nivel_en: "Beginner (HSK1)", nivel_es: "Principiante (HSK1)", audio: "Chino.mp3" }
    ];
    
    return `<div class="idiomas-grid">${idiomas.map(idioma => {
        const textBtn = currentLang === 'en' ? '🔊 Hear' : (idioma.audio === 'Galego.mp3' ? '🔊 Escoitar' : (idioma.audio === 'Portugues.mp3' ? '🔊 Ouvir' : (idioma.audio === 'Chino.mp3' ? '🔊 听' : '🔊 Escuchar')));
        return `
            <div class="idioma-card">
                <img src="assets/images/flags/${idioma.bandera}" alt="${idioma.nombre}" class="idioma-bandera" onerror="this.style.display='none'">
                <div class="idioma-nombre"><span class="en">${idioma.nombre_en || idioma.nombre}</span><span class="es" style="display:none">${idioma.nombre}</span></
