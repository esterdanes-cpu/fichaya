import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'
const AUTO_HOURS = 8

// ─── STYLES ────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  :root {
    --bg: #0f1117; --surface: #1a1d27; --card: #222536; --border: #2e3248;
    --accent: #4f7cff; --green: #22c55e; --red: #ef4444; --amber: #f59e0b;
    --text: #e8eaf0; --muted: #8b90a8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height: 100dvh; }
  #root { min-height: 100dvh; display: flex; flex-direction: column; }

  .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 1rem; font-weight: 700; letter-spacing: .04em; }
  .logo span { color: var(--accent); }
  .clock { font-size: .8rem; color: var(--muted); font-variant-numeric: tabular-nums; }

  .nav { background: var(--surface); border-bottom: 1px solid var(--border); display: flex; gap: 4px; padding: 8px 16px; }
  .nav-btn { background: none; border: none; cursor: pointer; color: var(--muted); font-size: .82rem; font-weight: 500; padding: 6px 14px; border-radius: 6px; transition: all .15s; font-family: inherit; }
  .nav-btn:hover, .nav-btn.active { background: var(--card); color: var(--text); }
  .nav-btn.active { color: var(--accent); }

  main { flex: 1; padding: 28px 20px; max-width: 900px; margin: 0 auto; width: 100%; }

  /* PIN */
  .pin-wrap { max-width: 340px; margin: 0 auto; }
  .pin-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; }
  .pin-sub { color: var(--muted); font-size: .85rem; margin-bottom: 28px; }
  .pin-dots { display: flex; gap: 14px; justify-content: center; margin-bottom: 28px; }
  .pin-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--border); transition: background .15s; }
  .pin-dot.filled { background: var(--accent); }
  .pin-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .pin-btn { background: var(--card); border: 1px solid var(--border); color: var(--text); font-size: 1.3rem; font-weight: 600; padding: 18px; border-radius: 12px; cursor: pointer; transition: all .1s; user-select: none; font-family: inherit; }
  .pin-btn:active { transform: scale(.93); background: var(--border); }
  .pin-btn.del { font-size: 1rem; color: var(--muted); }
  .pin-btn.ok { background: var(--accent); border-color: var(--accent); color: #fff; }
  .pin-msg { text-align: center; font-size: .85rem; min-height: 22px; margin-top: 4px; }
  .pin-msg.ok { color: var(--green); }
  .pin-msg.err { color: var(--red); }

  /* CONFIRM */
  .confirm-wrap { text-align: center; }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.7rem; font-weight: 700; margin: 0 auto 16px; }
  .confirm-name { font-size: 1.3rem; font-weight: 700; margin-bottom: 6px; }
  .confirm-status { color: var(--muted); font-size: .85rem; margin-bottom: 28px; }
  .confirm-btns { display: flex; gap: 10px; }
  .btn-cancel { flex: 1; background: none; border: 1px solid var(--border); color: var(--muted); padding: 14px; border-radius: 12px; cursor: pointer; font-size: .9rem; font-family: inherit; }
  .btn-action { flex: 2; border: none; color: #fff; padding: 14px; border-radius: 12px; cursor: pointer; font-size: .95rem; font-weight: 700; font-family: inherit; transition: opacity .15s; }
  .btn-action:disabled { opacity: .6; cursor: not-allowed; }

  /* HISTORY */
  .hist-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
  .sel { background: var(--card); border: 1px solid var(--border); color: var(--text); font-size: .82rem; padding: 8px 12px; border-radius: 8px; outline: none; cursor: pointer; font-family: inherit; }
  .btn-export { margin-left: auto; background: var(--accent); border: none; color: #fff; font-size: .82rem; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
  table { width: 100%; border-collapse: collapse; font-size: .82rem; }
  thead th { text-align: left; color: var(--muted); font-weight: 500; font-size: .75rem; padding: 8px 10px; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: .06em; }
  tbody tr { border-bottom: 1px solid var(--border); }
  tbody tr:hover { background: var(--card); }
  tbody td { padding: 11px 10px; }
  .auto-tag { font-size: .68rem; background: rgba(245,158,11,.15); color: var(--amber); padding: 2px 6px; border-radius: 4px; margin-left: 5px; }
  .loc-link { color: var(--accent); font-size: .75rem; text-decoration: none; }
  .loc-acc { color: var(--muted); font-size: .7rem; margin-left: 3px; }
  .loc-denied { color: var(--amber); font-size: .73rem; }
  .empty { text-align: center; color: var(--muted); padding: 48px; }

  /* ADMIN */
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .stat-val { font-size: 1.5rem; font-weight: 700; }
  .stat-lbl { font-size: .73rem; color: var(--muted); margin-top: 3px; }
  .admin-grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
  @media(max-width:600px) { .admin-grid { grid-template-columns: 1fr; } }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
  .card-title { font-size: .78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 16px; }
  .input-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .inp { flex: 1; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: .85rem; padding: 9px 12px; border-radius: 8px; outline: none; font-family: inherit; }
  .inp:focus { border-color: var(--accent); }
  .btn-sm { background: var(--accent); border: none; color: #fff; font-size: .8rem; font-weight: 600; padding: 9px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-family: inherit; }
  .btn-sm.danger { background: var(--red); }
  .worker-list { display: flex; flex-direction: column; gap: 8px; }
  .worker-row { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 10px 14px; font-size: .85rem; }
  .worker-name { font-weight: 600; }
  .worker-pin { font-size: .73rem; color: var(--muted); font-family: monospace; margin-top: 2px; }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 20px; font-size: .72rem; font-weight: 600; background: rgba(34,197,94,.15); color: var(--green); margin-left: 8px; }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .active-row { display: flex; align-items: center; justify-content: space-between; background: rgba(34,197,94,.06); border: 1px solid rgba(34,197,94,.2); border-radius: 9px; padding: 10px 14px; font-size: .85rem; margin-bottom: 8px; }
  .active-since { font-size: .73rem; color: var(--muted); margin-top: 2px; }
  .btn-force { background: none; border: 1px solid var(--red); color: var(--red); font-size: .73rem; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-family: inherit; }

  /* MODAL */
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 100; display: flex; align-items: center; justify-content: center; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 28px 24px; width: 320px; max-width: 92vw; }
  .modal-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; }
  .modal-sub { color: var(--muted); font-size: .82rem; margin-bottom: 22px; }
  .btn-modal-cancel { width: 100%; margin-top: 10px; background: none; border: 1px solid var(--border); color: var(--muted); padding: 10px; border-radius: 8px; cursor: pointer; font-size: .85rem; font-family: inherit; }

  /* TOAST */
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 22px; font-size: .85rem; white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,.4); z-index: 999; animation: fadeUp .2s ease; }
  .toast.ok { border-color: var(--green); color: var(--green); }
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

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  // Load data
  const reload = useCallback(async () => {
    setLoading(true)
    const [w, r] = await Promise.all([fetchWorkers(), fetchRecords()])
    setWorkers(w); setRecords(r)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  // Auto-checkout check every minute
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
        <div className="logo">Ficha<span>Ya</span></div>
        <div className="clock">{clock}</div>
      </div>
      <nav className="nav">
        <button className={`nav-btn ${view === 'pin' ? 'active' : ''}`} onClick={() => handleNav('pin')}>⏱ Fichar</button>
        <button className={`nav-btn ${view === 'history' ? 'active' : ''}`} onClick={() => handleNav('history')}>📋 Historial</button>
        <button className={`nav-btn ${view === 'admin' ? 'active' : ''}`} onClick={() => handleNav('admin')}>⚙️ Administrar</button>
      </nav>
      <main>
        {loading ? <div className="loading"><div className="spinner" /> Cargando...</div> : <>
          {view === 'pin' && <PinView workers={workers} records={records} reload={reload} showToast={showToast} />}
          {view === 'history' && <HistoryView workers={workers} records={records} />}
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
  const [pending, setPending] = useState(null) // worker identificado
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
    // Admin PIN
    if (pin === ADMIN_PIN) {
      setBuf('')
      // Dispatch nav to admin via custom event - simple approach
      window.dispatchEvent(new CustomEvent('goto-admin'))
      return
    }
    const worker = workers.find(w => w.pin === pin)
    if (!worker) {
      setMsg({ text: 'PIN no reconocido', type: 'err' })
      setTimeout(() => setBuf(''), 600)
      return
    }
    setBuf('')
    setPending(worker)
  }

  async function confirm() {
    if (!pending || working) return
    setWorking(true)
    const loc = await getLocation()
    const open = records.find(r => r.worker_id === pending.id && !r.check_out)
    if (open) {
      await supabase.from('records').update({ check_out: new Date().toISOString(), location_out: loc }).eq('id', open.id)
      showToast(`${pending.name} ha fichado salida ✓`)
    } else {
      await supabase.from('records').insert({ worker_id: pending.id, worker_name: pending.name, check_in: new Date().toISOString(), location_in: loc })
      showToast(`${pending.name} ha fichado entrada ✓`)
    }
    await reload()
    setWorking(false)
    setPending(null)
  }

  // Listen for goto-admin from PIN
  useEffect(() => {
    const h = () => { /* handled in App */ }
    window.addEventListener('goto-admin', h)
    return () => window.removeEventListener('goto-admin', h)
  }, [])

  if (pending) {
    const open = records.find(r => r.worker_id === pending.id && !r.check_out)
    const initials = pending.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    const isEntry = !open
    const actionColor = isEntry ? 'var(--green)' : 'var(--red)'
    const statusText = open
      ? `En jornada desde ${new Date(open.check_in).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · ${formatDur((Date.now() - new Date(open.check_in)) / 60000)}`
      : 'Listo para empezar jornada'

    return (
      <div className="pin-wrap">
        <div className="confirm-wrap">
          <div className="avatar">{initials}</div>
          <div className="confirm-name">{pending.name}</div>
          <div className="confirm-status">{statusText}</div>
          <div className="confirm-btns">
            <button className="btn-cancel" onClick={() => setPending(null)}>Cancelar</button>
            <button className="btn-action" style={{ background: actionColor }} onClick={confirm} disabled={working}>
              {working ? '📍 Obteniendo ubicación...' : isEntry ? 'Fichar ENTRADA' : 'Fichar SALIDA'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pin-wrap">
      <div className="pin-title">Control de Jornada</div>
      <div className="pin-sub">Introduce tu PIN personal</div>
      <div className="pin-dots">
        {[0, 1, 2, 3].map(i => <div key={i} className={`pin-dot ${i < buf.length ? 'filled' : ''}`} />)}
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
      return [
        r.worker_name,
        cin.toLocaleDateString('es-ES'),
        cin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        li ? li.lat : '', li ? li.lng : '',
        cout ? cout.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
        lo ? lo.lat : '', lo ? lo.lng : '',
        dur, r.auto ? 'Sí' : 'No',
      ].join(';')
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
          {months.map(m => {
            const [y, mo] = m.split('-')
            return <option key={m} value={m}>{new Date(y, mo - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</option>
          })}
        </select>
        <button className="btn-export" onClick={exportCSV}>⬇ Exportar CSV</button>
      </div>
      {recs.length === 0 ? <div className="empty">Sin registros para este filtro</div> : (
        <table>
          <thead>
            <tr>
              <th>Trabajador</th><th>Fecha</th><th>Entrada</th><th>Ubic. entrada</th>
              <th>Salida</th><th>Ubic. salida</th><th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {recs.map(r => {
              const cin = new Date(r.check_in)
              const cout = r.check_out ? new Date(r.check_out) : null
              const dur = cout ? formatDur((cout - cin) / 60000) : <span style={{ color: 'var(--green)' }}>En jornada</span>
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
    await reload()
    showToast('Trabajador eliminado')
  }

  async function forceOut(recId) {
    await supabase.from('records').update({ check_out: new Date().toISOString() }).eq('id', recId)
    await reload()
    showToast('Salida registrada manualmente')
  }

  return (
    <div>
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
                    <div className="worker-name">
                      {w.name}
                      {isIn && <span className="badge"><span className="badge-dot" />En jornada</span>}
                    </div>
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
                    <div style={{ fontWeight: 600 }}>{r.worker_name}</div>
                    <div className="active-since">Desde {cin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {formatDur(mins)}</div>
                  </div>
                  <button className="btn-force" onClick={() => forceOut(r.id)}>Fichar salida</button>
                </div>
              )
            })
          }
        </div>
      </div>
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
    setBuf(next)
    setErr('')
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
          {[0, 1, 2, 3].map(i => <div key={i} className={`pin-dot ${i < buf.length ? 'filled' : ''}`} />)}
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
