import React, { useState } from 'react';

export default function FilterBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-gray-700 p-4 shadow-md">
      <form onSubmit={handleSearch} className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="搜索股票名称或代码..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
}
