import fetch from 'node-fetch';

export default (method, endpoint, body, headers) => {
  console.log(`${method.toUpperCase()} request from ${endpoint}`);

  return fetch(serialize(method, endpoint, body), {
    method,
    headers: headers || { 'Content-Type': 'application/json' },
    body: method.toUpperCase() !== 'GET' ? JSON.stringify(body) : undefined
  })
    .catch(error => console.error(`ERROR: ${error.message}`));
}

function serialize(method, endpoint, body) {
  if (method.toUpperCase() !== 'GET' || !body)
    return endpoint;

  let str = '';
  for (const param in body) {
    if (str !== '') str += '&';
    str += `${param}=${encodeURIComponent(body[param])}`;
  }

  return`${endpoint}?${str}`;
}
