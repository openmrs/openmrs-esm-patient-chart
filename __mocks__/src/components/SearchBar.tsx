import React, { useState } from 'react';
import { smartSearch } from '../../smart-search';

export const SearchBar: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    const searchResults = smartSearch(keyword);
    setResults(searchResults);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search patient data..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <h4>{result.category}</h4>
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};
