import { useCall, useFetch } from "helium/client";
import { getProfile, updateProfile } from "helium/server";

export default function ProfilePage() {
  const { data: profile } = useFetch(getProfile);

  const { call: saveProfile, isCalling } = useCall(updateProfile, {
    invalidate: [getProfile],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Profile Settings</h1>
      <div className="space-y-4 w-md">
        <div className="w-full flex flex-col">
          <label className="block text-slate-400 mb-2">Name</label>
          <input
            type="text"
            value={profile?.name}
            onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
            className="input"
          />
        </div>
        <div className="w-full flex flex-col  ">
          <label className="block text-slate-400 mb-2">Email</label>
          <input
            type="email"
            value={profile?.email}
            className="input"
            onChange={(e) => saveProfile({ ...profile, email: e.target.value })}
          />
        </div>
        <button className="button primary">Save Changes</button>
      </div>
    </div>
  );
}
