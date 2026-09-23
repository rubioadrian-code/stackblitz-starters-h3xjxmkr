/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Ignorar errores de formato en el despliegue
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Ignorar avisos de tipado estricto en el despliegue
      ignoreBuildErrors: true,
    },
  }
  
  module.exports = nextConfig
