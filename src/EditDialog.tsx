import React from "react";
import { User } from "./types";

type DialogProps = {
  onClose: () => void;
  onConfirm: (user: User) => void;
  data: User;
  setData: React.Dispatch<React.SetStateAction<User | null>>;
};

const EditDialog = ({ onClose, onConfirm, data, setData }: DialogProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  return (
    <dialog open={true} className="modal">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(data);
        }}
        className="modal-box space-y-4 flex-col"
      >
        <h3 className="font-bold text-lg">IndexedDB</h3>
        <input
          className="input input-bordered w-full  block"
          type="text"
          name="name"
          onChange={handleChange}
          value={data.name}
          placeholder="Name"
        />
        <input
          className="input input-bordered w-full  block"
          type="email"
          name="email"
          onChange={handleChange}
          value={data.email}
          placeholder="Email"
        />
        <div className="card-actions justify-end flex-nowrap">
          <button onClick={onClose} className="btn" type="button">
            Cancel
          </button>
          <button className="btn btn-neutral" type="submit">
            Update
          </button>
        </div>
      </form>
      <div className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </div>
    </dialog>
  );
};

export default EditDialog;
