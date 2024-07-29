import Cookies from 'js-cookie';

export function setCookie(key, value, expires) {
  Cookies.set(key, value, { expires });
}

export function getCookie(key) {
  return Cookies.get(key);
}

export function removeCookie(key) {
  Cookies.remove(key);
}