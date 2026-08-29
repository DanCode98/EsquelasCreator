import os
import sqlite3
import uuid
import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['JSON_AS_ASCII'] = False
app.json.ensure_ascii = False
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'svg'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'static', 'img', 'santos'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'static', 'img', 'defaults'), exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.text_factory = str
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Tabla de Santos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS santos (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            titulo TEXT,
            imagen_url TEXT NOT NULL,
            es_predeterminado INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de Esquelas con soporte para librito díptico a doble cara
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS esquelas (
            id TEXT PRIMARY KEY,
            formato TEXT NOT NULL DEFAULT 'librito',
            nombre_finado TEXT NOT NULL,
            familia TEXT,
            fecha_nacimiento TEXT,
            fecha_defuncion TEXT,
            lugar_novenario TEXT,
            fecha_novenario TEXT,
            oracion TEXT,
            oracion_interior TEXT,
            datos_funeraria TEXT,
            foto_finado_url TEXT,
            santo_id TEXT,
            santo_nombre TEXT,
            santo_imagen_url TEXT,
            detalles_adicionales TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Migración de columnas si la tabla ya existía
    try:
        cursor.execute("ALTER TABLE esquelas ADD COLUMN familia TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE esquelas ADD COLUMN lugar_novenario TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE esquelas ADD COLUMN fecha_novenario TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE esquelas ADD COLUMN oracion_interior TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE esquelas ADD COLUMN datos_funeraria TEXT")
    except Exception:
        pass

    
    # Santos precargados con hermosas imágenes e ilustraciones solemnes
    santos_iniciales = [
        {
            "id": "virgen-guadalupe",
            "nombre": "Virgen de Guadalupe",
            "titulo": "Reina de México y Emperatriz de América",
            "imagen_url": "/static/img/santos/guadalupe.svg",
            "es_predeterminado": 1
        },
        {
            "id": "san-judas-tadeo",
            "nombre": "San Judas Tadeo",
            "titulo": "Patrono de las causas difíciles y desesperadas",
            "imagen_url": "/static/img/santos/san_judas.svg",
            "es_predeterminado": 1
        },
        {
            "id": "sagrado-corazon",
            "nombre": "Sagrado Corazón de Jesús",
            "titulo": "En Ti confío y descanso mi alma",
            "imagen_url": "/static/img/santos/sagrado_corazon.svg",
            "es_predeterminado": 1
        },
        {
            "id": "virgen-carmen",
            "nombre": "Virgen del Carmen",
            "titulo": "Protectora y auxiliadora de las almas",
            "imagen_url": "/static/img/santos/virgen_carmen.svg",
            "es_predeterminado": 1
        },
        {
            "id": "san-benito",
            "nombre": "San Benito de Nursia",
            "titulo": "Protector celestial contra todo mal",
            "imagen_url": "/static/img/santos/san_benito.svg",
            "es_predeterminado": 1
        },
        {
            "id": "san-miguel-arcangel",
            "nombre": "San Miguel Arcángel",
            "titulo": "Príncipe de la milicia celestial y guía de almas",
            "imagen_url": "/static/img/santos/san_miguel.svg",
            "es_predeterminado": 1
        },
        {
            "id": "divino-nino",
            "nombre": "Divino Niño Jesús",
            "titulo": "Todo lo que pidiereis con fe os será concedido",
            "imagen_url": "/static/img/santos/divino_nino.svg",
            "es_predeterminado": 1
        },
        {
            "id": "san-jose",
            "nombre": "San José",
            "titulo": "Patrono de la buena muerte y la familia",
            "imagen_url": "/static/img/santos/san_jose.svg",
            "es_predeterminado": 1
        }
    ]
    
    for s in santos_iniciales:
        cursor.execute("SELECT id FROM santos WHERE id = ?", (s['id'],))
        if not cursor.fetchone():
            cursor.execute('''
                INSERT INTO santos (id, nombre, titulo, imagen_url, es_predeterminado)
                VALUES (?, ?, ?, ?, ?)
            ''', (s['id'], s['nombre'], s['titulo'], s['imagen_url'], s['es_predeterminado']))
            
    conn.commit()
    conn.close()

init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ================= RUTAS DE FRONTEND =================
@app.route('/')
def index():
    return render_template('index.html')

# ================= RUTAS API SANTOS =================
@app.route('/api/santos', methods=['GET'])
def get_santos():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM santos ORDER BY es_predeterminado DESC, nombre ASC')
    rows = cursor.fetchall()
    santos = [dict(ix) for ix in rows]
    conn.close()
    return jsonify(santos)

@app.route('/api/santos', methods=['POST'])
def add_santo():
    nombre = request.form.get('nombre', '').strip()
    titulo = request.form.get('titulo', '').strip()
    
    if not nombre:
        return jsonify({'error': 'El nombre del santo es obligatorio'}), 400
        
    imagen_url = ''
    if 'imagen' in request.files:
        file = request.files['imagen']
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"santo_{uuid.uuid4().hex[:8]}.{ext}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            imagen_url = f"/static/uploads/{filename}"
            
    if not imagen_url:
        imagen_url = "/static/img/defaults/cruz_dorada.svg"
        
    santo_id = f"custom_{uuid.uuid4().hex[:8]}"
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO santos (id, nombre, titulo, imagen_url, es_predeterminado)
        VALUES (?, ?, ?, ?, 0)
    ''', (santo_id, nombre, titulo, imagen_url))
    conn.commit()
    
    cursor.execute('SELECT * FROM santos WHERE id = ?', (santo_id,))
    new_santo = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(new_santo), 201

@app.route('/api/santos/<santo_id>', methods=['DELETE'])
def delete_santo(santo_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM santos WHERE id = ?', (santo_id,))
    santo = cursor.fetchone()
    
    if not santo:
        conn.close()
        return jsonify({'error': 'Santo no encontrado'}), 404
        
    # Si es imagen subida por el usuario, intentamos borrar el archivo
    img_url = santo['imagen_url']
    if img_url and img_url.startswith('/static/uploads/'):
        filepath = os.path.join(BASE_DIR, img_url.lstrip('/'))
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass
                
    cursor.execute('DELETE FROM santos WHERE id = ?', (santo_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Santo eliminado correctamente'})

# ================= RUTAS API ESQUELAS =================
@app.route('/api/esquelas', methods=['GET'])
def get_esquelas():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM esquelas ORDER BY updated_at DESC')
    rows = cursor.fetchall()
    esquelas = [dict(ix) for ix in rows]
    conn.close()
    return jsonify(esquelas)

@app.route('/api/esquelas/<esquela_id>', methods=['GET'])
def get_esquela(esquela_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM esquelas WHERE id = ?', (esquela_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Esquela no encontrada'}), 404
    return jsonify(dict(row))

@app.route('/api/esquelas', methods=['POST'])
def create_esquela():
    formato = request.form.get('formato', 'librito')
    nombre_finado = request.form.get('nombre_finado', '').strip()
    familia = request.form.get('familia', '').strip()
    fecha_nacimiento = request.form.get('fecha_nacimiento', '').strip()
    fecha_defuncion = request.form.get('fecha_defuncion', '').strip()
    lugar_novenario = request.form.get('lugar_novenario', '').strip()
    fecha_novenario = request.form.get('fecha_novenario', '').strip()
    oracion = request.form.get('oracion', '').strip()
    oracion_interior = request.form.get('oracion_interior', '').strip()
    datos_funeraria = request.form.get('datos_funeraria', '').strip()
    santo_id = request.form.get('santo_id', '')
    santo_nombre = request.form.get('santo_nombre', '')
    santo_imagen_url = request.form.get('santo_imagen_url', '')
    detalles_adicionales = request.form.get('detalles_adicionales', '')
    
    if not nombre_finado:
        return jsonify({'error': 'El nombre del finado es obligatorio'}), 400
        
    foto_finado_url = request.form.get('foto_finado_url', '')
    if 'foto_finado' in request.files:
        file = request.files['foto_finado']
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"finado_{uuid.uuid4().hex[:8]}.{ext}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            foto_finado_url = f"/static/uploads/{filename}"
            
    esquela_id = f"esq_{uuid.uuid4().hex[:10]}"
    now = datetime.datetime.now().isoformat()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO esquelas (
            id, formato, nombre_finado, familia, fecha_nacimiento, fecha_defuncion,
            lugar_novenario, fecha_novenario, oracion, oracion_interior, datos_funeraria,
            foto_finado_url, santo_id, santo_nombre, santo_imagen_url,
            detalles_adicionales, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        esquela_id, formato, nombre_finado, familia, fecha_nacimiento, fecha_defuncion,
        lugar_novenario, fecha_novenario, oracion, oracion_interior, datos_funeraria,
        foto_finado_url, santo_id, santo_nombre, santo_imagen_url,
        detalles_adicionales, now, now
    ))
    conn.commit()
    
    cursor.execute('SELECT * FROM esquelas WHERE id = ?', (esquela_id,))
    new_esquela = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(new_esquela), 201

@app.route('/api/esquelas/<esquela_id>', methods=['PUT'])
def update_esquela(esquela_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM esquelas WHERE id = ?', (esquela_id,))
    existing = cursor.fetchone()
    
    if not existing:
        conn.close()
        return jsonify({'error': 'Esquela no encontrada'}), 404
        
    formato = request.form.get('formato', existing['formato'] if 'formato' in existing.keys() else 'librito')
    nombre_finado = request.form.get('nombre_finado', existing['nombre_finado']).strip()
    familia = request.form.get('familia', existing['familia'] if 'familia' in existing.keys() else '').strip()
    fecha_nacimiento = request.form.get('fecha_nacimiento', existing['fecha_nacimiento']).strip()
    fecha_defuncion = request.form.get('fecha_defuncion', existing['fecha_defuncion']).strip()
    lugar_novenario = request.form.get('lugar_novenario', existing['lugar_novenario'] if 'lugar_novenario' in existing.keys() else '').strip()
    fecha_novenario = request.form.get('fecha_novenario', existing['fecha_novenario'] if 'fecha_novenario' in existing.keys() else '').strip()
    oracion = request.form.get('oracion', existing['oracion']).strip()
    oracion_interior = request.form.get('oracion_interior', existing['oracion_interior'] if 'oracion_interior' in existing.keys() else '').strip()
    datos_funeraria = request.form.get('datos_funeraria', existing['datos_funeraria'] if 'datos_funeraria' in existing.keys() else '').strip()
    santo_id = request.form.get('santo_id', existing['santo_id'])
    santo_nombre = request.form.get('santo_nombre', existing['santo_nombre'])
    santo_imagen_url = request.form.get('santo_imagen_url', existing['santo_imagen_url'])
    detalles_adicionales = request.form.get('detalles_adicionales', existing['detalles_adicionales'])
    
    foto_finado_url = existing['foto_finado_url']
    if 'foto_finado' in request.files:
        file = request.files['foto_finado']
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"finado_{uuid.uuid4().hex[:8]}.{ext}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            foto_finado_url = f"/static/uploads/{filename}"
    elif request.form.get('eliminar_foto') == '1':
        foto_finado_url = ''
        
    now = datetime.datetime.now().isoformat()
    cursor.execute('''
        UPDATE esquelas SET
            formato = ?,
            nombre_finado = ?,
            familia = ?,
            fecha_nacimiento = ?,
            fecha_defuncion = ?,
            lugar_novenario = ?,
            fecha_novenario = ?,
            oracion = ?,
            oracion_interior = ?,
            datos_funeraria = ?,
            foto_finado_url = ?,
            santo_id = ?,
            santo_nombre = ?,
            santo_imagen_url = ?,
            detalles_adicionales = ?,
            updated_at = ?
        WHERE id = ?
    ''', (
        formato, nombre_finado, familia, fecha_nacimiento, fecha_defuncion,
        lugar_novenario, fecha_novenario, oracion, oracion_interior, datos_funeraria,
        foto_finado_url, santo_id, santo_nombre, santo_imagen_url,
        detalles_adicionales, now, esquela_id
    ))
    conn.commit()
    
    cursor.execute('SELECT * FROM esquelas WHERE id = ?', (esquela_id,))
    updated = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(updated)


@app.route('/api/esquelas/<esquela_id>', methods=['DELETE'])
def delete_esquela(esquela_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM esquelas WHERE id = ?', (esquela_id,))
    esquela = cursor.fetchone()
    
    if not esquela:
        conn.close()
        return jsonify({'error': 'Esquela no encontrada'}), 404
        
    cursor.execute('DELETE FROM esquelas WHERE id = ?', (esquela_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Esquela eliminada correctamente'})

# ================= RUTA SUBIDA INDEPENDIENTE =================
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Archivo no válido'}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"upload_{uuid.uuid4().hex[:8]}.{ext}"
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({'url': f"/static/uploads/{filename}"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    print(f"[OK] Servidor de Esquelas listo en http://127.0.0.1:{port}")
    try:
        app.run(host='127.0.0.1', port=port, debug=False)
    except Exception as e:
        print(f"Puerto {port} ocupado, intentando puerto 8080...")
        app.run(host='127.0.0.1', port=8080, debug=False)


