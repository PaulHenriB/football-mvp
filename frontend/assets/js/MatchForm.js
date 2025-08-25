import { useState } from "react";

const MatchForm = () => {
  const [groupId, setGroupId] = useState(""); // Get from context or dropdown
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/matches/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, scheduledBy: "user_id_here", date, location }),
    });
    const data = await response.json();
    alert("Match Scheduled!");
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Schedule a Match</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded w-full mt-2"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border rounded w-full mt-2"
          required
        />
        <button type="submit" className="mt-2 bg-green-500 text-white p-2 rounded">
          Schedule Match
        </button>
      </form>
    </div>
  );
};

export default MatchForm;
