export function createPageUrl(pageName, params = {}) {
  let url = '/' + pageName
  const queryParams = new URLSearchParams(params).toString()
  if (queryParams) url += '?' + queryParams
  return url
}
