import { useCallback, useEffect, useState } from "react";
import { Stores, User } from "./types";
import useIndexedDb from "./lib/useIndexedDb";
import EditDialog from "./EditDialog";

function App() {
  const { addData, deleteData, getStoreData, isDBReady, updateData } =
    useIndexedDb({
      storeName: Stores.Users,
      uniqueKey: "id",
      debug: true,
    });
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[] | []>([]);
  const [editingData, setEditingData] = useState<User | null>(null);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
    };

    const name = target.name.value;
    const email = target.email.value;
    const id = Date.now();

    if (name.trim() === "" || email.trim() === "") {
      alert("Please enter a valid name and email");
      return;
    }

    try {
      await addData({ name, email, id });
      // refetch users after creating data
      handleGetUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      await deleteData(id);
      // refetch users after deleting data
      handleGetUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong deleting the user");
      }
    }
  };

  const handleGetUsers = useCallback(async () => {
    const users = await getStoreData<User>();
    setUsers(users);
  }, [getStoreData]);

  const handleUpdateData = async (data: User) => {
    try {
      await updateData(data.id, data);
      setEditingData(null);
      handleGetUsers();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isDBReady) {
      handleGetUsers();
    }
  }, [isDBReady, handleGetUsers]);

  if (!isDBReady)
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-[50px] underline">Loading...</h1>
      </div>
    );

  return (
    <main className="mt-[40px] container mx-auto text-center space-y-4 prose">
      {editingData && (
        <EditDialog
          data={editingData}
          onClose={() => setEditingData(null)}
          onConfirm={handleUpdateData}
          setData={setEditingData}
        />
      )}
      <div className="border-b pb-8 mb-8 border-[oklch(var(--bc)/0.2)]">
        <form
          onSubmit={handleAddUser}
          className="max-w-md w-full mx-auto p-6 border rounded-md space-y-4 border-[oklch(var(--bc)/0.2)]"
        >
          <h3 className="mt-0">IndexedDB</h3>
          <input
            className="input input-bordered w-full block"
            type="text"
            name="name"
            placeholder="Name"
          />
          <input
            className="input input-bordered w-full block"
            type="email"
            name="email"
            placeholder="Email"
          />
          <button className="btn " type="submit">
            Add User
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <table className="">
        <thead>
          <tr>
            <th className="min-w-[139px]">
              <p>Name</p>
            </th>
            <th className="min-w-[203px]">
              <p>Email</p>
            </th>
            <th className="min-w-[109px]">
              <p>ID</p>
            </th>
            <th className="min-w-[111px]">
              <p>Actions</p>
            </th>
          </tr>
        </thead>
        <tbody className="relative min-h-[300px]">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <p>{user.name}</p>
                </td>
                <td>
                  <p>{user.email}</p>
                </td>
                <td>
                  <p>{user.id}</p>
                </td>
                <td>
                  <p className="flex gap-2">
                    <button
                      className="btn btn-neutral btn-xs"
                      onClick={() => setEditingData(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Delete
                    </button>
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <div className="absolute inset-0 m-auto text-md mt-3">
              No Data Found
            </div>
          )}
        </tbody>
      </table>
    </main>
  );
}

export default App;
