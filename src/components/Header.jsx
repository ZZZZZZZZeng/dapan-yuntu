import React from 'react';

export default function Header({ stockCount }) {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🦞 大盘云图</h1>
        <div className="text-sm">
          共 <span className="font-bold text-yellow-400">{stockCount}</span> 只 A 股
        </div>
      </div>
    </header>
  );
}
