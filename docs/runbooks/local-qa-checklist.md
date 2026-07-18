# Checklist QA local — NightTable CO

Prerrequisitos: Postgres local, migraciones y seed con demos.

```powershell
cd "C:\Users\MI PC\Documents\PROYECTOS\saas-boilerplate"
# si no están corriendo:
npm run dev -w @saas/api
npm run dev -w @saas/web

# aceptación automática API:
node scripts/local-acceptance.mjs
```

## Manual (navegador)

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir http://localhost:3000 | Home con ciudades wave-1 |
| 2 | Clic Bogotá | Lista Comer con venues premium demo |
| 3 | Toggle **Salir** | Bares/clubs (ej. Theatron) |
| 4 | Abrir ficha con “reserva online” | Botón **Reservar mesa** |
| 5 | HOLD + Confirmar | Mensajes de HOLD y CONFIRMADA |
| 6 | `/register` | Cuenta creada → puede ir a dashboard |
| 7 | `/login` | Sesión (cookie) |
| 8 | `/mis-reservas` | Ve reservas del usuario |
| 9 | `/privacy` y `/terms` | Páginas legales |
| 10 | http://localhost:3001/docs | Swagger (dev) |

## Admin (opcional)

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nighttable_db"
npm run make-superadmin -- tu@email.com
```

Luego `/admin` → encolar ingestión `mock` para `bogota`.

## Criterios de salida QA local

- [ ] Acceptance script 0 failed  
- [ ] Reserva CONFIRMADA de punta a punta  
- [ ] Catálogo por ciudad con lentes Comer/Salir  
- [ ] Auth register/login/me  

Siguiente: deploy Render (`docs/runbooks/first-deploy-render.md`).
