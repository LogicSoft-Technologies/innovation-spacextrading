import React, { useState, useContext, useEffect } from "react";
import { Bell, Lock, User } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";

const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) setProfile({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      await updateProfile(profile);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setSuccessMsg(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#A72703] focus:outline-none";

  return (
    <div className="p-6 md:p-8 space-y-8 font-[Inter]">
      <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      <p className="text-gray-600">Manage your account preferences and profile.</p>

      {/* Account Information */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-4 h-4 text-[#A72703]" /> Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#A72703] hover:bg-[#901f02]"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {successMsg && <p className="text-green-600 text-sm mt-2">{successMsg}</p>}
      </div>

      {/* Notifications */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#A72703]" /> Notifications
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Email & in-app notifications</p>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#A72703] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#A72703]" /> Security
        </h2>
        <button
          onClick={() => alert("Change password / 2FA feature coming soon!")}
          className="bg-[#A72703] text-white px-4 py-2 rounded-lg hover:bg-[#901f02]"
        >
          Change Password / 2FA
        </button>
      </div>
    </div>
  );
};

export default Settings;
