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
import {
  CreditCard,
  Loader,
  Plus,
  Save,
  Settings as SettingsIcon,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#A72703] focus:ring-2 focus:ring-[#A72703]/10";

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
    if (!newMethod.name || !newMethod.details) {
      return alert("Please fill all fields");
    }

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
        prev.map((method) => (method._id === id ? res.method : method))
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
      setPaymentMethods((prev) => prev.filter((method) => method._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment method");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-10 w-10 animate-spin text-[#A72703]" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] p-4 md:p-6 font-[Inter]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Control panel
              </p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                Settings
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Manage admin profile information and user payment instructions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-xs text-slate-400">Payment Methods</p>
              <p className="text-lg font-semibold text-white">
                {paymentMethods.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#FFF6F2] p-3 text-[#A72703]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Admin Profile
                </h2>
                <p className="text-sm text-slate-500">
                  Keep account identity details current.
                </p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName || ""}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName || ""}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A72703] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#A72703]/20 hover:bg-[#7C1B01] disabled:bg-slate-300 disabled:shadow-none"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-50 p-3 text-green-700">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Payment Method Management
                  </h2>
                  <p className="text-sm text-slate-500">
                    Add and edit payment details shown to investors.
                  </p>
                </div>
              </div>

              <SettingsIcon className="hidden h-5 w-5 text-slate-400 lg:block" />
            </div>

            <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Add New Method
              </p>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.4fr_auto]">
                <input
                  type="text"
                  placeholder="Payment name"
                  value={newMethod.name}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, name: e.target.value })
                  }
                  className={inputClass}
                />

                <input
                  type="text"
                  placeholder="Wallet address, bank info, or instructions"
                  value={newMethod.details}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, details: e.target.value })
                  }
                  className={inputClass}
                />

                <button
                  onClick={addPaymentMethod}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {paymentMethods.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <CreditCard className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    No payment methods added yet.
                  </p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.4fr_auto]">
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) =>
                          updateMethod(method._id, {
                            name: e.target.value,
                            details: method.details,
                          })
                        }
                        className={inputClass}
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
                        className={inputClass}
                      />

                      <button
                        onClick={() => removeMethod(method._id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;