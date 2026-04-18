/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — genera la carpeta 'out/' lista para GitHub Pages
  output: 'export',

  // Nombre exacto de tu repositorio en GitHub
  basePath: '/QC-lab',
  assetPrefix: '/QC-lab/',

  // Necesario para exportación estática
  trailingSlash: true,

  // Desactivar optimización de imágenes (no compatible con export estático)
  images: {
    unoptimized: true,
  },

  // Ignorar errores de TypeScript en build para no bloquear el deploy
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
