import { decrypto, encrypto } from '../crypto';

function createSessionStorage(isEncryption) {
  function set(key, value) {
    let json
    if(isEncryption) {
      json = encrypto(value)
    }else {
      json = JSON.stringify(value)
    }
    sessionStorage.setItem(key, json);
  }
  function get(key) {
    const json = sessionStorage.getItem(key);
    let data = null;
    if (json) {
      try {
        if(isEncryption) {
          data = decrypto(json)
        }else {
          data = JSON.parse(json)
        }
      } catch {
        // 防止解析失败
      }
    }
    return data;
  }
  function remove(key) {
    window.sessionStorage.removeItem(key);
  }
  function clear() {
    window.sessionStorage.clear();
  }

  return {
    set,
    get,
    remove,
    clear
  };
}

export const sessionStg = createSessionStorage(false);
