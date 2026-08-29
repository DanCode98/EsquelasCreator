/**
 * Aplicación Principal EsquelasCreator - Funerarias Perpetuo Socorro
 */
const app = {
  currentTab: 'editor',
  currentStep: 1,
  currentFormat: 'librito',
  previewFace: 'exterior',
  sheetViewFace: 'exterior',
  editingEsquelaId: null,
  
  formData: {
    nombre_finado: '',
    familia: '',
    fecha_nacimiento: '',
    fecha_defuncion: '',
    lugar_novenario: '',
    fecha_novenario: '',
    oracion: '',
    oracion_interior: '',
    datos_funeraria: '',
    foto_finado_url: '/static/img/defaults/paloma_lineart.svg',
    foto_finado_file: null,
    santo_id: '',
    santo_nombre: '',
    santo_imagen_url: '',
    formato: 'librito'
  },

  esquelas: [],

  async init() {
    this.initTheme();
    await saintsManager.init();
    await this.loadEsquelas();
    this.initDefaultValues();
    this.updatePreview();
    
    if (window.lucide) lucide.createIcons();
  },

  // ================= MODO CLARO / NOCTURNO =================
  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    this.updateThemeIcon();
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateThemeIcon();
    this.showToast(`Modo ${isDark ? 'Nocturno' : 'Claro'} activado`);
  },

  updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const iconContainer = document.getElementById('theme-icon');
    if (iconContainer) {
      iconContainer.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (window.lucide) lucide.createIcons();
    }
  },

  initDefaultValues() {
    const inputNombre = document.getElementById('input-nombre');
    const inputFamilia = document.getElementById('input-familia');
    const inputOracion = document.getElementById('input-oracion');
    const inputOracionInt = document.getElementById('input-oracion-interior');
    const inputLugar = document.getElementById('input-lugar');
    const inputFechaNov = document.getElementById('input-fecha-nov');
    const inputFuneraria = document.getElementById('input-datos-funeraria');
    
    if (inputNombre && !inputNombre.value) {
      inputNombre.value = 'María Ángela Martínez Vázquez';
    }
    if (inputFamilia && !inputFamilia.value) {
      inputFamilia.value = 'Sifuentes';
    }
    if (inputOracion && !inputOracion.value) {
      inputOracion.value = 'Señor: nosotros a cuyos labios acercaste el amargo cáliz del dolor; bendecimos tu voluntad y te pedimos no separar en el cielo a los que en la tierra formábamos una familia.';
    }
    if (inputOracionInt && !inputOracionInt.value) {
      inputOracionInt.value = `Dios todopoderoso, por la muerte de Jesucristo, tu Hijo, destruiste nuestra muerte; por su reposo en el sepulcro santificaste las sepulturas y por su gloriosa resurrección nos restituiste la vida a la inmortalidad. Escucha nuestra oración por aquellos que muertos en Cristo y sepultados en él, anhelan la feliz esperanza de la resurrección.\n\nConcede, Señor de vivos y muertos, a cuantos en la tierra te conocieron por la fe, alabarte sin fin en el cielo. Por Jesucristo, nuestro Señor. Amén.`;
    }
    if (inputLugar && !inputLugar.value) {
      inputLugar.value = 'Huejúcar, Jalisco';
    }
    if (inputFechaNov && !inputFechaNov.value) {
      inputFechaNov.value = 'Marzo del 2026';
    }
    if (inputFuneraria && !inputFuneraria.value) {
      inputFuneraria.value = `FUNERARIAS, SALAS DE VELACIÓN\nCAPILLAS Y CREMATORIO\nDEL PERPETUO SOCORRO\n\nSalas de Velación y Capilla\nCalzada La Suave Patria No. 97-B, Colonia Artesanos\nTel. (494) 945-76-85\nJerez de García Salinas, Zacatecas\n\nSucursal: Villanueva, Zacatecas\nCalzada Pascual Santoyo No. 77-B, Barrio de Santa Anita\nTel. (499) 926-17-81\n\n† En Todo El País Sin Costo Para Usted\n(800) 901-37-79`;
    }

    const dNac = document.getElementById('input-fecha-nac');
    const dDef = document.getElementById('input-fecha-def');
    if (dNac && !dNac.value) dNac.value = '1934-08-02';
    if (dDef && !dDef.value) dDef.value = '2026-02-28';

    this.updateCharCounter();
  },

  // ================= NAVEGACIÓN DE PESTAÑAS =================
  switchTab(tabName) {
    this.currentTab = tabName;

    const activeClasses = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-gradient-to-r from-bgreen-800 to-bpurple-800 text-white shadow-md shadow-bpurple-950/30 border border-bpurple-500/40';
    const inactiveClasses = 'flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-white hover:bg-bpurple-900/40 transition-all';

    const bEditor = document.getElementById('nav-editor');
    const bHist = document.getElementById('nav-history');
    const bSaints = document.getElementById('nav-saints');

    if (bEditor) bEditor.className = tabName === 'editor' ? activeClasses : inactiveClasses;
    if (bHist) bHist.className = tabName === 'history' ? activeClasses : inactiveClasses;
    if (bSaints) bSaints.className = tabName === 'saints' ? activeClasses : inactiveClasses;

    document.getElementById('tab-editor')?.classList.toggle('hidden', tabName !== 'editor');
    document.getElementById('tab-history')?.classList.toggle('hidden', tabName !== 'history');
    document.getElementById('tab-saints')?.classList.toggle('hidden', tabName !== 'saints');

    if (tabName === 'history') {
      this.loadEsquelas();
    } else if (tabName === 'saints') {
      saintsManager.loadSaints();
    }

    if (window.lucide) lucide.createIcons();
  },

  // ================= NAVEGACIÓN DE PASOS DEL WIZARD =================
  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    [1, 2, 3].forEach(n => {
      const ind = document.getElementById(`step-ind-${n}`);
      const content = document.getElementById(`step-${n}-content`);
      if (ind) {
        if (n === stepNumber) {
          ind.className = 'flex items-center gap-2.5 text-gold-500 font-bold cursor-pointer';
          ind.querySelector('span:first-child').className = 'w-8 h-8 rounded-xl bg-gradient-to-tr from-bgreen-800 to-gold-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-gold-500/20';
        } else if (n < stepNumber) {
          ind.className = 'flex items-center gap-2.5 text-emerald-500 dark:text-emerald-400 font-medium cursor-pointer';
          ind.querySelector('span:first-child').className = 'w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs';
        } else {
          ind.className = 'flex items-center gap-2.5 text-slate-400 cursor-pointer';
          ind.querySelector('span:first-child').className = 'w-8 h-8 rounded-xl bg-slate-200 dark:bg-bgreen-900/60 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-300 dark:border-bpurple-800/40';
        }
      }
      if (content) {
        content.classList.toggle('hidden', n !== stepNumber);
      }
    });

    if (stepNumber === 2) {
      this.updatePreview();
    } else if (stepNumber === 3) {
      const data = this.getCurrentFormData();
      pdfGenerator.renderSheet(data, this.sheetViewFace);
    }

    if (window.lucide) lucide.createIcons();
  },

  // ================= SELECCIÓN DE FORMATO =================
  selectFormat(format) {
    this.currentFormat = format;

    const cardSep = document.getElementById('card-format-separador');
    const cardLib = document.getElementById('card-format-librito');
    const labelFmt = document.getElementById('label-current-format');
    const switcher = document.getElementById('preview-face-switcher');
    const containerInterior = document.getElementById('container-oracion-interior');

    if (cardSep && cardLib) {
      if (format === 'separador') {
        cardSep.className = 'group relative cursor-pointer rounded-3xl p-7 glass-panel border-2 border-gold-500 shadow-2xl flex flex-col items-center text-center transition-all duration-300';
        cardLib.className = 'group relative cursor-pointer rounded-3xl p-7 glass-panel border-2 border-slate-300 dark:border-bgreen-900/50 hover:border-gold-400/80 shadow-xl flex flex-col items-center text-center transition-all duration-300';
        if (switcher) switcher.classList.add('hidden');
        if (containerInterior) containerInterior.classList.add('hidden');
      } else {
        cardLib.className = 'group relative cursor-pointer rounded-3xl p-7 glass-panel border-2 border-gold-500 shadow-2xl flex flex-col items-center text-center transition-all duration-300';
        cardSep.className = 'group relative cursor-pointer rounded-3xl p-7 glass-panel border-2 border-slate-300 dark:border-bgreen-900/50 hover:border-gold-400/80 shadow-xl flex flex-col items-center text-center transition-all duration-300';
        if (switcher) switcher.classList.remove('hidden');
        if (containerInterior) containerInterior.classList.remove('hidden');
      }
    }

    if (labelFmt) {
      labelFmt.textContent = `Formato: ${format === 'separador' ? 'Separador de Libro' : 'Librito Díptico (Doble Cara)'}`;
    }

    this.updatePreview();
  },

  setPreviewFace(face) {
    this.previewFace = face;
    const btnExt = document.getElementById('btn-preview-exterior');
    const btnInt = document.getElementById('btn-preview-interior');

    const activeBtn = 'px-3 py-1 rounded-lg bg-gradient-to-r from-bgreen-800 to-bpurple-800 text-white font-bold transition-all shadow-sm';
    const inactiveBtn = 'px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-white transition-all font-semibold';

    if (btnExt && btnInt) {
      btnExt.className = face === 'exterior' ? activeBtn : inactiveBtn;
      btnInt.className = face === 'interior' ? activeBtn : inactiveBtn;
    }

    this.updatePreview();
  },

  setSheetView(face) {
    this.sheetViewFace = face;
    const btnExt = document.getElementById('btn-sheet-exterior');
    const btnInt = document.getElementById('btn-sheet-interior');

    const activeBtn = 'px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-bgreen-800 to-bpurple-800 text-white shadow-sm transition-all';
    const inactiveBtn = 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-white transition-all';

    if (btnExt && btnInt) {
      btnExt.className = face === 'exterior' ? activeBtn : inactiveBtn;
      btnInt.className = face === 'interior' ? activeBtn : inactiveBtn;
    }

    const data = this.getCurrentFormData();
    pdfGenerator.renderSheet(data, face);
  },

  // ================= MANEJO DE FOTOGRAFÍA =================
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.formData.foto_finado_file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.formData.foto_finado_url = e.target.result;
      const thumb = document.getElementById('preview-photo-deceased-thumb');
      if (thumb) thumb.src = e.target.result;
      this.updatePreview();
    };
    reader.readAsDataURL(file);
  },

  useDefaultPhoto(type) {
    this.formData.foto_finado_file = null;
    let url = '/static/img/defaults/paloma_lineart.svg';
    if (type === 'cruz') url = '/static/img/defaults/cruz_dorada.svg';
    if (type === 'vela') url = '/static/img/defaults/vela_recuerdo.svg';
    if (type === 'paloma') url = '/static/img/defaults/paloma_paz.svg';

    this.formData.foto_finado_url = url;
    const thumb = document.getElementById('preview-photo-deceased-thumb');
    if (thumb) thumb.src = url;
    this.updatePreview();
  },

  // ================= ORACIONES Y CONTADOR =================
  applyPrayerPreset(presetText) {
    if (!presetText) return;
    const input = document.getElementById('input-oracion');
    if (input) {
      input.value = presetText;
      this.updateCharCounter();
      this.updatePreview();
    }
  },

  updateCharCounter() {
    const input = document.getElementById('input-oracion');
    const counter = document.getElementById('char-counter');
    if (input && counter) {
      const length = input.value.length;
      counter.textContent = `${length} / 200`;
      counter.className = length >= 200 ? 'text-xs font-mono text-red-500 font-bold' : 'text-xs font-mono text-gold-400 font-semibold';
    }
  },

  // ================= OBTENER DATOS DEL FORMULARIO =================
  getCurrentFormData() {
    const saint = saintsManager.getSelectedSaint();
    const nombre = document.getElementById('input-nombre')?.value.trim() || 'María Ángela Martínez Vázquez';
    const familia = document.getElementById('input-familia')?.value.trim() || 'Sifuentes';
    const fNac = document.getElementById('input-fecha-nac')?.value || '';
    const fDef = document.getElementById('input-fecha-def')?.value || '';
    const lugar = document.getElementById('input-lugar')?.value.trim() || 'Huejúcar, Jalisco';
    const fechaNov = document.getElementById('input-fecha-nov')?.value.trim() || 'Marzo del 2026';
    const oracion = document.getElementById('input-oracion')?.value.trim() || 'Señor: nosotros a cuyos labios acercaste el amargo cáliz del dolor; bendecimos tu voluntad y te pedimos no separar en el cielo a los que en la tierra formábamos una familia.';
    const oracionInt = document.getElementById('input-oracion-interior')?.value.trim() || `Dios todopoderoso, por la muerte de Jesucristo, tu Hijo, destruiste nuestra muerte; por su reposo en el sepulcro santificaste las sepulturas y por su gloriosa resurrección nos restituiste la vida a la inmortalidad. Escucha nuestra oración por aquellos que muertos en Cristo y sepultados en él, anhelan la feliz esperanza de la resurrección.\n\nConcede, Señor de vivos y muertos, a cuantos en la tierra te conocieron por la fe, alabarte sin fin en el cielo. Por Jesucristo, nuestro Señor. Amén.`;
    const datosFuneraria = document.getElementById('input-datos-funeraria')?.value.trim() || '';

    return {
      id: this.editingEsquelaId,
      formato: this.currentFormat,
      nombre_finado: nombre,
      familia: familia,
      fecha_nacimiento: fNac,
      fecha_defuncion: fDef,
      lugar_novenario: lugar,
      fecha_novenario: fechaNov,
      oracion: oracion,
      oracion_interior: oracionInt,
      datos_funeraria: datosFuneraria,
      foto_finado_url: this.formData.foto_finado_url || '/static/img/defaults/paloma_lineart.svg',
      santo_id: saint ? saint.id : '',
      santo_nombre: saint ? saint.nombre : 'Virgen de Guadalupe',
      santo_imagen_url: saint ? saint.imagen_url : '/static/img/santos/guadalupe.svg'
    };
  },

  // ================= ACTUALIZAR VISTA PREVIA INDIVIDUAL =================
  updatePreview() {
    this.updateCharCounter();
    const container = document.getElementById('single-preview-container');
    if (!container) return;

    const data = this.getCurrentFormData();
    
    if (data.formato === 'separador') {
      container.style.width = '240px';
      container.style.height = '440px';
      container.innerHTML = pdfGenerator.generateBookmarkHTML(data);
    } else {
      container.style.width = '360px';
      container.style.height = '255px';
      if (this.previewFace === 'exterior') {
        container.innerHTML = pdfGenerator.generateBookletExteriorHTML(data);
      } else {
        container.innerHTML = pdfGenerator.generateBookletInteriorHTML(data);
      }
    }
  },

  formatDatesBooklet(birthDateStr, deathDateStr) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const formatSingle = (dateStr) => {
      if (!dateStr) return '';
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = months[parseInt(parts[1], 10) - 1] || '';
          const day = parts[2].padStart(2, '0');
          return `${day} - ${month} - ${year}`;
        }
      } catch (e) {
        return dateStr;
      }
      return dateStr;
    };

    const fn = formatSingle(birthDateStr);
    const fd = formatSingle(deathDateStr);

    return {
      nacimiento: fn ? `* ${fn}` : '',
      defuncion: fd ? `† ${fd}` : ''
    };
  },

  formatDatesForDisplay(birthDateStr, deathDateStr) {
    const res = this.formatDatesBooklet(birthDateStr, deathDateStr);
    if (res.nacimiento && res.defuncion) {
      return `${res.nacimiento}   ${res.defuncion}`;
    }
    return res.defuncion || res.nacimiento || 'Recuerdo de Novenario';
  },

  // ================= PERSISTENCIA EN BASE DE DATOS =================
  async saveCurrentEsquela(andGoToStep3 = true) {
    const data = this.getCurrentFormData();

    if (!data.nombre_finado) {
      alert('Por favor introduce el nombre del finado');
      document.getElementById('input-nombre')?.focus();
      return;
    }

    const formData = new FormData();
    formData.append('formato', data.formato);
    formData.append('nombre_finado', data.nombre_finado);
    formData.append('familia', data.familia);
    formData.append('fecha_nacimiento', data.fecha_nacimiento);
    formData.append('fecha_defuncion', data.fecha_defuncion);
    formData.append('lugar_novenario', data.lugar_novenario);
    formData.append('fecha_novenario', data.fecha_novenario);
    formData.append('oracion', data.oracion);
    formData.append('oracion_interior', data.oracion_interior);
    formData.append('datos_funeraria', data.datos_funeraria);
    formData.append('santo_id', data.santo_id);
    formData.append('santo_nombre', data.santo_nombre);
    formData.append('santo_imagen_url', data.santo_imagen_url);
    formData.append('foto_finado_url', data.foto_finado_url);

    if (this.formData.foto_finado_file) {
      formData.append('foto_finado', this.formData.foto_finado_file);
    }

    try {
      let response;
      if (this.editingEsquelaId) {
        response = await fetch(`/api/esquelas/${this.editingEsquelaId}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('/api/esquelas', {
          method: 'POST',
          body: formData
        });
      }

      if (!response.ok) throw new Error('Error al guardar en la base de datos');
      const saved = await response.json();
      this.editingEsquelaId = saved.id;
      
      this.showToast('Esquela guardada en la base de datos con éxito');
      await this.loadEsquelas();

      if (andGoToStep3) {
        this.goToStep(3);
      }
    } catch (error) {
      console.error('Error al guardar esquela:', error);
      alert('No se pudo guardar la esquela en la base de datos.');
    }
  },

  // ================= CARGAR ESQUELAS GUARDADAS =================
  async loadEsquelas() {
    try {
      const response = await fetch('/api/esquelas');
      if (!response.ok) throw new Error('Error al listar esquelas');
      this.esquelas = await response.json();

      const badge = document.getElementById('badge-count-esquelas');
      if (badge) badge.textContent = this.esquelas.length;

      this.renderEsquelasList(this.esquelas);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  },

  filterEsquelas() {
    const query = (document.getElementById('search-esquelas')?.value || '').toLowerCase().trim();
    if (!query) {
      this.renderEsquelasList(this.esquelas);
      return;
    }
    const filtered = this.esquelas.filter(e => 
      (e.nombre_finado && e.nombre_finado.toLowerCase().includes(query)) ||
      (e.familia && e.familia.toLowerCase().includes(query)) ||
      (e.fecha_defuncion && e.fecha_defuncion.includes(query)) ||
      (e.santo_nombre && e.santo_nombre.toLowerCase().includes(query))
    );
    this.renderEsquelasList(filtered);
  },

  renderEsquelasList(list) {
    const container = document.getElementById('esquelas-list-container');
    const empty = document.getElementById('empty-esquelas-state');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');

    container.innerHTML = list.map(e => `
      <div class="glass-panel rounded-3xl p-5 shadow-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group border border-slate-200 dark:border-bpurple-800/40">
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-14 rounded-2xl overflow-hidden bg-white shadow-sm border border-gold-500/40 flex items-center justify-center p-0.5 flex-shrink-0">
                <img src="${e.foto_finado_url || '/static/img/defaults/paloma_lineart.svg'}" alt="${e.nombre_finado}" class="w-full h-full object-contain">
              </div>
              <div>
                <h4 class="font-cinzel text-sm font-bold text-slate-900 dark:text-white line-clamp-1">${e.nombre_finado}</h4>
                ${e.familia ? `<p class="text-[10px] text-gold-500 font-serif font-bold italic">Familia ${e.familia}</p>` : ''}
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-sans">${this.formatDatesForDisplay(e.fecha_nacimiento, e.fecha_defuncion)}</p>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-bpurple-800/20 text-bpurple-600 dark:text-gold-300 border border-bpurple-600/30 uppercase">
              ${e.formato === 'separador' ? 'Separador' : 'Librito'}
            </span>
          </div>

          <p class="text-xs italic text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 font-serif bg-white/40 dark:bg-bgreen-950/70 p-3 rounded-2xl border border-slate-200 dark:border-bpurple-900/40">
            "${e.oracion || ''}"
          </p>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-bpurple-800/30 flex items-center justify-between gap-2">
          <button onclick="pdfGenerator.downloadFromHistory('${e.id}')" class="flex-1 py-2 px-3 rounded-xl gradient-gold-btn text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> PDF Dúplex
          </button>
          
          <button onclick="app.editEsquela('${e.id}')" class="p-2 rounded-xl bg-slate-200 dark:bg-bgreen-950 hover:bg-slate-300 dark:hover:bg-bgreen-900 text-slate-700 dark:text-slate-200 text-xs border border-slate-300 dark:border-slate-800" title="Editar">
            <i data-lucide="edit-2" class="w-4 h-4 text-gold-500"></i>
          </button>

          <button onclick="app.duplicateEsquela('${e.id}')" class="p-2 rounded-xl bg-slate-200 dark:bg-bgreen-950 hover:bg-slate-300 dark:hover:bg-bgreen-900 text-slate-700 dark:text-slate-200 text-xs border border-slate-300 dark:border-slate-800" title="Duplicar">
            <i data-lucide="copy" class="w-4 h-4 text-bpurple-400"></i>
          </button>

          <button onclick="app.deleteEsquela('${e.id}')" class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs border border-red-500/20 transition-all" title="Eliminar">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  // ================= CARGAR ESQUELA PARA EDITAR =================
  async editEsquela(esquelaId) {
    try {
      const response = await fetch(`/api/esquelas/${esquelaId}`);
      if (!response.ok) throw new Error('No se pudo encontrar la esquela');
      const data = await response.json();

      this.editingEsquelaId = data.id;
      this.currentFormat = data.formato || 'librito';

      document.getElementById('input-nombre').value = data.nombre_finado || '';
      if (document.getElementById('input-familia')) {
        document.getElementById('input-familia').value = data.familia || '';
      }
      document.getElementById('input-fecha-nac').value = data.fecha_nacimiento || '';
      document.getElementById('input-fecha-def').value = data.fecha_defuncion || '';
      if (document.getElementById('input-lugar')) {
        document.getElementById('input-lugar').value = data.lugar_novenario || '';
      }
      if (document.getElementById('input-fecha-nov')) {
        document.getElementById('input-fecha-nov').value = data.fecha_novenario || '';
      }
      document.getElementById('input-oracion').value = data.oracion || '';
      if (document.getElementById('input-oracion-interior')) {
        document.getElementById('input-oracion-interior').value = data.oracion_interior || '';
      }
      if (document.getElementById('input-datos-funeraria')) {
        document.getElementById('input-datos-funeraria').value = data.datos_funeraria || '';
      }

      this.formData.foto_finado_url = data.foto_finado_url || '/static/img/defaults/paloma_lineart.svg';
      this.formData.foto_finado_file = null;

      const thumb = document.getElementById('preview-photo-deceased-thumb');
      if (thumb) thumb.src = this.formData.foto_finado_url;

      if (data.santo_id) {
        saintsManager.setSelectedSaint(data.santo_id);
      }

      this.selectFormat(this.currentFormat);

      const badgeContainer = document.getElementById('editing-badge-container');
      if (badgeContainer) badgeContainer.classList.remove('hidden');

      this.switchTab('editor');
      this.goToStep(2);
      this.showToast(`Editando esquela de "${data.nombre_finado}"`);
    } catch (error) {
      console.error('Error al cargar esquela:', error);
      alert('Error al abrir la esquela para editar.');
    }
  },

  async duplicateEsquela(esquelaId) {
    try {
      const response = await fetch(`/api/esquelas/${esquelaId}`);
      if (!response.ok) throw new Error('No se encontró la esquela');
      const data = await response.json();

      this.editingEsquelaId = null;
      document.getElementById('input-nombre').value = `${data.nombre_finado} (Copia)`;
      if (document.getElementById('input-familia')) document.getElementById('input-familia').value = data.familia || '';
      document.getElementById('input-fecha-nac').value = data.fecha_nacimiento || '';
      document.getElementById('input-fecha-def').value = data.fecha_defuncion || '';
      if (document.getElementById('input-lugar')) document.getElementById('input-lugar').value = data.lugar_novenario || '';
      if (document.getElementById('input-fecha-nov')) document.getElementById('input-fecha-nov').value = data.fecha_novenario || '';
      document.getElementById('input-oracion').value = data.oracion || '';
      if (document.getElementById('input-oracion-interior')) document.getElementById('input-oracion-interior').value = data.oracion_interior || '';
      
      this.formData.foto_finado_url = data.foto_finado_url || '/static/img/defaults/paloma_lineart.svg';
      if (data.santo_id) saintsManager.setSelectedSaint(data.santo_id);
      this.selectFormat(data.formato || 'librito');

      this.switchTab('editor');
      this.goToStep(2);
      this.showToast('Esquela duplicada en el editor.');
    } catch (error) {
      console.error('Error al duplicar:', error);
    }
  },

  async deleteEsquela(esquelaId) {
    if (!confirm('¿Deseas eliminar este registro de esquela?')) return;

    try {
      const response = await fetch(`/api/esquelas/${esquelaId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      
      await this.loadEsquelas();
      this.showToast('Esquela eliminada de la base de datos');
    } catch (error) {
      console.error('Error al eliminar esquela:', error);
      alert('No se pudo eliminar la esquela.');
    }
  },

  resetForm() {
    this.editingEsquelaId = null;
    const badgeContainer = document.getElementById('editing-badge-container');
    if (badgeContainer) badgeContainer.classList.add('hidden');
    this.initDefaultValues();
    this.goToStep(1);
  },

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    if (!toast || !msg) return;

    msg.textContent = message;
    toast.classList.remove('hidden');
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
