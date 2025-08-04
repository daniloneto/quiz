import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import api from 'src/infrastructure/api/http';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: typeof axios;
    $api: AxiosInstance;
  }
}

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
