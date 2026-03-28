import React, { useState } from 'react';
import { industries } from '../data/stockCodes';

export default function FilterBar({ onSearch, onIndustryChange, currentIndustry = '全部' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(currentIndustry);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleIndustryChange = (e) => {
    const industry = e.target.value;
    setSelectedIndustry(industry);
    onIndustryChange(industry);
  };

  return (
    <div className="bg-gray-800 px-4 py-3 flex items-center gap-4">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="搜索股票名称或代码..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-400"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-gray-400 text-sm">行业:</label>
        <select
          value={selectedIndustry}
          onChange={handleIndustryChange}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        >
          <option value="全部">全部</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
