import { useCallback, useEffect, useState } from "react";
import {
  Stores,
  User,
  addData,
  deleteData,
  getStoreData,
  initDB,
} from "./lib/db";

function App() {
  const [isDBReady, setIsDBReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[] | []>([]);

  const handleInitDB = async () => {
    const status = await initDB();
    setIsDBReady(!!status);
  };

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
      await addData(Stores.Users, { name, email, id });
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
      await deleteData(Stores.Users, id);
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
    const users = await getStoreData<User>(Stores.Users);
    setUsers(users);
  }, []);

  useEffect(() => {
    handleInitDB();
  }, []);

  useEffect(() => {
    if (isDBReady) {
      handleGetUsers();
    }
  }, [isDBReady, handleGetUsers]);

  return (
    <main className="mt-[40px] container mx-auto text-center space-y-4 prose">
      <div>
        <form
          onSubmit={handleAddUser}
          className="max-w-xs w-full mx-auto p-3 border rounded-md space-y-4 border-[oklch(var(--bc)/0.2)]"
        >
          <h3 className="mt-0">IndexedDB</h3>
          <input
            className="input input-bordered w-full max-w-xs block"
            type="text"
            name="name"
            placeholder="Name"
          />
          <input
            className="input input-bordered w-full max-w-xs block"
            type="email"
            name="email"
            placeholder="Email"
          />
          <button className="btn btn-primary btn-sm" type="submit">
            Add User
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      {users.length > 0 && (
        <table className="">
          <thead>
            <tr>
              <th>
                <p>Name</p>
              </th>
              <th>
                <p>Email</p>
              </th>
              <th>
                <p>ID</p>
              </th>
              <th>
                <p>Actions</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
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
                  <p>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Delete
                    </button>
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default App;
