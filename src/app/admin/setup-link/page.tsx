"use client";

import { useState } from "react";

export default function SetupLinkPage() {
  const [link, setLink] = useState("");

  async function generateLink() {
    const res = await fetch("/api/staff/generate-setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "69f8df627e3325a2b86d2e1a"
      }),
    });

    const data = await res.json();

    if (data.success) {
      setLink(data.link);
    } else {
      alert("Error generating link");
    }
  }

  return (
    <div className="p-10">
      <button
        onClick={generateLink}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate Setup Link
      </button>

      {link && (
        <div className="mt-5">
          <p className="text-green-600">Generated Link:</p>
          <p className="break-all">{link}</p>
        </div>
      )}
    </div>
  );
}