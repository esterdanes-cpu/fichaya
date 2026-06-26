import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'
const AUTO_HOURS = 8
const LOGO = 'data:image/jpeg;base64,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'
// ─── STYLES ────────────────────────────────────────────
const css = `
  /* DOCS */
  .worker-menu { max-width: 360px; margin: 0 auto; }
  .menu-greeting { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .menu-sub { color: var(--muted); font-size: .82rem; margin-bottom: 28px; }
  .menu-btns { display: flex; flex-direction: column; gap: 12px; }
  .menu-btn {
    background: var(--card); border: 1px solid var(--border);
    color: var(--text); font-size: 1rem; font-weight: 600;
    padding: 20px 24px; border-radius: 12px; cursor: pointer;
    text-align: left; font-family: inherit; transition: all .15s;
    display: flex; align-items: center; gap: 14px;
  }
  .menu-btn:hover { border-color: var(--accent); color: var(--white); }
  .menu-btn .menu-icon { font-size: 1.4rem; }
  .menu-btn .menu-label { display: flex; flex-direction: column; gap: 2px; }
  .menu-btn .menu-lbl-main { font-size: .95rem; font-weight: 600; color: var(--white); }
  .menu-btn .menu-lbl-sub { font-size: .75rem; color: var(--muted); font-weight: 400; }
  .menu-btn-back { background: none; border: none; color: var(--muted); font-size: .82rem; cursor: pointer; font-family: inherit; margin-bottom: 20px; display: flex; align-items: center; gap: 6px; padding: 0; }
  .doc-list { display: flex; flex-direction: column; gap: 10px; }
  .doc-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
  }
  .doc-info { display: flex; align-items: center; gap: 12px; }
  .doc-icon { font-size: 1.5rem; }
  .doc-name { font-weight: 600; color: var(--white); font-size: .9rem; }
  .doc-date { font-size: .72rem; color: var(--muted); margin-top: 2px; }
  .btn-download {
    background: var(--accent); border: none; color: var(--surface);
    font-size: .78rem; font-weight: 700; padding: 8px 14px;
    border-radius: 8px; cursor: pointer; font-family: inherit; white-space: nowrap;
  }
  .admin-doc-section { margin-top: 20px; }
  .doc-upload-row { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
  .file-input-label {
    background: var(--surface); border: 1px dashed var(--border);
    color: var(--muted); font-size: .8rem; padding: 9px 14px;
    border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;
  }
  .file-input-label:hover { border-color: var(--accent); color: var(--accent); }
  .doc-admin-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 9px; padding: 10px 14px; font-size: .84rem; margin-bottom: 6px;
  }
`  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');
  :root {
    --bg:      #3a3a3a;
    --surface: #2e2e2e;
    --card:    #343434;
    --border:  #4a4a4a;
    --accent:  #b5c9a0;
    --green:   #7aad5a;
    --red:     #d96b5a;
    --amber:   #d4a85a;
    --text:    #f0ede8;
    --muted:   #9a9590;
    --white:   #ffffff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height: 100dvh; }
  #root { min-height: 100dvh; display: flex; flex-direction: column; }

  .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 12px 20px; padding-top: max(12px, env(safe-area-inset-top)); display: flex; align-items: center; justify-content: space-between; }
  .logo-wrap { display: flex; align-items: center; gap: 12px; }
  .logo-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
  .logo-text { line-height: 1.2; }
  .logo-name { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 900; color: var(--white); letter-spacing: .04em; text-transform: uppercase; }
  .logo-sub { font-size: .65rem; color: var(--accent); letter-spacing: .12em; text-transform: uppercase; font-weight: 500; }
  .clock { font-size: .78rem; color: var(--muted); font-variant-numeric: tabular-nums; }

  .nav { background: var(--surface); border-bottom: 1px solid var(--border); display: flex; gap: 2px; padding: 8px 16px; }
  .nav-btn { background: none; border: none; cursor: pointer; color: var(--muted); font-size: .8rem; font-weight: 500; padding: 7px 16px; border-radius: 6px; transition: all .15s; font-family: inherit; border-bottom: 2px solid transparent; }
  .nav-btn.active { background: var(--card); color: var(--accent); border-bottom: 2px solid var(--accent); }
  .nav-btn:hover { background: var(--card); color: var(--text); }

  main { flex: 1; padding: 28px 20px; max-width: 900px; margin: 0 auto; width: 100%; }

  /* PIN */
  .pin-wrap { max-width: 320px; margin: 0 auto; }
  .pin-header { text-align: center; margin-bottom: 28px; }
  .pin-logo { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; margin: 0 auto 14px; display: block; }
  .pin-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .pin-sub { color: var(--muted); font-size: .82rem; }
  .pin-dots { display: flex; gap: 14px; justify-content: center; margin-bottom: 28px; }
  .pin-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); transition: background .15s; }
  .pin-dot.filled { background: var(--accent); }
  .pin-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
  .pin-btn { background: var(--card); border: 1px solid var(--border); color: var(--white); font-size: 1.3rem; font-weight: 600; padding: 18px; border-radius: 10px; cursor: pointer; transition: all .1s; user-select: none; font-family: inherit; }
  .pin-btn:active { transform: scale(.93); background: var(--border); }
  .pin-btn.del { font-size: .95rem; color: var(--muted); }
  .pin-btn.ok { background: var(--accent); border-color: var(--accent); color: var(--surface); font-weight: 700; }
  .pin-msg { text-align: center; font-size: .82rem; min-height: 22px; margin-top: 4px; }
  .pin-msg.err { color: var(--red); }

  /* CONFIRM */
  .confirm-wrap { text-align: center; }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--accent); color: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; margin: 0 auto 16px; font-family: 'Playfair Display', serif; }
  .confirm-name { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 6px; }
  .confirm-status { color: var(--muted); font-size: .82rem; margin-bottom: 28px; }
  .confirm-btns { display: flex; gap: 10px; }
  .btn-cancel { flex: 1; background: none; border: 1px solid var(--border); color: var(--muted); padding: 14px; border-radius: 10px; cursor: pointer; font-size: .88rem; font-family: inherit; }
  .btn-action { flex: 2; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: .95rem; font-weight: 700; font-family: inherit; transition: opacity .15s; }
  .btn-action:disabled { opacity: .6; cursor: not-allowed; }

  /* HISTORY */
  .hist-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
  .sel { background: var(--card); border: 1px solid var(--border); color: var(--text); font-size: .8rem; padding: 8px 12px; border-radius: 8px; outline: none; cursor: pointer; font-family: inherit; }
  .btn-export { margin-left: auto; background: var(--accent); border: none; color: var(--surface); font-size: .8rem; font-weight: 700; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
  table { width: 100%; border-collapse: collapse; font-size: .8rem; }
  thead th { text-align: left; color: var(--accent); font-weight: 600; font-size: .72rem; padding: 8px 10px; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: .08em; }
  tbody tr { border-bottom: 1px solid var(--border); }
  tbody tr:hover { background: var(--card); }
  tbody td { padding: 11px 10px; }
  .auto-tag { font-size: .67rem; background: rgba(212,168,90,.15); color: var(--amber); padding: 2px 6px; border-radius: 4px; margin-left: 4px; }
  .loc-link { color: var(--accent); font-size: .75rem; text-decoration: none; }
  .loc-acc { color: var(--muted); font-size: .7rem; margin-left: 3px; }
  .loc-denied { color: var(--amber); font-size: .73rem; }
  .empty { text-align: center; color: var(--muted); padding: 48px; }

  /* ADMIN */
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; border-top: 2px solid var(--accent); }
  .stat-val { font-size: 1.6rem; font-weight: 700; color: var(--white); font-family: 'Playfair Display', serif; }
  .stat-lbl { font-size: .72rem; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .06em; }
  .admin-grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
  @media(max-width:600px) { .admin-grid { grid-template-columns: 1fr; } }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .card-title { font-size: .72rem; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 16px; }
  .input-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .inp { flex: 1; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: .85rem; padding: 9px 12px; border-radius: 8px; outline: none; font-family: inherit; }
  .inp:focus { border-color: var(--accent); }
  .btn-sm { background: var(--accent); border: none; color: var(--surface); font-size: .8rem; font-weight: 700; padding: 9px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-family: inherit; }
  .btn-sm.danger { background: var(--red); color: #fff; }
  .worker-list { display: flex; flex-direction: column; gap: 8px; }
  .worker-row { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 10px 14px; font-size: .84rem; }
  .worker-name { font-weight: 600; color: var(--white); }
  .worker-pin { font-size: .72rem; color: var(--muted); font-family: monospace; margin-top: 2px; }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 20px; font-size: .7rem; font-weight: 600; background: rgba(181,201,160,.15); color: var(--accent); margin-left: 8px; }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .active-row { display: flex; align-items: center; justify-content: space-between; background: rgba(181,201,160,.07); border: 1px solid rgba(181,201,160,.25); border-radius: 9px; padding: 10px 14px; font-size: .84rem; margin-bottom: 8px; }
  .active-since { font-size: .72rem; color: var(--muted); margin-top: 2px; }
  .btn-force { background: none; border: 1px solid var(--red); color: var(--red); font-size: .72rem; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-family: inherit; }

  /* MODAL */
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 100; display: flex; align-items: center; justify-content: center; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; width: 300px; max-width: 92vw; border-top: 3px solid var(--accent); }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .modal-sub { color: var(--muted); font-size: .8rem; margin-bottom: 20px; }
  .btn-modal-cancel { width: 100%; margin-top: 10px; background: none; border: 1px solid var(--border); color: var(--muted); padding: 10px; border-radius: 8px; cursor: pointer; font-size: .82rem; font-family: inherit; }

  /* TOAST */
  .toast { position: fixed; bottom: max(28px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 22px; font-size: .82rem; white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,.5); z-index: 999; animation: fadeUp .2s ease; }
  .toast.ok { border-color: var(--accent); color: var(--accent); }
  .toast.err { border-color: var(--red); color: var(--red); }
  @keyframes fadeUp { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

  .loading { display: flex; align-items: center; justify-content: center; height: 120px; color: var(--muted); font-size: .9rem; gap: 10px; }
  .spinner { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`

// ─── HELPERS ───────────────────────────────────────────
function formatDur(mins) {
  const h = Math.floor(mins / 60), m = Math.round(mins % 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) }),
      () => resolve({ error: 'no_permission' }),
      { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
    )
  })
}

function LocCell({ loc }) {
  if (!loc) return <span style={{ color: 'var(--muted)' }}>—</span>
  if (loc.error) return <span className="loc-denied">Sin permiso</span>
  const url = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`
  return <>
    <a className="loc-link" href={url} target="_blank" rel="noreferrer">📍 Ver mapa</a>
    <span className="loc-acc">±{loc.acc}m</span>
  </>
}

// ─── SUPABASE QUERIES ──────────────────────────────────
async function fetchWorkers() {
  const { data } = await supabase.from('workers').select('*').order('name')
  return data || []
}
async function fetchRecords() {
  const { data } = await supabase.from('records').select('*').order('check_in', { ascending: false })
  return data || []
}

// ─── APP ───────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('pin')
  const [workers, setWorkers] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')
  const [toast, setToast] = useState(null)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const toastTimer = useRef(null)

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    const [w, r] = await Promise.all([fetchWorkers(), fetchRecords()])
    setWorkers(w); setRecords(r)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    const check = async () => {
      const now = new Date()
      const open = records.filter(r => !r.check_out)
      for (const r of open) {
        const diff = (now - new Date(r.check_in)) / 3600000
        if (diff >= AUTO_HOURS) {
          const autoOut = new Date(new Date(r.check_in).getTime() + AUTO_HOURS * 3600000).toISOString()
          await supabase.from('records').update({ check_out: autoOut, auto: true }).eq('id', r.id)
        }
      }
      if (open.length > 0) reload()
    }
    const t = setInterval(check, 60000)
    return () => clearInterval(t)
  }, [records, reload])

  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  function handleNav(v) {
    if (v === 'admin') { setShowAdminModal(true); return }
    setView(v)
  }

  return (
    <>
      <style>{css}</style>
      <div className="header">
        <div className="logo-wrap">
          <img className="logo-img" src={LOGO} alt="Estapé 1920" />
          <div className="logo-text">
            <div className="logo-name">Estapé 1920</div>
            <div className="logo-sub">Control de Jornada</div>
          </div>
        </div>
        <div className="clock">{clock}</div>
      </div>
      <nav className="nav">
        <button className={`nav-btn ${view === 'pin' ? 'active' : ''}`} onClick={() => handleNav('pin')}>⏱ Fichar</button>
        <button className={`nav-btn ${view === 'admin' ? 'active' : ''}`} onClick={() => handleNav('admin')}>⚙️ Admin</button>
      </nav>
      <main>
        {loading ? <div className="loading"><div className="spinner" /> Cargando...</div> : <>
          {view === 'pin' && <PinView workers={workers} records={records} reload={reload} showToast={showToast} />}
          {view === 'admin' && <AdminView workers={workers} records={records} reload={reload} showToast={showToast} />}
        </>}
      </main>
      {showAdminModal && (
        <AdminPinModal
          onSuccess={() => { setShowAdminModal(false); setView('admin') }}
          onClose={() => setShowAdminModal(false)}
        />
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}

// ─── PIN VIEW ──────────────────────────────────────────
function PinView({ workers, records, reload, showToast }) {
  const [buf, setBuf] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [worker, setWorker] = useState(null)   // identified worker
  const [screen, setScreen] = useState('pin')  // pin | menu | fichar | docs
  const [working, setWorking] = useState(false)

  function press(d) {
    if (buf.length >= 4) return
    const next = buf + d
    setBuf(next)
    setMsg({ text: '', type: '' })
    if (next.length === 4) submit(next)
  }

  function del() { setBuf(b => b.slice(0, -1)); setMsg({ text: '', type: '' }) }

  function submit(pin) {
    if (pin === ADMIN_PIN) {
      setBuf('')
      window.dispatchEvent(new CustomEvent('goto-admin'))
      return
    }
    const found = workers.find(w => w.pin === pin)
    if (!found) {
      setMsg({ text: 'PIN no reconocido', type: 'err' })
      setTimeout(() => setBuf(''), 600)
      return
    }
    setBuf('')
    setWorker(found)
    setScreen('menu')
  }

  function goBack() { setWorker(null); setScreen('pin') }

  async function doFichar() {
    if (!worker || working) return
    setWorking(true)
    const loc = await getLocation()
    await supabase.from('records').insert({ worker_id: worker.id, worker_name: worker.name, check_in: new Date().toISOString(), location_in: loc })
    showToast(`${worker.name} ha fichado entrada ✓`)
    await reload()
    setWorking(false)
    goBack()
  }

  useEffect(() => {
    const h = () => {}
    window.addEventListener('goto-admin', h)
    return () => window.removeEventListener('goto-admin', h)
  }, [])

  // PIN screen
  if (screen === 'pin') return (
    <div className="pin-wrap">
      <div className="pin-header">
        <img className="pin-logo" src={LOGO} alt="Estapé 1920" />
        <div className="pin-title">Control de Jornada</div>
        <div className="pin-sub">Introduce tu PIN personal</div>
      </div>
      <div className="pin-dots">
        {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${i < buf.length ? 'filled' : ''}`} />)}
      </div>
      <div className="pin-pad">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button key={d} className="pin-btn" onClick={() => press(d)}>{d}</button>
        ))}
        <button className="pin-btn del" onClick={del}>⌫</button>
        <button className="pin-btn" onClick={() => press('0')}>0</button>
        <button className="pin-btn ok" onClick={() => submit(buf)}>✓</button>
      </div>
      {msg.text && <div className={`pin-msg ${msg.type}`}>{msg.text}</div>}
    </div>
  )

  // Menu screen - after PIN identified
  if (screen === 'menu') {
    const open = records.find(r => r.worker_id === worker.id && !r.check_out)
    const initials = worker.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    return (
      <div className="pin-wrap">
        <div className="confirm-wrap" style={{marginBottom: 28}}>
          <div className="avatar">{initials}</div>
          <div className="confirm-name">{worker.name}</div>
          <div className="confirm-status">{open ? `En jornada desde ${new Date(open.check_in).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}` : 'Bienvenido/a'}</div>
        </div>
        <div className="menu-btns">
          <button className="menu-btn" onClick={() => setScreen('fichar')}>
            <span className="menu-icon">🟢</span>
            <span className="menu-label">
              <span className="menu-lbl-main">Fichar entrada</span>
              <span className="menu-lbl-sub">Registrar inicio de jornada</span>
            </span>
          </button>
          <button className="menu-btn" onClick={() => setScreen('docs')}>
            <span className="menu-icon">📄</span>
            <span className="menu-label">
              <span className="menu-lbl-main">Mis documentos</span>
              <span className="menu-lbl-sub">Contratos, nóminas y más</span>
            </span>
          </button>
          <button className="btn-cancel" onClick={goBack} style={{marginTop:4}}>Salir</button>
        </div>
      </div>
    )
  }

  // Fichar confirm screen
  if (screen === 'fichar') {
    const initials = worker.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    return (
      <div className="pin-wrap">
        <button className="menu-btn-back" onClick={() => setScreen('menu')}>← Volver</button>
        <div className="confirm-wrap">
          <div className="avatar">{initials}</div>
          <div className="confirm-name">{worker.name}</div>
          <div className="confirm-status">Listo para empezar jornada</div>
          <div className="confirm-btns">
            <button className="btn-cancel" onClick={() => setScreen('menu')}>Cancelar</button>
            <button
              className="btn-action"
              style={{ background: 'var(--green)', color: 'var(--surface)' }}
              onClick={doFichar}
              disabled={working}
            >
              {working ? '📍 Obteniendo ubicación...' : 'Confirmar ENTRADA'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Docs screen
  if (screen === 'docs') return (
    <div style={{maxWidth: 500, margin: '0 auto'}}>
      <button className="menu-btn-back" onClick={() => setScreen('menu')}>← Volver</button>
      <DocsView workerId={worker.id} workerName={worker.name} isAdmin={false} />
    </div>
  )

  return null
}

// ─── DOCS VIEW ─────────────────────────────────────────
function DocsView({ workerId, workerName, isAdmin, showToast }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [docName, setDocName] = useState('')

  useEffect(() => { fetchDocs() }, [workerId])

  async function fetchDocs() {
    setLoading(true)
    const { data } = await supabase.from('documents').select('*').eq('worker_id', workerId).order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  async function upload() {
    if (!selectedFile || !docName.trim()) return
    setUploading(true)
    const ext = selectedFile.name.split('.').pop()
    const path = `${workerId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('documents').upload(path, selectedFile)
    if (upErr) { showToast && showToast('Error al subir el archivo', 'err'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
    await supabase.from('documents').insert({ worker_id: workerId, worker_name: workerName, name: docName.trim(), url: publicUrl, path, file_type: ext })
    setDocName(''); setSelectedFile(null)
    await fetchDocs()
    setUploading(false)
    showToast && showToast('Documento subido ✓')
  }

  async function deleteDoc(doc) {
    if (!confirm(`¿Eliminar "${doc.name}"?`)) return
    await supabase.storage.from('documents').remove([doc.path])
    await supabase.from('documents').delete().eq('id', doc.id)
    await fetchDocs()
    showToast && showToast('Documento eliminado')
  }

  function fileIcon(ext) {
    if (!ext) return '📄'
    if (['pdf'].includes(ext)) return '📕'
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️'
    if (['doc','docx'].includes(ext)) return '📝'
    if (['xls','xlsx'].includes(ext)) return '📊'
    return '📄'
  }

  if (loading) return <div className="loading"><div className="spinner" /> Cargando documentos...</div>

  return (
    <div>
      {!isAdmin && <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700, color:'var(--white)', marginBottom:4}}>Mis documentos</div>
        <div style={{color:'var(--muted)', fontSize:'.82rem'}}>Documentos compartidos por la empresa</div>
      </div>}

      {isAdmin && (
        <div className="admin-doc-section">
          <div className="card-title" style={{marginBottom:12}}>Subir documento para {workerName}</div>
          <div className="doc-upload-row">
            <input className="inp" placeholder="Nombre del documento (ej. Nómina junio 2025)" value={docName} onChange={e => setDocName(e.target.value)} style={{minWidth:200}} />
            <label className="file-input-label">
              📎 {selectedFile ? selectedFile.name.slice(0,20)+'...' : 'Elegir archivo'}
              <input type="file" style={{display:'none'}} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" onChange={e => setSelectedFile(e.target.files[0])} />
            </label>
            <button className="btn-sm" onClick={upload} disabled={uploading || !selectedFile || !docName.trim()}>
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </div>
      )}

      {docs.length === 0
        ? <div className="empty" style={{padding:32}}>Sin documentos todavía</div>
        : <div className="doc-list">
            {docs.map(doc => (
              <div className="doc-row" key={doc.id}>
                <div className="doc-info">
                  <span className="doc-icon">{fileIcon(doc.file_type)}</span>
                  <div>
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-date">{new Date(doc.created_at).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <a className="btn-download" href={doc.url} target="_blank" rel="noreferrer" download>⬇ Descargar</a>
                  {isAdmin && <button className="btn-sm danger" onClick={() => deleteDoc(doc)} style={{padding:'8px 10px'}}>✕</button>}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

// ─── HISTORY VIEW ──────────────────────────────────────
function HistoryView({ workers, records }) {
  const [filterWorker, setFilterWorker] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const months = [...new Set(records.map(r => r.check_in.slice(0, 7)))].sort().reverse()
  let recs = [...records]
  if (filterWorker) recs = recs.filter(r => r.worker_id === filterWorker)
  if (filterMonth) recs = recs.filter(r => r.check_in.startsWith(filterMonth))

  function exportCSV() {
    const header = 'Trabajador;Fecha;Hora entrada;Lat entrada;Lng entrada;Hora salida;Lat salida;Lng salida;Duración (min);Salida automática'
    const rows = [...recs].reverse().map(r => {
      const cin = new Date(r.check_in)
      const cout = r.check_out ? new Date(r.check_out) : null
      const dur = cout ? Math.round((cout - cin) / 60000) : ''
      const li = r.location_in?.lat ? r.location_in : null
      const lo = r.location_out?.lat ? r.location_out : null
      return [r.worker_name, cin.toLocaleDateString('es-ES'), cin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), li ? li.lat : '', li ? li.lng : '', cout ? cout.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '', lo ? lo.lat : '', lo ? lo.lng : '', dur, r.auto ? 'Sí' : 'No'].join(';')
    })
    const csv = '\uFEFF' + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `fichajes_${filterMonth || 'completo'}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="hist-controls">
        <select className="sel" value={filterWorker} onChange={e => setFilterWorker(e.target.value)}>
          <option value="">Todos los trabajadores</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className="sel" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">Todos los meses</option>
          {months.map(m => { const [y, mo] = m.split('-'); return <option key={m} value={m}>{new Date(y, mo-1).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</option> })}
        </select>
        <button className="btn-export" onClick={exportCSV}>⬇ Exportar CSV</button>
      </div>
      {recs.length === 0 ? <div className="empty">Sin registros para este filtro</div> : (
        <table>
          <thead><tr><th>Trabajador</th><th>Fecha</th><th>Entrada</th><th>Ubic. entrada</th><th>Salida</th><th>Ubic. salida</th><th>Duración</th></tr></thead>
          <tbody>
            {recs.map(r => {
              const cin = new Date(r.check_in)
              const cout = r.check_out ? new Date(r.check_out) : null
              const dur = cout ? formatDur((cout-cin)/60000) : <span style={{color:'var(--green)'}}>En jornada</span>
              return (
                <tr key={r.id}>
                  <td>{r.worker_name}</td>
                  <td>{cin.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                  <td>{cin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><LocCell loc={r.location_in} /></td>
                  <td>{cout ? <>{cout.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}{r.auto && <span className="auto-tag">auto</span>}</> : '—'}</td>
                  <td>{cout ? <LocCell loc={r.location_out} /> : '—'}</td>
                  <td style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{dur}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── ADMIN VIEW ────────────────────────────────────────
function AdminView({ workers, records, reload, showToast }) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [adminTab, setAdminTab] = useState('dashboard')
  const active = records.filter(r => !r.check_out)

  async function addWorker() {
    if (!name.trim() || !/^\d{4}$/.test(pin)) { showToast('Nombre y PIN de 4 dígitos requeridos', 'err'); return }
    if (workers.some(w => w.pin === pin)) { showToast('Ese PIN ya está en uso', 'err'); return }
    await supabase.from('workers').insert({ name: name.trim(), pin })
    setName(''); setPin('')
    await reload()
    showToast('Trabajador añadido ✓')
  }

  async function removeWorker(id) {
    if (!confirm('¿Eliminar trabajador? Se conservarán sus registros.')) return
    await supabase.from('workers').delete().eq('id', id)
    await reload(); showToast('Trabajador eliminado')
  }

  async function forceOut(recId) {
    await supabase.from('records').update({ check_out: new Date().toISOString() }).eq('id', recId)
    await reload(); showToast('Salida registrada manualmente')
  }

  return (
    <div>
      <div style={{display:'flex',gap:'8px',marginBottom:'24px',borderBottom:'1px solid var(--border)',paddingBottom:'12px'}}>
        <button onClick={() => setAdminTab('dashboard')} style={{background: adminTab==='dashboard' ? 'var(--card)' : 'none', border:'none', color: adminTab==='dashboard' ? 'var(--accent)' : 'var(--muted)', padding:'7px 16px', borderRadius:'6px', cursor:'pointer', fontFamily:'inherit', fontSize:'.82rem', fontWeight:'500', borderBottom: adminTab==='dashboard' ? '2px solid var(--accent)' : '2px solid transparent'}}>📊 Panel</button>
        <button onClick={() => setAdminTab('history')} style={{background: adminTab==='history' ? 'var(--card)' : 'none', border:'none', color: adminTab==='history' ? 'var(--accent)' : 'var(--muted)', padding:'7px 16px', borderRadius:'6px', cursor:'pointer', fontFamily:'inherit', fontSize:'.82rem', fontWeight:'500', borderBottom: adminTab==='history' ? '2px solid var(--accent)' : '2px solid transparent'}}>📋 Historial</button>
        <button onClick={() => setAdminTab('docs')} style={{background: adminTab==='docs' ? 'var(--card)' : 'none', border:'none', color: adminTab==='docs' ? 'var(--accent)' : 'var(--muted)', padding:'7px 16px', borderRadius:'6px', cursor:'pointer', fontFamily:'inherit', fontSize:'.82rem', fontWeight:'500', borderBottom: adminTab==='docs' ? '2px solid var(--accent)' : '2px solid transparent'}}>📄 Documentos</button>
      </div>

      {adminTab === 'history' && <HistoryView workers={workers} records={records} />}

      {adminTab === 'docs' && <AdminDocsView workers={workers} showToast={showToast} />}

      {adminTab === 'dashboard' && <div>
      <div className="stat-grid">
        <div className="stat"><div className="stat-val">{records.length}</div><div className="stat-lbl">Registros totales</div></div>
        <div className="stat"><div className="stat-val">{active.length}</div><div className="stat-lbl">En jornada ahora</div></div>
        <div className="stat"><div className="stat-val">{workers.length}</div><div className="stat-lbl">Trabajadores</div></div>
      </div>
      <div className="admin-grid">
        <div className="card">
          <div className="card-title">Trabajadores</div>
          <div className="input-row">
            <input className="inp" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
            <input className="inp" placeholder="PIN" maxLength={4} type="password" value={pin} onChange={e => setPin(e.target.value)} style={{ width: 80, flex: 'none' }} />
            <button className="btn-sm" onClick={addWorker}>+</button>
          </div>
          <div className="worker-list">
            {workers.length === 0 && <div className="empty" style={{ padding: 16 }}>Sin trabajadores</div>}
            {workers.map(w => {
              const isIn = records.some(r => r.worker_id === w.id && !r.check_out)
              return (
                <div className="worker-row" key={w.id}>
                  <div>
                    <div className="worker-name">{w.name}{isIn && <span className="badge"><span className="badge-dot" />En jornada</span>}</div>
                    <div className="worker-pin">PIN: {'●'.repeat(4)}</div>
                  </div>
                  <button className="btn-sm danger" onClick={() => removeWorker(w.id)}>Eliminar</button>
                </div>
              )
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">En jornada ahora</div>
          {active.length === 0
            ? <div className="empty" style={{ padding: 20 }}>Nadie trabajando ahora</div>
            : active.map(r => {
              const cin = new Date(r.check_in)
              const mins = Math.round((Date.now() - cin) / 60000)
              return (
                <div className="active-row" key={r.id}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--white)' }}>{r.worker_name}</div>
                    <div className="active-since">Desde {cin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {formatDur(mins)}</div>
                  </div>
                  <button className="btn-force" onClick={() => forceOut(r.id)}>Fichar salida</button>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>}
    </div>
  )
}

// ─── ADMIN DOCS VIEW ──────────────────────────────────
function AdminDocsView({ workers, showToast }) {
  const [selectedWorker, setSelectedWorker] = useState('')

  const worker = workers.find(w => w.id === selectedWorker)

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div className="card-title" style={{marginBottom:10}}>Selecciona un trabajador</div>
        <select className="sel" value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)} style={{minWidth:220}}>
          <option value="">— Selecciona trabajador —</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      {worker && (
        <div className="card">
          <DocsView workerId={worker.id} workerName={worker.name} isAdmin={true} showToast={showToast} />
        </div>
      )}
    </div>
  )
}

// ─── ADMIN PIN MODAL ───────────────────────────────────
function AdminPinModal({ onSuccess, onClose }) {
  const [buf, setBuf] = useState('')
  const [err, setErr] = useState('')

  function press(d) {
    if (buf.length >= 4) return
    const next = buf + d
    setBuf(next); setErr('')
    if (next.length === 4) {
      if (next === ADMIN_PIN) { onSuccess() }
      else { setErr('PIN incorrecto'); setTimeout(() => setBuf(''), 600) }
    }
  }

  function del() { setBuf(b => b.slice(0, -1)); setErr('') }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Acceso administrador</div>
        <div className="modal-sub">Introduce el PIN de administrador</div>
        <div className="pin-dots" style={{ marginBottom: 20 }}>
          {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${i < buf.length ? 'filled' : ''}`} />)}
        </div>
        <div className="pin-pad">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button key={d} className="pin-btn" onClick={() => press(d)}>{d}</button>
          ))}
          <button className="pin-btn del" onClick={del}>⌫</button>
          <button className="pin-btn" onClick={() => press('0')}>0</button>
          <button className="pin-btn ok" onClick={() => { if (buf === ADMIN_PIN) onSuccess(); else setErr('PIN incorrecto') }}>✓</button>
        </div>
        {err && <div className="pin-msg err" style={{ marginTop: 8 }}>{err}</div>}
        <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
