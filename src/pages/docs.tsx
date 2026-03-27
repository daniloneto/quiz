import Head from 'next/head';
import { useEffect } from 'react';

export default function DocsPage() {
  useEffect(() => {
    const cssId = 'swagger-ui-css';
    const scriptId = 'swagger-ui-bundle';
    const presetId = 'swagger-ui-preset';

    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui.css';
      document.head.appendChild(link);
    }

    function initSwagger() {
      // @ts-ignore
      const SwaggerUIBundle = window.SwaggerUIBundle;
      // @ts-ignore
      const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset;
      if (!SwaggerUIBundle) return;
      try {
        // @ts-ignore
        SwaggerUIBundle({
          url: '/api/openapi.json',
          dom_id: '#swagger',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset?.default].filter(Boolean),
          layout: 'BaseLayout'
        });
      } catch (e) {
        // ignore
      }
    }

    if (document.getElementById(scriptId)) {
      initSwagger();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      // load standalone preset
      const preset = document.createElement('script');
      preset.id = presetId;
      preset.src = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js';
      preset.async = true;
      preset.onload = initSwagger;
      document.body.appendChild(preset);
    };
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      const pr = document.getElementById(presetId);
      if (pr) pr.remove();
      const container = document.getElementById('swagger');
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <>
      <Head>
        <title>API Docs - Swagger UI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div id="swagger" />
    </>
  );
}
