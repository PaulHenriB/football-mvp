import { useState } from "react";

const GroupForm = () => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/groups/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, createdBy: "user_id_here" }), // Replace with actual user ID
    });
    const data = await response.json();
    alert(`Group created! Invite Code: ${data.inviteCode}`);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Create a Group</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">
          Create Group
        </button>
      </form>
    </div>
  );
};

export default GroupForm;
