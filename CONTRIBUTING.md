# Contribuciones

Gracias por querer contribuir a este proyecto.

## Como empezar

1. Haz fork del repositorio
2. Clona tu fork: `git clone https://github.com/TU_USUARIO/saas-boilerplate.git`
3. Instala dependencias: `npm install`
4. Copia las variables: `cp .env.example .env`
5. Levanta Postgres: `docker-compose up postgres -d`
6. Migra la BD: `npm run db:migrate`
7. Arranca en dev: `npm run dev`

## Convencion de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     nueva funcionalidad
fix:      correccion de bug
docs:     cambios en documentacion
refactor: refactorizacion sin cambio de comportamiento
test:     agregar o corregir tests
chore:    tareas de mantenimiento
```

## Pull Requests

- Una feature o fix por PR
- Describe claramente que cambia y por que
- Si agrega una ruta nueva, documenta el endpoint en el README

## Reportar bugs

Abre un [Issue](https://github.com/leonardeco/saas-boilerplate/issues) con:
- Descripcion del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Version de Node.js y OS
