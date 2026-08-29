/**
 * Módulo de Gestión de Santos de Devoción - EsquelasCreator
 * Estilo Moderno y Plano
 */
const saintsManager = {
  saints: [],
  selectedSaintId: null,

  async init() {
    await this.loadSaints();
  },

  async loadSaints() {
    try {
      const response = await fetch('/api/santos');
      if (!response.ok) throw new Error('Error al cargar los santos');
      this.saints = await response.json();
      
      // Si no hay seleccionado y hay santos, seleccionar el primero por defecto
      if (!this.selectedSaintId && this.saints.length > 0) {
        this.selectedSaintId = this.saints[0].id;
      }
      
      this.renderSelectorGrid();
      this.renderCatalogGrid();
    } catch (error) {
      console.error('Error al obtener santos:', error);
      app.showToast('No se pudieron cargar los santos', 'error');
    }
  },

  getSelectedSaint() {
    return this.saints.find(s => s.id === this.selectedSaintId) || this.saints[0] || null;
  },

  setSelectedSaint(santoId) {
    this.selectedSaintId = santoId;
    this.renderSelectorGrid();
    app.updatePreview();
  },

  renderSelectorGrid() {
    const container = document.getElementById('saints-selector-grid');
    if (!container) return;

    if (this.saints.length === 0) {
      container.innerHTML = `<div class="col-span-full py-4 text-center text-xs text-slate-500">No hay santos disponibles. Agrega uno nuevo.</div>`;
      return;
    }

    container.innerHTML = this.saints.map(s => {
      const isSelected = s.id === this.selectedSaintId;
      return `
        <div onclick="saintsManager.setSelectedSaint('${s.id}')" 
             class="group cursor-pointer p-2.5 rounded-2xl border transition-all flex flex-col items-center text-center ${
               isSelected 
                 ? 'bg-bpurple-800 text-white border-bpurple-700 shadow-md ring-2 ring-bpurple-500' 
                 : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-bpurple-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/80'
             }">
          <div class="w-14 h-16 rounded-xl overflow-hidden bg-white shadow-sm mb-1.5 flex items-center justify-center p-1 border ${isSelected ? 'border-white/40' : 'border-slate-200 dark:border-slate-700'}">
            <img src="${s.imagen_url}" alt="${s.nombre}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" onerror="this.src='/static/img/defaults/cruz_dorada.svg'">
          </div>
          <span class="text-[11px] font-semibold ${isSelected ? 'text-white font-bold' : 'text-slate-700 dark:text-slate-300'} line-clamp-1 leading-tight">
            ${s.nombre}
          </span>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  renderCatalogGrid() {
    const container = document.getElementById('saints-catalog-grid');
    if (!container) return;

    if (this.saints.length === 0) {
      container.innerHTML = `<div class="col-span-full py-12 text-center text-sm text-slate-500">No hay santos registrados.</div>`;
      return;
    }

    container.innerHTML = this.saints.map(s => `
      <div class="relative clean-card rounded-2xl p-4 flex flex-col items-center text-center group hover:border-slate-400 dark:hover:border-slate-600 transition-all">
        <span class="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full ${s.es_predeterminado ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' : 'bg-bpurple-800/20 text-bpurple-700 dark:text-bpurple-300 border border-bpurple-500/30'}">
          ${s.es_predeterminado ? 'Oficial' : 'Personalizado'}
        </span>

        <div class="w-20 h-24 rounded-xl overflow-hidden bg-white shadow-sm p-1.5 border border-slate-200 dark:border-slate-700 mb-3 flex items-center justify-center">
          <img src="${s.imagen_url}" alt="${s.nombre}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" onerror="this.src='/static/img/defaults/cruz_dorada.svg'">
        </div>

        <h4 class="font-outfit text-xs font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">${s.nombre}</h4>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 h-6">${s.titulo || 'Santo de Devoción'}</p>

        <div class="mt-auto w-full pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <button onclick="saintsManager.useInEditor('${s.id}')" class="flex-1 py-1.5 rounded-xl bg-bgreen-800 text-white hover:bg-bgreen-700 text-[10px] font-bold transition-all">
            Usar en Editor
          </button>
          ${!s.es_predeterminado ? `
            <button onclick="saintsManager.deleteSanto('${s.id}')" class="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs border border-red-500/20 transition-all" title="Eliminar Santo">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  useInEditor(santoId) {
    this.setSelectedSaint(santoId);
    app.switchTab('editor');
    app.goToStep(2);
    app.showToast('Santo seleccionado para la esquela');
  },

  openAddModal() {
    const modal = document.getElementById('modal-add-santo');
    if (modal) modal.classList.remove('hidden');
    document.getElementById('modal-santo-nombre')?.focus();
    if (window.lucide) lucide.createIcons();
  },

  closeAddModal() {
    const modal = document.getElementById('modal-add-santo');
    if (modal) modal.classList.add('hidden');
    document.getElementById('form-add-santo')?.reset();
  },

  async handleSaveSanto(event) {
    event.preventDefault();
    const nombre = document.getElementById('modal-santo-nombre').value.trim();
    const titulo = document.getElementById('modal-santo-titulo').value.trim();
    const fileInput = document.getElementById('modal-santo-file');

    if (!nombre) {
      alert('Por favor ingrese el nombre del santo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('titulo', titulo);
      if (fileInput.files.length > 0) {
        formData.append('imagen', fileInput.files[0]);
      }

      const response = await fetch('/api/santos', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al guardar');
      
      const newSanto = await response.json();
      this.saints.push(newSanto);
      this.selectedSaintId = newSanto.id;
      
      this.renderSelectorGrid();
      this.renderCatalogGrid();
      this.closeAddModal();
      app.updatePreview();
      app.showToast(`Santo "${nombre}" agregado con éxito`);
    } catch (error) {
      console.error('Error al guardar santo:', error);
      alert('No se pudo guardar el santo. Intenta nuevamente.');
    }
  },

  async deleteSanto(santoId) {
    if (!confirm('¿Seguro que deseas eliminar este santo personalizado?')) return;

    try {
      const response = await fetch(`/api/santos/${santoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al eliminar');
      }

      this.saints = this.saints.filter(s => s.id !== santoId);
      if (this.selectedSaintId === santoId && this.saints.length > 0) {
        this.selectedSaintId = this.saints[0].id;
      }

      this.renderSelectorGrid();
      this.renderCatalogGrid();
      app.updatePreview();
      app.showToast('Santo eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.message || 'No se pudo eliminar el santo');
    }
  }
};
