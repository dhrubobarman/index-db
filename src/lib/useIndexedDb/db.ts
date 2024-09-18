let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum Stores {
  Users = "users",
}

export const initDB = (
  dbName: string,
  storeName: string,
  key: string,
  debug = false
): Promise<boolean | IDBDatabase> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName);

    // if the data object store doesn't exist, create it
    request.onupgradeneeded = () => {
      db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        if (debug) console.log("Creating users store");
        db.createObjectStore(storeName, { keyPath: key });
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      db = request.result;
      // get current version and store it
      version = db.version;
      resolve(request.result);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export const addData = <T>(
  storeName: string,
  data: T,
  debug = false
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - addData", data);
      db = request.result;
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
  debug = false
): Promise<boolean> => {
  return new Promise((resolve) => {
    request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - deleteData", key);
      db = request.result;
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
  debug = false
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    request = indexedDB.open("myDB", version);

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - updateData", key);
      db = request.result;
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
  debug = false
): Promise<T[]> => {
  return new Promise((resolve) => {
    request = indexedDB.open("myDB");

    request.onsuccess = () => {
      if (debug) console.log("request.onsuccess - getAllData");
      db = request.result;
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};
