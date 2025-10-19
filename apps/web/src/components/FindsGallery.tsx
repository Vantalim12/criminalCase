import React, { useState, useEffect } from "react";
import type { Submission } from "@discover/types";
import { api } from "../lib/api";
import { shortenAddress } from "../lib/wallet";
import { format } from "date-fns";

export const FindsGallery: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await api.getApprovedSubmissions();
        setSubmissions(data.submissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📸</div>
        <div className="text-xl text-gray-400">Loading gallery...</div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <div className="text-2xl text-gray-400">No approved finds yet</div>
        <p className="text-gray-500 mt-2">
          Be the first to submit a successful find!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {submissions.map((submission) => (
        <div key={submission.id} className="polaroid">
          <img
            src={submission.photo_url}
            alt="Find"
            className="w-full h-64 object-cover"
          />
          <div className="mt-3 text-black text-sm">
            <div className="font-bold">
              Winner: {shortenAddress(submission.wallet_address)}
            </div>
            <div className="text-gray-600">
              {format(new Date(submission.submitted_at), "MMM dd, yyyy HH:mm")}
            </div>
            {submission.reviewer_notes && (
              <div className="text-xs text-gray-500 mt-1 italic">
                {submission.reviewer_notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
