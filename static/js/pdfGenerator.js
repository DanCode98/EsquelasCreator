/**
 * Módulo de Generación y Descarga de PDF con Soporte Horizontal (Landscape) y Dúplex
 */
const pdfGenerator = {
  imageCache: {},

  /**
   * Convierte cualquier imagen o SVG a PNG DataURL rasterizado en memoria
   */
  async toPngDataUrl(url, targetWidth = 400, targetHeight = 500) {
    if (!url) return '';
    if (this.imageCache[url]) return this.imageCache[url];

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const pngDataUrl = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Mantener proporciones
            const imgAspect = (img.width || 1) / (img.height || 1);
            const canvasAspect = targetWidth / targetHeight;
            let drawW = targetWidth;
            let drawH = targetHeight;
            let drawX = 0;
            let drawY = 0;

            if (imgAspect > canvasAspect) {
              drawH = targetWidth / imgAspect;
              drawY = (targetHeight - drawH) / 2;
            } else {
              drawW = targetHeight * imgAspect;
              drawX = (targetWidth - drawW) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            URL.revokeObjectURL(blobUrl);
            resolve(canvas.toDataURL('image/png', 1.0));
          } catch (err) {
            URL.revokeObjectURL(blobUrl);
            resolve(url);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          resolve(url);
        };
        img.src = blobUrl;
      });

      this.imageCache[url] = pngDataUrl;
      return pngDataUrl;
    } catch (e) {
      console.warn('Error convirtiendo a PNG DataURL:', url, e);
      return url;
    }
  },

  /**
   * =========================================================================
   * 1. FORMATO LIBRITO DÍPTICO - CARA EXTERIOR (Contraportada + Portada)
   * =========================================================================
   */
  generateBookletExteriorHTML(data) {
    const fotoSanto = data.santo_imagen_url || '/static/img/santos/guadalupe.svg';
    const oracionPortada = data.oracion || 'Señor: nosotros a cuyos labios acercaste el amargo cáliz del dolor; bendecimos tu voluntad y te pedimos no separar en el cielo a los que en la tierra formábamos una familia.';

    return `
      <div style="background-color: #ffffff; color: #0f172a; width: 100%; height: 100%; display: flex; box-sizing: border-box; font-family: 'Inter', sans-serif; position: relative; border: 1px solid #e2e8f0; overflow: hidden;">
        
        <!-- Línea central de doblado (sutil punteada) -->
        <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; border-left: 1px dashed #cbd5e1; pointer-events: none;"></div>

        <!-- ================= LADO IZQUIERDO: CONTRAPORTADA (FUNERARIA) ================= -->
        <div style="width: 50%; height: 100%; padding: 6px 8px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; box-sizing: border-box;">
          
          <!-- Logo Oficial Funerarias Perpetuo Socorro -->
          <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            <img src="${data.logo_funeraria_url || '/static/img/defaults/logo_perpetuo_socorro.jpg'}" alt="PS Funerarias" style="height: 48px; max-width: 90%; object-fit: contain; margin-bottom: 2px;">
            <div style="font-size: 6.8px; font-weight: 800; color: #1b2d2f; line-height: 1.15; text-transform: uppercase; font-family: 'Cinzel', serif;">
              FUNERARIAS, SALAS DE VELACIÓN<br>
              CAPILLAS Y CREMATORIO
            </div>
          </div>


          <!-- Datos de sucursales y teléfonos -->
          <div style="font-size: 6.2px; color: #1e293b; line-height: 1.3; margin: 2px 0;">
            <div style="font-weight: 700; color: #b91c1c;">Salas de Velación y Capilla</div>
            <div>Calzada La Suave Patria No. 97-B, Colonia Artesanos</div>
            <div>Tel. (494) 945-76-85</div>
            <div style="font-style: italic; color: #475569; margin-bottom: 2px;">Jerez de García Salinas, Zacatecas</div>

            <div style="font-weight: 700; color: #b91c1c;">Sucursal: Villanueva, Zacatecas</div>
            <div>Calzada Pascual Santoyo No. 77-B, Barrio de Santa Anita</div>
            <div>Tel. (499) 926-17-81</div>

            <div style="margin-top: 3px; font-weight: 700; color: #b91c1c;">
              † En Todo El País Sin Costo Para Usted †<br>
              <span style="font-size: 7.2px; color: #0f172a;">(800) 901-37-79</span>
            </div>
          </div>

          <!-- Viñeta Ornamental Floral Inferior -->
          <div style="width: 100%; display: flex; justify-content: center;">
            <img src="/static/img/defaults/adorno_floral.svg" alt="Ornamento" style="height: 14px; width: auto; object-fit: contain;">
          </div>
        </div>

        <!-- ================= LADO DERECHO: PORTADA (SANTO + ORACIÓN) ================= -->
        <div style="width: 50%; height: 100%; padding: 6px 8px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; box-sizing: border-box;">
          
          <!-- Estampa Grande del Santo de Devoción -->
          <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; min-height: 105px;">
            <img src="${fotoSanto}" alt="Santo" style="max-height: 115px; max-width: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));">
          </div>

          <!-- Oración de Portada -->
          <div style="padding: 2px 4px; width: 100%;">
            <p style="font-size: 7px; color: #1e293b; line-height: 1.3; font-family: 'Inter', sans-serif; font-weight: 500; margin: 0; text-align: center;">
              ${oracionPortada}
            </p>
          </div>

        </div>

      </div>
    `;
  },

  /**
   * =========================================================================
   * 2. FORMATO LIBRITO DÍPTICO - CARA INTERIOR (Plegaria + Finado & Familia)
   * =========================================================================
   */
  generateBookletInteriorHTML(data) {
    const nombre = data.nombre_finado || 'María Ángela Martínez Vázquez';
    const familia = data.familia || 'Sifuentes';
    const dates = app.formatDatesBooklet(data.fecha_nacimiento, data.fecha_defuncion);
    const lugar = data.lugar_novenario || 'Huejúcar, Jalisco';
    const fechaNov = data.fecha_novenario || 'Marzo del 2026';
    const fotoFinado = data.foto_finado_url || '/static/img/defaults/paloma_lineart.svg';
    
    const oracionInt = data.oracion_interior || `Dios todopoderoso, por la muerte de Jesucristo, tu Hijo, destruiste nuestra muerte; por su reposo en el sepulcro santificaste las sepulturas y por su gloriosa resurrección nos restituiste la vida a la inmortalidad. Escucha nuestra oración por aquellos que muertos en Cristo y sepultados en él, anhelan la feliz esperanza de la resurrección.\n\nConcede, Señor de vivos y muertos, a cuantos en la tierra te conocieron por la fe, alabarte sin fin en el cielo. Por Jesucristo, nuestro Señor. Amén.`;

    const parrafos = oracionInt.split('\n\n');

    return `
      <div style="background-color: #ffffff; color: #0f172a; width: 100%; height: 100%; display: flex; box-sizing: border-box; font-family: 'Inter', sans-serif; position: relative; border: 1px solid #e2e8f0; overflow: hidden;">
        
        <!-- Línea central de doblado (sutil) -->
        <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; border-left: 1px dashed #cbd5e1; pointer-events: none;"></div>

        <!-- ================= LADO IZQUIERDO: PÁGINA INTERIOR 1 (PLEGARIA) ================= -->
        <div style="width: 50%; height: 100%; padding: 10px 10px; display: flex; flex-direction: column; justify-content: center; text-align: center; box-sizing: border-box;">
          
          <div style="font-size: 7px; color: #1e293b; line-height: 1.4; font-family: 'Inter', sans-serif; font-style: italic;">
            <p style="margin: 0 0 6px 0;">
              "${parrafos[0] || oracionInt}"
            </p>
            ${parrafos[1] ? `<p style="margin: 0;">"${parrafos[1]}"</p>` : ''}
          </div>

        </div>

        <!-- ================= LADO DERECHO: PÁGINA INTERIOR 2 (DATOS FINADO Y FAMILIA) ================= -->
        <div style="width: 50%; height: 100%; padding: 8px 10px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; box-sizing: border-box;">
          
          <!-- Encabezado Familia y Agradecimiento -->
          <div style="width: 100%;">
            <div style="font-size: 9.5px; font-weight: 700; color: #0f172a;">
              La Familia
            </div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; border-bottom: 1.5px solid #0f172a; display: inline-block; padding: 0 6px; margin-bottom: 2px;">
              ${familia}
            </div>
            <div style="font-size: 6.8px; color: #334155; line-height: 1.2; margin-top: 1px;">
              Agradece a Usted (es) el habernos Acompañado al Novenario celebrado A favor del eterno descanso del alma de
            </div>
          </div>

          <!-- Nombre del Finado -->
          <div style="width: 100%; margin: 1px 0;">
            <h2 style="font-size: 10.5px; font-weight: 800; color: #0f172a; text-transform: none; line-height: 1.15; margin: 0; font-family: 'Inter', sans-serif;">
              ${nombre}
            </h2>
          </div>

          <!-- Paloma de la Paz o Foto del Finado -->
          <div style="width: 48px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <img src="${fotoFinado}" alt="Símbolo" style="max-height: 36px; max-width: 46px; object-fit: contain;">
          </div>

          <!-- Fechas Sacramentales -->
          <div style="font-size: 7px; font-weight: 700; color: #1e293b; line-height: 1.3;">
            <div>${dates.nacimiento}</div>
            <div>${dates.defuncion}</div>
          </div>

          <!-- Pie de página conmemorativo -->
          <div style="width: 100%; font-size: 6.5px; color: #475569; line-height: 1.2; margin-top: 1px;">
            <div style="margin-bottom: 1px; color: #1e293b;">Familiares y Amigos les piden elevar sus Oraciones a Dios Nuestro Señor</div>
            <div style="font-weight: 700; color: #0f172a;">${lugar}</div>
            <div>${fechaNov}</div>
          </div>

        </div>

      </div>
    `;
  },

  /**
   * =========================================================================
   * 3. FORMATO SEPARADOR DE LIBRO (Bookmark vertical)
   * =========================================================================
   */
  generateBookmarkHTML(data) {
    const nombre = data.nombre_finado || 'María Ángela Martínez Vázquez';
    const oracion = data.oracion || 'Señor: nosotros a cuyos labios acercaste el amargo cáliz del dolor; bendecimos tu voluntad y te pedimos no separar en el cielo a los que en la tierra formábamos una familia.';
    const dates = app.formatDatesBooklet(data.fecha_nacimiento, data.fecha_defuncion);
    const fotoFinado = data.foto_finado_url || '/static/img/defaults/paloma_lineart.svg';
    const fotoSanto = data.santo_imagen_url || '/static/img/santos/guadalupe.svg';
    const nombreSanto = data.santo_nombre || 'Virgen de Guadalupe';

    return `
      <div style="background-color: #ffffff; color: #0f172a; border: 2px solid #b45309; padding: 10px 8px; height: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between; position: relative; box-sizing: border-box; font-family: 'Cinzel', Georgia, serif; width: 100%;">
        <div style="position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px; border: 1px solid #d97706; pointer-events: none;"></div>
        
        <div style="width: 100%; padding-top: 2px;">
          <div style="color: #b45309; font-size: 8.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px;">
            † EN MEMORIA DE †
          </div>
          <div style="font-weight: 800; font-size: 12.5px; text-transform: uppercase; color: #0f172a; line-height: 1.15; padding: 0 2px;">
            ${nombre}
          </div>
          <div style="font-size: 8px; color: #475569; margin-top: 3px; font-family: 'Inter', sans-serif; font-weight: 600;">
            ${dates.nacimiento} &nbsp; ${dates.defuncion}
          </div>
        </div>

        <div style="margin: 6px 0; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 0 4px;">
          <div style="width: 72px; height: 98px; background-color: #ffffff; border: 1px solid #d97706; padding: 1px; display: flex; align-items: center; justify-content: center;">
            <img src="${fotoSanto}" alt="${nombreSanto}" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
          <div style="width: 72px; height: 98px; background-color: #ffffff; border: 1px solid #d97706; padding: 1px; display: flex; align-items: center; justify-content: center;">
            <img src="${fotoFinado}" alt="${nombre}" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
        </div>

        <div style="font-size: 8.5px; color: #92400e; letter-spacing: 1px; font-weight: 700; text-transform: uppercase;">
          ${nombreSanto}
        </div>

        <div style="margin: 4px 0; padding: 0 6px; text-align: center;">
          <div style="font-size: 8.5px; font-style: italic; color: #1e293b; line-height: 1.3; font-family: 'Inter', sans-serif;">
            "${oracion}"
          </div>
        </div>

        <div style="padding-bottom: 2px; width: 100%; border-top: 1px solid #fed7aa; padding-top: 3px; font-size: 7.5px; color: #64748b;">
          Recuerdo de sus familiares y novenario
        </div>
      </div>
    `;
  },

  /**
   * Renderiza la hoja de impresión seleccionada en pantalla (Horizontal para Librito)
   */
  renderSheet(data, face = 'exterior') {
    const container = document.getElementById('sheet-grid-items');
    const sheetContainer = document.getElementById('print-sheet-container');
    if (!container || !sheetContainer) return;

    const isLibrito = data.formato === 'librito';

    // Ajustar orientación del contenedor en pantalla (Horizontal para librito)
    if (isLibrito) {
      sheetContainer.className = 'sheet-letter-landscape p-5 relative select-none';
    } else {
      sheetContainer.className = 'sheet-letter p-6 relative select-none';
    }

    let singleHTML = '';
    if (!isLibrito) {
      singleHTML = this.generateBookmarkHTML(data);
    } else {
      singleHTML = face === 'exterior' 
        ? this.generateBookletExteriorHTML(data) 
        : this.generateBookletInteriorHTML(data);
    }

    container.innerHTML = `
      <div style="height: 100%; padding: 4px; box-sizing: border-box;">${singleHTML}</div>
      <div style="height: 100%; padding: 4px; box-sizing: border-box;">${singleHTML}</div>
      <div style="height: 100%; padding: 4px; box-sizing: border-box;">${singleHTML}</div>
      <div style="height: 100%; padding: 4px; box-sizing: border-box;">${singleHTML}</div>
    `;
  },

  /**
   * Helper para renderizar un pliego de 4 unidades a Canvas (Horizontal 1056x816px para Librito)
   */
  async capture4UpSheetToCanvas(htmlContent, isLandscape = true) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    
    // Dimensiones en píxeles @ 96 DPI:
    // Landscape (11in x 8.5in) = 1056px x 816px
    // Portrait (8.5in x 11in) = 816px x 1056px
    const w = isLandscape ? 1056 : 816;
    const h = isLandscape ? 816 : 1056;

    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.zIndex = '-99999';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.padding = '20px';
    wrapper.style.margin = '0';
    wrapper.style.overflow = 'hidden';

    wrapper.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: #ffffff;">
        <!-- Guías de corte centrales punteadas -->
        <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1px; border-top: 1px dashed #94a3b8; pointer-events: none; z-index: 10;"></div>
        <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; border-left: 1px dashed #94a3b8; pointer-events: none; z-index: 10;"></div>
        
        <!-- Cuadrícula 2x2 para las 4 esquelas -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 14px; width: 100%; height: 100%; box-sizing: border-box;">
          <div style="height: 100%; box-sizing: border-box; padding: 4px;">${htmlContent}</div>
          <div style="height: 100%; box-sizing: border-box; padding: 4px;">${htmlContent}</div>
          <div style="height: 100%; box-sizing: border-box; padding: 4px;">${htmlContent}</div>
          <div style="height: 100%; box-sizing: border-box; padding: 4px;">${htmlContent}</div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
    await new Promise(r => setTimeout(r, 150));

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: w,
      height: h
    });

    document.body.removeChild(wrapper);
    return canvas;
  },

  /**
   * Genera el PDF en orientación HORIZONTAL (Landscape) para Librito Dúplex (2 páginas)
   */
  async downloadCurrentSheetPDF(customData = null) {
    const btn = document.getElementById('btn-download-pdf');
    let originalBtnText = '';
    if (btn) {
      originalBtnText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin inline-block mr-1">⏳</span> Generando PDF Horizontal Dúplex...`;
    }

    try {
      const rawData = customData || app.getCurrentFormData();
      const isLibrito = (rawData.formato || 'librito') === 'librito';
      
      // 1. Convertir imágenes a PNG en memoria
      const fotoSantoPng = await this.toPngDataUrl(
        rawData.santo_imagen_url || '/static/img/santos/guadalupe.svg', 
        350, 
        480
      );
      const fotoFinadoPng = await this.toPngDataUrl(
        rawData.foto_finado_url || '/static/img/defaults/paloma_lineart.svg', 
        300, 
        300
      );
      const logoFunerariaPng = await this.toPngDataUrl(
        '/static/img/defaults/logo_perpetuo_socorro.jpg',
        320,
        320
      );

      const dataReady = {
        ...rawData,
        santo_imagen_url: fotoSantoPng,
        foto_finado_url: fotoFinadoPng,
        logo_funeraria_url: logoFunerariaPng
      };


      const { jsPDF } = window.jspdf;
      
      if (isLibrito) {
        // ================= PDF EN FORMATO HORIZONTAL (LANDSCAPE) =================
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'letter'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // PÁGINA 1 (Cara Exterior - 4 por hoja en horizontal)
        const htmlExterior = this.generateBookletExteriorHTML(dataReady);
        const canvasPage1 = await this.capture4UpSheetToCanvas(htmlExterior, true);
        const imgData1 = canvasPage1.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        // PÁGINA 2 (Cara Interior - 4 por hoja en horizontal para reverso)
        pdf.addPage('letter', 'landscape');
        const htmlInterior = this.generateBookletInteriorHTML(dataReady);
        const canvasPage2 = await this.capture4UpSheetToCanvas(htmlInterior, true);
        const imgData2 = canvasPage2.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const safeName = (dataReady.nombre_finado || 'Esquela')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 30);
        const filename = `Librito_Novenario_Horizontal_${safeName}_4porHoja.pdf`;

        pdf.save(filename);
        app.showToast('¡PDF Horizontal (2 Páginas Dúplex) descargado con éxito!');
      } else {
        // Separador de libro (Vertical)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const htmlBookmark = this.generateBookmarkHTML(dataReady);
        const canvasBookmark = await this.capture4UpSheetToCanvas(htmlBookmark, false);
        const imgData = canvasBookmark.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const safeName = (dataReady.nombre_finado || 'Esquela')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 30);
        const filename = `Separador_${safeName}_4porHoja.pdf`;

        pdf.save(filename);
        app.showToast('¡PDF de Separadores descargado!');
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un inconveniente al generar el PDF. Puedes usar la opción "Imprimir".');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
      }
    }
  },

  async downloadFromHistory(esquelaId) {
    try {
      const response = await fetch(`/api/esquelas/${esquelaId}`);
      if (!response.ok) throw new Error('No se encontró la esquela');
      const data = await response.json();
      await this.downloadCurrentSheetPDF(data);
    } catch (error) {
      console.error('Error en descarga desde historial:', error);
      alert('No se pudo generar el PDF de la esquela.');
    }
  }
};
