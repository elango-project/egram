import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, CheckCircle } from 'lucide-react';
import courseService from '../../services/courseService';

const ContentSelectorModal = ({ type, onSelect, onClose, existingIds = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else if (query.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    setHasSearched(true);
    try {
      if (type === 'REEL') {
        const data = await courseService.searchReals(searchQuery);
        setResults(data || []);
      } else if (type === 'VIDEO') {
        const data = await courseService.searchVideos(searchQuery);
        setResults(data || []);
      }
    } catch (err) {
      console.error('Search failed', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const isAttached = (id) => existingIds.includes(id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            Attach {type === 'REEL' ? 'Reel' : 'Video'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              autoFocus
              placeholder={`Search ${type === 'REEL' ? 'Reels' : 'Videos'} by title...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((item) => {
                const attached = isAttached(item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                      attached 
                        ? 'bg-gray-50 border-gray-200 opacity-75' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!attached) onSelect(item.id);
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                      )}
                      {type === 'VIDEO' && item.duration > 0 && (
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                          {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate text-sm mb-1" title={item.title}>
                        {item.title}
                      </h4>
                      {type === 'REEL' && item.category && (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Action Area */}
                    <div className="pr-2">
                      {attached ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={14} /> Attached
                        </span>
                      ) : (
                        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12 text-gray-500">
              <p>No {type.toLowerCase()}s found matching "{query}".</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Search className="mx-auto mb-3 opacity-20" size={48} />
              <p>Type at least 2 characters to search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentSelectorModal;
