import { useCallback, useEffect, useState } from "react";
import { addData, deleteData, updateData, initDB, getStoreData } from "./db";
const DB_NAME = "test-db";

type useIndexedDbProps = {
  storeName: string;
  uniqueKey: string;
  debug?: boolean;
};

const useIndexedDb = ({
  storeName,
  uniqueKey,
  debug = false,
}: useIndexedDbProps) => {
  const [isDBReady, setIsDBReady] = useState<boolean>(false);

  const handleInitDB = useCallback(async () => {
    const status = await initDB(DB_NAME, storeName, uniqueKey, debug);
    setIsDBReady(!!status);
  }, [storeName, uniqueKey, debug]);

  useEffect(() => {
    handleInitDB();
  }, [handleInitDB]);

  const handleAddData = <T>(data: T): Promise<T | string | null> => {
    return addData(storeName, data, debug);
  };

  const handleDeleteData = (key: string): Promise<boolean> => {
    return deleteData(storeName, key, debug);
  };

  const handleUpdateData = <T>(
    key: string,
    data: T
  ): Promise<T | string | null> => {
    return updateData(storeName, key, data, debug);
  };

  const handleGetStoreData = <T>(): Promise<T[]> => {
    return getStoreData(storeName, debug);
  };

  return {
    isDBReady,
    addData: handleAddData,
    deleteData: handleDeleteData,
    updateData: handleUpdateData,
    getStoreData: handleGetStoreData,
  };
};

export default useIndexedDb;
