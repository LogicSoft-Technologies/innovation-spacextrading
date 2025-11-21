// pages/Settings.jsx
import React, { useEffect, useState } from "react";
import {
  adminGetProfile,
  adminUpdateProfile,
} from "../Services/adminAuthServices";
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../Services/paymentMethodServices";

const Settings = () => {
  const [profile, setProfile] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [newMethod, setNewMethod] = useState({ name: "", details: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await adminGetProfile();
        setProfile(profileRes.admin || {});

        const methodsRes = await getPaymentMethods();
        setPaymentMethods(methodsRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await adminUpdateProfile(profile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!newMethod.name || !newMethod.details)
      return alert("Please fill all fields");
    try {
      const res = await createPaymentMethod(newMethod);
      setPaymentMethods([res.method, ...paymentMethods]);
      setNewMethod({ name: "", details: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add payment method");
    }
  };

  const updateMethod = async (id, updated) => {
    try {
      const res = await updatePaymentMethod(id, updated);
      setPaymentMethods((prev) =>
        prev.map((m) => (m._id === id ? res.method : m))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update payment method");
    }
  };

  const removeMethod = async (id) => {
    if (!confirm("Are you sure you want to delete this method?")) return;
    try {
      await deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment method");
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 text-center mt-10">Loading settings...</p>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Profile Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Admin Profile Settings
          </h2>
          <form
            onSubmit={saveProfile}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="flex flex-col">
              <label className="text-gray-600 font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName || ""}
                onChange={handleProfileChange}
                className="input-box"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName || ""}
                onChange={handleProfileChange}
                className="input-box"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email || ""}
                onChange={handleProfileChange}
                className="input-box"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full md:col-span-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Payment Method Management
          </h2>

          {/* Add New Method */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Payment Name (Binance, BTC...)"
              value={newMethod.name}
              onChange={(e) =>
                setNewMethod({ ...newMethod, name: e.target.value })
              }
              className="input-box"
            />
            <input
              type="text"
              placeholder="Payment Details"
              value={newMethod.details}
              onChange={(e) =>
                setNewMethod({ ...newMethod, details: e.target.value })
              }
              className="input-box"
            />
            <button
              onClick={addPaymentMethod}
              className="bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Add Method
            </button>
          </div>

          {/* Existing Methods */}
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method._id}
                className="p-4 border rounded-xl flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 flex flex-col md:flex-row md:gap-4">
                  <input
                    type="text"
                    value={method.name}
                    onChange={(e) =>
                      updateMethod(method._id, {
                        name: e.target.value,
                        details: method.details,
                      })
                    }
                    className="input-box mb-2 md:mb-0 flex-1"
                  />
                  <input
                    type="text"
                    value={method.details}
                    onChange={(e) =>
                      updateMethod(method._id, {
                        name: method.name,
                        details: e.target.value,
                      })
                    }
                    className="input-box flex-1"
                  />
                </div>
                <button
                  onClick={() => removeMethod(method._id)}
                  className="mt-2 md:mt-0 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition self-start md:self-auto"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
