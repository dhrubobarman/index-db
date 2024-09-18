export const initDB = (
  dbName: string,
  storeName: string,
  key: string,
  version: number,
  setStateVersion: (version: number) => void,
  debug = false
): Promise<boolean | IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        if (debug) console.log("Creating users store");
        db.createObjectStore(storeName, { keyPath: key });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      setStateVersion(db.version);
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addData = <T>(
  storeName: string,
  data: T,
  version?: number,
  debug = false
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    const request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - addData", data);
      const db = request.result;
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.add(data);
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve("Unknown error");
      }
    };
  });
};

export const deleteData = (
  storeName: string,
  key: string,
  version?: number,
  debug = false
): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - deleteData", key);
      const db = request.result;
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const res = store.delete(key);
      res.onsuccess = () => {
        resolve(true);
      };
      res.onerror = () => {
        resolve(false);
      };
    };
  });
};

export const updateData = <T>(
  storeName: string,
  key: string,
  data: T,
  version?: number,
  debug = false
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    const request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - updateData", key);
      const db = request.result;
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const res = store.get(key);
      res.onsuccess = () => {
        const newData = { ...res.result, ...data };
        store.put(newData);
        resolve(newData);
      };
      res.onerror = () => {
        resolve(null);
      };
    };
  });
};

export const getStoreData = <T>(
  storeName: string,
  version?: number,
  debug = false
): Promise<T[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - getAllData");
      const db = request.result;
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};
