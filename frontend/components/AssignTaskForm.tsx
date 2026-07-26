import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Volunteer {
  id: number;
  name: string;
  city: string;
}
interface Donation {
  id: number;
  name: string;
  amount: string;
  donation_for: string;
  address: string;
  is_dedicated?: boolean;
}

const AssignTaskForm: React.FC<{ onClose: () => void; refreshTasks: () => void }> = ({ onClose, refreshTasks }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Load approved volunteers
  useEffect(() => {
    fetch('/api/volunteer')
      .then((res) => res.json())
      .then((data) => {
        const approved = Array.isArray(data) ? data.filter((v: any) => v.status === 'Approved') : [];
        setVolunteers(approved);
      })
      .catch(console.error);
  }, []);

  // Load recent donations when volunteer selected
  useEffect(() => {
    if (!selectedVolunteer) return;
    const vol = volunteers.find((v) => v.id === Number(selectedVolunteer));
    if (!vol) return;
    setLoadingDonations(true);
    fetch(`/api/donations/recent?city=${encodeURIComponent(vol.city)}`)
      .then((res) => res.json())
      .then((data) => {
        setDonations(data.slice(0, 10)); // latest 10
        setLoadingDonations(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDonations(false);
      });
  }, [selectedVolunteer, volunteers]);

  const extractQuantity = (donationFor: string) => {
    const match = donationFor.match(/Qty[:]?\s*(\d+)/i);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;
    const payload = {
      volunteer_id: Number(selectedVolunteer),
      task_title: taskTitle,
      task_description: taskDesc,
      task_date: taskDate,
      task_time: taskTime,
      status: 'Pending',
    };
    const res = await fetch('/api/admin/assign-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
      refreshTasks();
      onClose();
    } else {
      alert(result.error || 'Failed to assign task');
    }
  };

  return (
    <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Assign Task to Volunteer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Volunteer</span>
            <select
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Volunteer</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.city}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Task Title</span>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Description</span>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">Date</span>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">Time</span>
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </label>
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
            Assign Task
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition">
            Cancel
          </button>
        </form>
        {/* Recent Donations */}
        {selectedVolunteer && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Recent Donations for {volunteers.find((v) => v.id === Number(selectedVolunteer))?.city}</h3>
            {loadingDonations ? (
              <p>Loading donations...</p>
            ) : donations.length === 0 ? (
              <p>No recent donations found.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {donations.map((don) => (
                  <div key={don.id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{don.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{don.donation_for}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{don.amount}</p>
                      {don.is_dedicated && <span className="text-xs bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-1 rounded">Premium</span>}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {extractQuantity(don.donation_for) || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AssignTaskForm;
