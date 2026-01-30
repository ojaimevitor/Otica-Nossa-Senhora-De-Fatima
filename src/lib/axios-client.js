import axios from "axios";

/**
 * Substituto do Base44 SDK.
 * Cria um cliente axios com baseURL + headers.
 */
export function createAxiosClient({ baseURL, headers } = {}) {
  return axios.create({
    baseURL,
    headers,
    withCredentials: true,
  });
}
