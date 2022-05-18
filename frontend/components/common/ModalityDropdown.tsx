import React from 'react';

interface ModalityDropdownProps {
  modality;
  setModality: React.Dispatch<React.SetStateAction<number>>;
}

const modalityList = [
  { _id: 0, name: 'Online' },
  { _id: 1, name: 'Face to Face' },
];

export default function ModalityDropdown({
  modality,
  setModality,
}: ModalityDropdownProps) {
  return (
    <div className="">
      <label htmlFor="modality">
        <select
          id="modality"
          value={modality}
          onChange={(e) => setModality(parseInt(e.target.value))}
          onBlur={(e) => setModality(parseInt(e.target.value))}
          className="rounded-lg sm:w-1/2 lg:w-full px-3 flex mt-2 shadow-lg text-sm"
        >
          <option>SELECCIONE</option>
          {modalityList.map((c) => (
            <option value={c._id} key={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
