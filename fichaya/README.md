# FichaYa 📍
Control de jornada laboral con PIN + GPS. Cumple con el RDL 8/2019 de registro horario.

---

## Despliegue paso a paso

### 1. Supabase (base de datos)

1. Ve a [supabase.com](https://supabase.com) → New project
2. Ponle nombre: `fichaya` | Elige región: **West EU (Ireland)**
3. Espera ~2 minutos a que se cree
4. Ve a **SQL Editor** → pega el contenido de `supabase_schema.sql` → Run
5. Ve a **Project Settings → API** y copia:
   - `Project URL` → es tu `VITE_SUPABASE_URL`
   - `anon public` key → es tu `VITE_SUPABASE_ANON_KEY`

### 2. GitHub (código)

1. Ve a [github.com](https://github.com) → New repository → nombre: `fichaya`
2. En tu ordenador, dentro de la carpeta del proyecto:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/fichaya.git
git push -u origin main
```

### 3. Vercel (publicación)

1. Ve a [vercel.com](https://vercel.com) → Add New Project
2. Importa el repo `fichaya` de GitHub
3. En **Environment Variables** añade:
   - `VITE_SUPABASE_URL` = tu Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase
   - `VITE_ADMIN_PIN` = el PIN que quieras para admin (ej. `9876`)
4. Deploy → en ~1 minuto tienes tu URL tipo `fichaya.vercel.app`

---

## Uso para trabajadores

Envíales por WhatsApp:

> "Para fichar, abre este link en el móvil: **fichaya.vercel.app**
> 
> 📱 **iPhone**: Safari → botón compartir ⬆ → "Añadir a pantalla de inicio"
> 📱 **Android**: Chrome → tres puntos ⋮ → "Añadir a pantalla de inicio""

---

## PIN de administrador

El PIN de admin se configura en Vercel como variable de entorno `VITE_ADMIN_PIN`.
Por defecto es `1234` — **cámbialo antes de publicar**.

Desde el panel de admin puedes:
- Añadir/eliminar trabajadores y asignarles PIN
- Ver quién está en jornada ahora mismo
- Consultar el historial con ubicaciones (enlace a Google Maps)
- Exportar CSV mensual para inspecciones de trabajo

---

## Tecnologías
- React + Vite
- Supabase (PostgreSQL)
- Vercel (hosting gratuito)
- PWA (instalable como app en móvil)
