/**
 * Módulo de Gestión de Santos de Devoción
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
             class="group cursor-pointer p-2 rounded-xl border transition-all flex flex-col items-center text-center ${
               isSelected 
                 ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10' 
                 : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
             }">
          <div class="w-12 h-14 rounded-lg overflow-hidden bg-slate-950 mb-1.5 flex items-center justify-center p-0.5 border ${isSelected ? 'border-amber-400' : 'border-slate-800'}">
            <img src="${s.imagen_url}" alt="${s.nombre}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" onerror="this.src='/static/img/defaults/cruz_dorada.svg'">
          </div>
          <span class="text-[10px] font-semibold ${isSelected ? 'text-amber-300' : 'text-slate-300'} line-clamp-1 leading-tight">
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
      <div class="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center group hover:border-amber-500/40 transition-all shadow-lg">
        <span class="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full ${s.es_predeterminado ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300'}">
          ${s.es_predeterminado ? 'Predeterminado' : 'Personalizado'}
        </span>

        <div class="w-20 h-24 rounded-xl overflow-hidden bg-slate-950 p-1 border border-slate-800 mb-3 flex items-center justify-center">
          <img src="${s.imagen_url}" alt="${s.nombre}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" onerror="this.src='/static/img/defaults/cruz_dorada.svg'">
        </div>

        <h4 class="font-cinzel text-xs font-bold text-white mb-1 line-clamp-1">${s.nombre}</h4>
        <p class="text-[10px] text-slate-400 mb-3 line-clamp-2 h-6">${s.titulo || 'Santo de Devoción'}</p>

        <div class="mt-auto w-full pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <button onclick="saintsManager.useInEditor('${s.id}')" class="flex-1 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-semibold transition-all">
            Usar
          </button>
          ${!s.es_predeterminado ? `
            <button onclick="saintsManager.deleteSanto('${s.id}')" class="p-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all" title="Eliminar Santo">
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
