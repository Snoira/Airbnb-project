type LocalStorageKey = "@library/token";

class LocalStorageKit {
  static set(key: LocalStorageKey, data: any) {
    let jsonData = typeof data === "string" ? data : JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  }

  static get(key: LocalStorageKey) {
    const jsonData = localStorage.getItem(key);
    try {
      if (!jsonData) {
        return null;
      }
      return JSON.parse(jsonData);
    } catch (error) {
      return jsonData;
    }
  }

  static remove(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }
}

export default LocalStorageKit;