import React from 'react';
import Event from '../../models/Event';
import SearchIcon from '../icons/SearchIcon';

interface SearchBarProps {
  events?: Array<Event>;
  className?: string;
}

export default function SearchBar({ events, className }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = React.useState<Array<Event>>([]);

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    // eslint-disable-next-line arrow-body-style
    const newFilter = events.filter((value) => {
      if (searchWord === '') return null;
      return value.name.toLowerCase().includes(searchWord);
    });
    setSearchTerm(newFilter);
  };
  return (
    <div>
      <div className="flex align-middle">
        <div>
          <input
            type="text"
            className="h-full border-0 w-full rounded-lg outline-1 bg-figma-200 text-figma-300 placeholder:fill-figma-400"
            placeholder="Search Events"
            onChange={handleFilter}
          />
        </div>
        <div className="mt-2">
          <SearchIcon className="h-6 top-3 text-figma-400 font-bold" />
        </div>
      </div>
      {searchTerm?.length !== 0 && (
        <div className="w-56 bg-gray-50 overflow-hidden overflow-y-auto text-md p-2 mt-3 shadow-lg scrollbar-hide absolute">
          {searchTerm?.map((value, i) => (
            <a
              key={i}
              href={`/app/event/${value?.index}`}
              className="w-full flex items-center border-b-2 border-primary-blue-400 hover:bg-gray-100 hover:text-black text-gray-500 py-1 relative"
            >
              <a className="text-black">{value.name}</a>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
