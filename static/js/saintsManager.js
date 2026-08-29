/**
 * Módulo de Gestión de Santos de Devoción - EsquelasCreator
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
                 ? 'bg-gold-500/15 dark:bg-gold-500/20 border-gold-500 shadow-md shadow-gold-500/15 ring-2 ring-gold-500/30' 
                 : 'bg-white/70 dark:bg-bgreen-950/70 border-slate-200 dark:border-bpurple-800/40 hover:border-gold-500/60 hover:bg-white dark:hover:bg-bgreen-900/60'
             }">
          <div class="w-14 h-16 rounded-xl overflow-hidden bg-white shadow-inner mb-1.5 flex items-center justify-center p-1 border ${isSelected ? 'border-gold-400' : 'border-slate-200 dark:border-slate-800'}">
            <img src="${s.imagen_url}" alt="${s.nombre}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" onerror="this.src='/static/img/defaults/cruz_dorada.svg'">
          </div>
          <span class="text-[11px] font-semibold ${isSelected ? 'text-gold-600 dark:text-gold-300 font-bold' : 'text-slate-700 dark:text-slate-300'} line-clamp-1 leading-tight">
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
      <div class="relative glass-panel rounded-3xl p-4 flex flex-col items-center text-center group hover:scale-[1.02] border border-slate-200 dark:border-bpurple-800/40 transition-all shadow-lg">
        <span class="absolute top-3 right-3 text-[9px] font-bold px-2.5 py-0.5 rounded-full ${s.es_predeterminado ? 'bg-slate-200 dark:bg-bpurple-950 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-bpurple-800/40' : 'bg-gold-500/20 text-gold-600 dark:text-gold-300 border border-gold-500/30'}">
          ${s.es_predeterminado ? 'Oficial' : 'Personalizado'}
        </span>

        <div class="w-20 h-24 rounded-2xl overflow-hidden bg-white shadow-md p-1.5 border border-slate-200 dark:border-gold-500/30 mb-3 flex items-center justify-center">
          <img src="${s.imagen_url}" alt="${s.nombre}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" onerror="this.src='/static/img/defaults/cruz_dorada.svg'">
        </div>

        <h4 class="font-cinzel text-xs font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">${s.nombre}</h4>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 h-6">${s.titulo || 'Santo de Devoción'}</p>

        <div class="mt-auto w-full pt-3 border-t border-slate-200 dark:border-bpurple-800/30 flex items-center justify-between gap-2">
          <button onclick="saintsManager.useInEditor('${s.id}')" class="flex-1 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500 text-gold-600 dark:text-gold-300 hover:text-slate-950 text-[10px] font-bold transition-all border border-gold-500/40">
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

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('titulo', titulo);
    if (fileInput.files[0]) {
      formData.append('imagen', fileInput.files[0]);
    }

    try {
      const response = await fetch('/api/santos', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al guardar el santo');
      const newSanto = await response.json();
      
      this.closeAddModal();
      await this.loadSaints();
      this.setSelectedSaint(newSanto.id);
      app.showToast(`Santo "${nombre}" agregado con éxito`);
    } catch (error) {
      console.error('Error al guardar santo:', error);
      alert('Hubo un error al guardar el santo.');
    }
  },

  async deleteSanto(santoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este santo personalizado?')) return;

    try {
      const response = await fetch(`/api/santos/${santoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar santo');
      
      if (this.selectedSaintId === santoId) {
        this.selectedSaintId = null;
      }
      
      await this.loadSaints();
      app.showToast('Santo eliminado correctamente');
    } catch (error) {
      console.error('Error al borrar santo:', error);
      alert('No se pudo eliminar el santo.');
    }
  }
};
