# LESSA Web (Next.js + TypeScript + Tailwind)

App web para aprender y practicar la **Lengua de Señas Salvadoreña (LESSA)** con tarjetas, quiz y diccionario.

## Requisitos
- Node.js 18+
- (Opcional) Python 3.10+ para generar el dataset completo desde el PDF

## Instalación
```bash
npm install
npm run dev
```

## TailwindCSS
Instala Tailwind si deseas estilos utilitarios:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
(Ya están configurados los archivos `postcss.config.js` y `tailwind.config.ts`.)

## Datos (lessaData)
El proyecto incluye un `src/data/lessaData.ts` con **datos de muestra**. Para generar el dataset completo (~600 entradas) desde el PDF:

1. Coloca tu PDF `Lenguas-de-Senas-web.pdf` dentro de la carpeta `scripts/`.
2. Instala dependencias de Python:
   ```bash
   pip install pdfplumber
   ```
3. Ejecuta el script:
   ```bash
   python scripts/generar_lessaData.py
   ```
4. Se generará/actualizará `src/data/lessaData.ts` automáticamente.

## Scripts de NPM
- `npm run dev` — entorno de desarrollo
- `npm run build` — build de producción
- `npm start` — iniciar el servidor de producción
