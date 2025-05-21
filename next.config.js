/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Enable ESLint during build
    ignoreDuringBuilds: false
  },
  output: 'standalone', // Otimização para implantação em produção
  poweredByHeader: false, // Remove o cabeçalho `X-Powered-By` por segurança
  compress: true, // Ativa a compressão gzip
  // Configurações específicas para produção
  productionBrowserSourceMaps: false, // Desabilita mapas de origem em produção
  // Configurações para API Routes
  async rewrites() {
    return [
      // Reescreve para API routes, se necessário
    ];
  },
  
  // Configurações de segurança adicionais
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          }
        ],
      },
    ];
  },  webpack: (config, { dev, isServer }) => {
    // Otimizações adicionais para webpack em produção
    if (!dev && isServer) {
      // Habilita tree-shaking e minificação
      if (config.optimization) {
        config.optimization.usedExports = true;
        config.optimization.minimize = true;
        
        // Otimiza módulos para servidor
        config.optimization.concatenateModules = true;
      }
    }
    
    return config;
  },
};

module.exports = nextConfig;