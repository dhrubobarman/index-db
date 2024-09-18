import { useCallback, useEffect, useState } from "react";
import { addData, deleteData, updateData, initDB, getStoreData } from "./db";
const DB_NAME = "indexed-db";

type useIndexedDbProps = {
  /**
   * The name of the IndexedDB database.
   * @default "indexed-db"
   */
  dbName?: string;
  /**
   * The name of the object store within the database.
   */
  storeName: string;
  /**
   * The unique key for the object store.
   */
  uniqueKey: string;
  /**
   * Enable or disable debug mode.
   */
  debug?: boolean;
  /**
   * The version of the IndexedDB database.
   * @default 1
   */
  version?: number;
};

type UseIndexedDbReturnType = {
  /** Indicates if the database is ready. */
  isDBReady: boolean;
  /**
   * Adds data to the IndexedDB store.
   * @param data - The data to add.
   * @returns A promise that resolves to the added data, a string, or null.
   */
  addData: <T>(data: T) => Promise<T | string | null>;
  /**
   * Deletes data from the IndexedDB store.
   * @param key - The key of the data to delete.
   * @returns A promise that resolves to a boolean indicating success.
   */
  deleteData: (key: string) => Promise<boolean>;
  /**
   * Updates data in the IndexedDB store.
   * @param key - The key of the data to update.
   * @param data - The new data.
   * @returns A promise that resolves to the updated data, a string, or null.
   */
  updateData: <T>(key: string, data: T) => Promise<T | string | null>;
  /**
   * Retrieves all data from the IndexedDB store.
   * @returns A promise that resolves to an array of data.
   */
  getStoreData: <T>() => Promise<T[]>;
};

/**
 * Custom hook for interacting with IndexedDB.
 * @param dbName - The name of the database.
 * @param storeName - The name of the object store.
 * @param uniqueKey - The unique key for the object store.
 * @param debug - Flag to enable debug mode.
 * @param version - The version of the database.
 * @returns An object containing methods to interact with the IndexedDB store.
 */
const useIndexedDb = ({
  dbName = DB_NAME,
  storeName,
  uniqueKey,
  debug = false,
  version = 1,
}: useIndexedDbProps): UseIndexedDbReturnType => {
  const [isDBReady, setIsDBReady] = useState<boolean>(false);
  const [stateVersion, setStateVersion] = useState(version);

  const handleInitDB = useCallback(async () => {
    const status = await initDB(
      dbName,
      storeName,
      uniqueKey,
      stateVersion,
      setStateVersion,
      debug
    );
    setIsDBReady(!!status);
  }, [dbName, storeName, uniqueKey, stateVersion, debug]);

  useEffect(() => {
    handleInitDB();
  }, [handleInitDB]);

  const handleAddData = useCallback(
    <T>(data: T): Promise<T | string | null> => {
      return addData(dbName, storeName, data, stateVersion, debug);
    },
    [dbName, debug, stateVersion, storeName]
  );

  const handleDeleteData = useCallback(
    (key: string): Promise<boolean> => {
      return deleteData(dbName, storeName, key, stateVersion, debug);
    },
    [dbName, debug, stateVersion, storeName]
  );

  const handleUpdateData = useCallback(
    <T>(key: string, data: T): Promise<T | string | null> => {
      return updateData(dbName, storeName, key, data, stateVersion, debug);
    },
    [dbName, debug, stateVersion, storeName]
  );

  const handleGetStoreData = useCallback(<T>(): Promise<T[]> => {
    return getStoreData(dbName, storeName, stateVersion, debug);
  }, [dbName, debug, stateVersion, storeName]);

  return {
    isDBReady,
    addData: handleAddData,
    deleteData: handleDeleteData,
    updateData: handleUpdateData,
    getStoreData: handleGetStoreData,
  };
};

export default useIndexedDb;
