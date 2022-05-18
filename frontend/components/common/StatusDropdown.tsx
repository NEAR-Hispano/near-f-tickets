import React from 'react';

interface StatusDropdownProps {
  status: number;
  setEventStatus: React.Dispatch<React.SetStateAction<number>>;
}

const statusList = [
  { _id: 0, name: 'Private' },
  { _id: 1, name: 'Public' },
  { _id: 2, name: 'Expired' },
];

export default function StatusDropdown({
  status,
  setEventStatus,
}: StatusDropdownProps) {
  return (
    <div className="">
      <label htmlFor="status">
        <select
          id="status"
          value={status}
          onChange={(e) => setEventStatus(parseInt(e.target.value))}
          onBlur={(e) => setEventStatus(parseInt(e.target.value))}
          className="rounded-lg sm:w-1/2 w-full px-3 flex mt-2 shadow-lg text-sm"
        >
          <option>STATUS</option>
          {statusList.map((c) => (
            <option value={c._id} key={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
