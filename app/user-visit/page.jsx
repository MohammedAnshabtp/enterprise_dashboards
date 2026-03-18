"use client";

import { useEffect, useState } from "react";
import api from "../lib/api/axios";

export default function UserVisitPage() {
  const [users, setUsers] = useState([]);

  // GET USERS
  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/v1/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE USER
  const deleteUser = async (id) => {
    try {
      await api.delete(`/api/v1/auth/user/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE USER
  const updateUser = async (id) => {
    try {
      await api.patch(`/api/v1/auth/user/${id}`, {
        name: "Updated Name",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const res = await api.get("/api/v1/auth/users");

        if (isMounted) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-black">User Visit</h1>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4 text-black">Users</h2>

        <table className="w-full text-left">
          <thead className="text-sm text-gray-500 border-b">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-3">{user.name}</td>
                <td>{user.email}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => updateUser(user.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Update
                  </button>

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
