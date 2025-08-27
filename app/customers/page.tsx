"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Users, Search } from "lucide-react";
import NavTabs from "../components/NavTabs";
import { searchCustomers } from "../lib/api";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const CustomersPage = () => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUserName(u.displayName || u.email || "User");
        load();
      }
    });
    return () => unsub();
  }, [router]);
  const load = async (term: string = "") => {
    setLoading(true);
    try {
      const data = await searchCustomers({ q: term });
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const id = setTimeout(() => load(search), 400);
    return () => clearTimeout(id);
  }, [search]);
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <NavTabs userName={userName} />
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-blue-400">
          <Users className="h-6 w-6" />
          Customers
        </h1>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
          <div className="flex items-center relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers (name / phone / email)"
              className="flex-1 pl-10 pr-3 py-2 border border-gray-600 rounded bg-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-gray-400">No customers</p>
          ) : (
            <ul className="divide-y divide-gray-700 rounded border border-gray-700 overflow-hidden">
              {customers.map((c) => (
                <li
                  key={c._id || c.id}
                  className="p-3 hover:bg-gray-700/60 flex items-center justify-between transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.phone}</p>
                  </div>
                  {c.address?.city && (
                    <span className="text-[10px] px-2 py-1 bg-gray-900 rounded text-gray-300">
                      {c.address.city}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
