"use client";

import { CircleChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authServices";
import { useRouter } from "next/navigation";
import BackButton from "../components/BackButton";

export default function UserVisitPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getProfile();
        const data = res?.data?.data;

        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data) {
          setUsers([data]);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center py-5 text-black gap-2">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-semibold text-black">User Visit</h1>
        </div>
      </div>
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4 text-black">Users</h2>

        <table className="w-full text-left">
          <thead className="text-sm text-gray-500 border-b">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user?._id} className="border-b">
                <td className="py-3 text-slate-500">{user?.name}</td>
                <td className="text-slate-500">{user.email}</td>
                {/* <td className="space-x-2">
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
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
