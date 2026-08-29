/**
 * Aplicación Principal EsquelasCreator - Funerarias Perpetuo Socorro
 * Sistema Moderno de Diseño Plano con Soporte Dúplex & Modo Claro/Oscuro
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

  // ================= MODO CLARO / OSCURO ROBUSTO =================
  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    this.updateThemeVisuals();
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateThemeVisuals();
    this.showToast(`Modo ${isDark ? 'Oscuro' : 'Claro'} activado`);
  },

  updateThemeVisuals() {
    const isDark = document.documentElement.classList.contains('dark');
    const optDark = document.getElementById('theme-opt-dark');
    const optLight = document.getElementById('theme-opt-light');
    if (optDark && optLight) {
      if (isDark) {
        optDark.className = 'theme-switch-option theme-switch-dark-active';
        optLight.className = 'theme-switch-option theme-switch-light-inactive';
      } else {
        optDark.className = 'theme-switch-option theme-switch-dark-inactive';
        optLight.className = 'theme-switch-option theme-switch-light-active';
      }
    }
    if (window.lucide) lucide.createIcons();
  },

  // ================= VALORES POR DEFECTO =================
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

    const activeClasses = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-bgreen-800 dark:bg-bpurple-800 text-white shadow-sm';
    const inactiveClasses = 'flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all';

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

    const fill1 = document.getElementById('progress-bar-fill-1');
    const fill2 = document.getElementById('progress-bar-fill-2');
    if (fill1) fill1.style.width = stepNumber >= 2 ? '100%' : '0%';
    if (fill2) fill2.style.width = stepNumber >= 3 ? '100%' : '0%';

    [1, 2, 3].forEach(n => {
      const ind = document.getElementById(`step-ind-${n}`);
      const content = document.getElementById(`step-${n}-content`);
      if (ind) {
        const badge = ind.querySelector('span:first-child');
        if (n === stepNumber) {
          ind.className = 'flex items-center gap-2.5 text-bgreen-800 dark:text-bpurple-400 font-bold cursor-pointer transition-all';
          if (badge) badge.className = 'w-8 h-8 rounded-xl bg-bgreen-800 dark:bg-bpurple-800 text-white flex items-center justify-center font-bold text-xs shadow-sm';
        } else if (n < stepNumber) {
          ind.className = 'flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer transition-all';
          if (badge) badge.className = 'w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm';
        } else {
          ind.className = 'flex items-center gap-2.5 text-slate-400 cursor-pointer transition-all hover:text-slate-600 dark:hover:text-slate-200';
          if (badge) badge.className = 'w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-medium text-xs border border-slate-300 dark:border-slate-700';
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
    const btnPrevExt = document.getElementById('btn-preview-exterior');
    const btnPrevInt = document.getElementById('btn-preview-interior');
    const btnSheetExt = document.getElementById('btn-sheet-exterior');
    const btnSheetInt = document.getElementById('btn-sheet-interior');

    const checkLib = document.getElementById('check-icon-librito');
    const checkSep = document.getElementById('check-icon-separador');
    const badgeLib = document.getElementById('badge-status-librito');
    const badgeSep = document.getElementById('badge-status-separador');

    const activeCardClass = 'group relative cursor-pointer rounded-2xl p-7 clean-card border-2 border-slate-900 dark:border-white bg-slate-100/70 dark:bg-slate-800/80 shadow-lg flex flex-col items-center text-center transition-all duration-200';
    const inactiveCardClass = 'group relative cursor-pointer rounded-2xl p-7 clean-card border border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm flex flex-col items-center text-center transition-all duration-200';

    const selectedBadgeHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i> SELECCIONADO`;
    const unselectedBadgeHTML = `<i data-lucide="circle" class="w-4 h-4"></i> Seleccionar`;

    if (cardSep && cardLib) {
      if (format === 'separador') {
        cardSep.className = activeCardClass;
        cardLib.className = inactiveCardClass;

        if (checkSep) { checkSep.classList.remove('hidden'); checkSep.classList.add('flex'); }
        if (checkLib) { checkLib.classList.add('hidden'); checkLib.classList.remove('flex'); }

        if (badgeSep) {
          badgeSep.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-sm';
          badgeSep.innerHTML = selectedBadgeHTML;
        }
        if (badgeLib) {
          badgeLib.className = 'flex items-center gap-1.5 px-3 py-1 text-slate-500 dark:text-slate-400 text-xs font-semibold';
          badgeLib.innerHTML = unselectedBadgeHTML;
        }

        if (switcher) switcher.classList.remove('hidden');
        if (containerInterior) containerInterior.classList.add('hidden');
        if (btnPrevExt) btnPrevExt.textContent = 'Frente (Difunto & Santo)';
        if (btnPrevInt) btnPrevInt.textContent = 'Contraportada';
        if (btnSheetExt) btnSheetExt.textContent = 'Pág 1: Frente (4x en Fila)';
        if (btnSheetInt) btnSheetInt.textContent = 'Pág 2: Contraportada (4x en Fila)';
      } else {
        cardLib.className = activeCardClass;
        cardSep.className = inactiveCardClass;

        if (checkLib) { checkLib.classList.remove('hidden'); checkLib.classList.add('flex'); }
        if (checkSep) { checkSep.classList.add('hidden'); checkSep.classList.remove('flex'); }

        if (badgeLib) {
          badgeLib.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-sm';
          badgeLib.innerHTML = selectedBadgeHTML;
        }
        if (badgeSep) {
          badgeSep.className = 'flex items-center gap-1.5 px-3 py-1 text-slate-500 dark:text-slate-400 text-xs font-semibold';
          badgeSep.innerHTML = unselectedBadgeHTML;
        }

        if (switcher) switcher.classList.remove('hidden');
        if (containerInterior) containerInterior.classList.remove('hidden');
        if (btnPrevExt) btnPrevExt.textContent = 'Cara Exterior';
        if (btnPrevInt) btnPrevInt.textContent = 'Cara Interior';
        if (btnSheetExt) btnSheetExt.textContent = 'Pág 1: Exterior (4x)';
        if (btnSheetInt) btnSheetInt.textContent = 'Pág 2: Interior (4x)';
      }
    }

    if (labelFmt) {
      labelFmt.textContent = `Formato: ${format === 'separador' ? 'Separadores en Fila (Dúplex 4x)' : 'Librito Díptico (Doble Cara 4x)'}`;
    }

    this.updatePreview();
    if (window.lucide) lucide.createIcons();
  },

  // ================= MANEJO DE VISTA PREVIA (CARAS) =================
  setPreviewFace(face) {
    this.previewFace = face;
    
    const isExt = face === 'exterior';
    const btnExt = document.getElementById('btn-preview-exterior');
    const btnInt = document.getElementById('btn-preview-interior');

    if (btnExt && btnInt) {
      if (isExt) {
        btnExt.className = 'px-3.5 py-1 rounded-lg bg-bgreen-800 dark:bg-bpurple-800 text-white font-bold transition-all';
        btnInt.className = 'px-3.5 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium';
      } else {
        btnInt.className = 'px-3.5 py-1 rounded-lg bg-bgreen-800 dark:bg-bpurple-800 text-white font-bold transition-all';
        btnExt.className = 'px-3.5 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium';
      }
    }

    this.updatePreview();
  },

  setSheetView(face) {
    this.sheetViewFace = face;

    const isExt = face === 'exterior';
    const btnExt = document.getElementById('btn-sheet-exterior');
    const btnInt = document.getElementById('btn-sheet-interior');

    if (btnExt && btnInt) {
      if (isExt) {
        btnExt.className = 'px-3.5 py-1.5 rounded-lg bg-bgreen-800 dark:bg-bpurple-800 text-white font-bold transition-all';
        btnInt.className = 'px-3.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium';
      } else {
        btnInt.className = 'px-3.5 py-1.5 rounded-lg bg-bgreen-800 dark:bg-bpurple-800 text-white font-bold transition-all';
        btnExt.className = 'px-3.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium';
      }
    }

    const data = this.getCurrentFormData();
    pdfGenerator.renderSheet(data, face);
  },

  // ================= RECOLECCIÓN DE DATOS DEL FORMULARIO =================
  getCurrentFormData() {
    const selectedSaint = saintsManager.getSelectedSaint();

    return {
      nombre_finado: document.getElementById('input-nombre')?.value.trim() || 'María Ángela Martínez Vázquez',
      familia: document.getElementById('input-familia')?.value.trim() || 'Sifuentes',
      fecha_nacimiento: document.getElementById('input-fecha-nac')?.value || '',
      fecha_defuncion: document.getElementById('input-fecha-def')?.value || '',
      lugar_novenario: document.getElementById('input-lugar')?.value.trim() || 'Huejúcar, Jalisco',
      fecha_novenario: document.getElementById('input-fecha-nov')?.value.trim() || 'Marzo del 2026',
      oracion: document.getElementById('input-oracion')?.value.trim() || 'Señor: nosotros a cuyos labios acercaste el amargo cáliz del dolor; bendecimos tu voluntad y te pedimos no separar en el cielo a los que en la tierra formábamos una familia.',
      oracion_interior: document.getElementById('input-oracion-interior')?.value.trim() || '',
      datos_funeraria: document.getElementById('input-datos-funeraria')?.value.trim() || '',
      foto_finado_url: this.formData.foto_finado_url || '/static/img/defaults/paloma_lineart.svg',
      santo_id: selectedSaint ? selectedSaint.id : '',
      santo_nombre: selectedSaint ? selectedSaint.nombre : '',
      santo_imagen_url: selectedSaint ? selectedSaint.imagen_url : '/static/img/santos/guadalupe.svg',
      formato: this.currentFormat
    };
  },

  // ================= ACTUALIZACIÓN DE VISTA PREVIA EN VIVO =================
  updatePreview() {
    const container = document.getElementById('single-preview-container');
    if (!container) return;

    const data = this.getCurrentFormData();
    this.updateCharCounter();

    let html = '';
    const isLibrito = data.formato === 'librito';

    if (isLibrito) {
      container.style.width = '420px';
      container.style.height = '320px';
      html = this.previewFace === 'exterior'
        ? pdfGenerator.generateBookletExteriorHTML(data)
        : pdfGenerator.generateBookletInteriorHTML(data);
    } else {
      container.style.width = '240px';
      container.style.height = '440px';
      html = this.previewFace === 'exterior'
        ? pdfGenerator.generateBookmarkFrontHTML(data)
        : pdfGenerator.generateBookmarkBackHTML(data);
    }

    container.innerHTML = html;
  },

  updateCharCounter() {
    const inputOracion = document.getElementById('input-oracion');
    const counter = document.getElementById('char-counter');
    if (!inputOracion || !counter) return;

    const length = inputOracion.value.length;
    counter.textContent = `${length} / 200`;
    counter.className = length >= 200 ? 'text-xs font-mono text-red-500 font-bold' : 'text-xs font-mono text-slate-400 font-medium';
  },

  applyPrayerPreset(presetText) {
    if (!presetText) return;
    const input = document.getElementById('input-oracion');
    if (input) {
      input.value = presetText;
      this.updatePreview();
    }
  },

  // ================= SUBIDA DE FOTO DIFUNTO =================
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.formData.foto_finado_url = e.target.result;
      this.formData.foto_finado_file = file;
      
      const thumb = document.getElementById('preview-photo-deceased-thumb');
      if (thumb) thumb.src = e.target.result;
      
      this.updatePreview();
      this.showToast('Foto cargada correctamente');
    };
    reader.readAsDataURL(file);
  },

  useDefaultPhoto(symbolType) {
    let url = '/static/img/defaults/paloma_lineart.svg';
    if (symbolType === 'cruz') url = '/static/img/defaults/cruz_dorada.svg';
    if (symbolType === 'vela') url = '/static/img/defaults/vela_recuerdo.svg';

    this.formData.foto_finado_url = url;
    this.formData.foto_finado_file = null;

    const thumb = document.getElementById('preview-photo-deceased-thumb');
    if (thumb) thumb.src = url;

    this.updatePreview();
    this.showToast('Símbolo seleccionado');
  },

  // ================= FORMATEO DE FECHAS =================
  formatDatesBooklet(d1, d2) {
    const formatSingle = (dStr, prefix = '') => {
      if (!dStr) return '';
      try {
        const parts = dStr.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[2], 10);
          const monthIndex = parseInt(parts[1], 10) - 1;
          const year = parts[0];
          const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          return `${prefix}${day} de ${months[monthIndex]} de ${year}`;
        }
      } catch (e) {
        console.warn(e);
      }
      return dStr;
    };

    return {
      nacimiento: formatSingle(d1, '* '),
      defuncion: formatSingle(d2, '† ')
    };
  },

  formatDatesForDisplay(d1, d2) {
    if (!d1 && !d2) return 'Fechas no especificadas';
    const dates = this.formatDatesBooklet(d1, d2);
    return `${dates.nacimiento}  ${dates.defuncion}`.trim();
  },

  // ================= GUARDAR Y REGISTRAR ESQUELA =================
  async saveCurrentEsquela(showSuccessToast = true) {
    const data = this.getCurrentFormData();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre_finado', data.nombre_finado);
      formDataToSend.append('familia', data.familia);
      formDataToSend.append('fecha_nacimiento', data.fecha_nacimiento);
      formDataToSend.append('fecha_defuncion', data.fecha_defuncion);
      formDataToSend.append('lugar_novenario', data.lugar_novenario);
      formDataToSend.append('fecha_novenario', data.fecha_novenario);
      formDataToSend.append('oracion', data.oracion);
      formDataToSend.append('oracion_interior', data.oracion_interior);
      formDataToSend.append('datos_funeraria', data.datos_funeraria);
      formDataToSend.append('santo_id', data.santo_id);
      formDataToSend.append('formato', data.formato);

      if (this.formData.foto_finado_file) {
        formDataToSend.append('foto_finado', this.formData.foto_finado_file);
      } else {
        formDataToSend.append('foto_finado_url', data.foto_finado_url);
      }

      let url = '/api/esquelas';
      let method = 'POST';

      if (this.editingEsquelaId) {
        url = `/api/esquelas/${this.editingEsquelaId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Error al guardar esquela');

      const saved = await response.json();
      await this.loadEsquelas();

      if (showSuccessToast) {
        this.showToast(this.editingEsquelaId ? 'Esquela actualizada' : 'Esquela guardada');
      }

      return saved;
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudo guardar la esquela. Verifica la información.');
      return null;
    }
  },

  // ================= CARGAR ESQUELAS GUARDADAS =================
  async loadEsquelas() {
    try {
      const response = await fetch('/api/esquelas');
      if (!response.ok) throw new Error('Error al obtener lista de esquelas');
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
      <div class="clean-card rounded-2xl p-5 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-between group">
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-14 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 flex-shrink-0">
                <img src="${e.foto_finado_url || '/static/img/defaults/paloma_lineart.svg'}" alt="${e.nombre_finado}" class="w-full h-full object-contain">
              </div>
              <div>
                <h4 class="font-outfit text-sm font-bold text-slate-900 dark:text-white line-clamp-1">${e.nombre_finado}</h4>
                ${e.familia ? `<p class="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Familia ${e.familia}</p>` : ''}
                <p class="text-[11px] text-slate-500 dark:text-slate-400">${this.formatDatesForDisplay(e.fecha_nacimiento, e.fecha_defuncion)}</p>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
              ${e.formato === 'separador' ? 'Separador' : 'Librito'}
            </span>
          </div>

          <p class="text-xs italic text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            "${e.oracion || ''}"
          </p>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <button onclick="pdfGenerator.downloadFromHistory('${e.id}')" class="flex-1 py-2.5 px-3 rounded-xl bg-bgreen-800 hover:bg-bgreen-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
            <i data-lucide="download" class="w-4 h-4 stroke-[2.5]"></i> PDF Dúplex
          </button>
          
          <button onclick="app.editEsquela('${e.id}')" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 transition-all" title="Editar">
            <i data-lucide="edit-2" class="w-4 h-4"></i>
          </button>

          <button onclick="app.duplicateEsquela('${e.id}')" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 transition-all" title="Duplicar">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>

          <button onclick="app.deleteEsquela('${e.id}')" class="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-xs border border-red-500/30 transition-all" title="Eliminar">
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

      this.editingEsquelaId = esquelaId;

      document.getElementById('input-nombre').value = data.nombre_finado || '';
      document.getElementById('input-familia').value = data.familia || '';
      document.getElementById('input-fecha-nac').value = data.fecha_nacimiento || '';
      document.getElementById('input-fecha-def').value = data.fecha_defuncion || '';
      document.getElementById('input-lugar').value = data.lugar_novenario || '';
      document.getElementById('input-fecha-nov').value = data.fecha_novenario || '';
      document.getElementById('input-oracion').value = data.oracion || '';
      
      const inInt = document.getElementById('input-oracion-interior');
      if (inInt) inInt.value = data.oracion_interior || '';

      this.formData.foto_finado_url = data.foto_finado_url || '/static/img/defaults/paloma_lineart.svg';
      const thumb = document.getElementById('preview-photo-deceased-thumb');
      if (thumb) thumb.src = this.formData.foto_finado_url;

      if (data.santo_id) {
        saintsManager.setSelectedSaint(data.santo_id);
      }

      this.selectFormat(data.formato || 'librito');

      const badgeContainer = document.getElementById('editing-badge-container');
      if (badgeContainer) badgeContainer.classList.remove('hidden');

      this.switchTab('editor');
      this.goToStep(2);
      this.showToast('Esquela cargada para edición');
    } catch (error) {
      console.error('Error al cargar esquela para edición:', error);
      alert('No se pudo cargar la esquela.');
    }
  },

  resetForm() {
    this.editingEsquelaId = null;
    document.getElementById('editing-badge-container')?.classList.add('hidden');
    this.initDefaultValues();
    this.selectFormat('librito');
    this.goToStep(1);
    this.showToast('Formulario restablecido');
  },

  async duplicateEsquela(esquelaId) {
    try {
      const response = await fetch(`/api/esquelas/${esquelaId}`);
      if (!response.ok) throw new Error('No se encontró la esquela');
      const data = await response.json();

      this.editingEsquelaId = null;
      document.getElementById('input-nombre').value = (data.nombre_finado || '') + ' (Copia)';
      document.getElementById('input-familia').value = data.familia || '';
      document.getElementById('input-fecha-nac').value = data.fecha_nacimiento || '';
      document.getElementById('input-fecha-def').value = data.fecha_defuncion || '';
      document.getElementById('input-lugar').value = data.lugar_novenario || '';
      document.getElementById('input-fecha-nov').value = data.fecha_novenario || '';
      document.getElementById('input-oracion').value = data.oracion || '';
      
      const inInt = document.getElementById('input-oracion-interior');
      if (inInt) inInt.value = data.oracion_interior || '';

      this.formData.foto_finado_url = data.foto_finado_url || '/static/img/defaults/paloma_lineart.svg';
      const thumb = document.getElementById('preview-photo-deceased-thumb');
      if (thumb) thumb.src = this.formData.foto_finado_url;

      if (data.santo_id) {
        saintsManager.setSelectedSaint(data.santo_id);
      }

      this.selectFormat(data.formato || 'librito');
      this.switchTab('editor');
      this.goToStep(2);
      this.showToast('Copia creada en el editor');
    } catch (error) {
      console.error('Error al duplicar esquela:', error);
      alert('No se pudo duplicar la esquela.');
    }
  },

  async deleteEsquela(esquelaId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta esquela guardada?')) return;

    try {
      const response = await fetch(`/api/esquelas/${esquelaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      await this.loadEsquelas();
      this.showToast('Esquela eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('No se pudo eliminar la esquela.');
    }
  },

  // ================= NOTIFICACIONES TOAST =================
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    if (!toast || !msg) return;

    msg.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
};

// ================= INICIALIZACIÓN GLOBAL =================
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
