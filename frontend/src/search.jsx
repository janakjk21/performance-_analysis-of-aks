import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import api from '../../lib/api';
import SearchForm from '../../components/Search/SearchForm';
import SearchResults from '../../components/Search/SearchResults';
import SavedSearches from '../../components/Search/SavedSearches';
import Layout from '../../components/UI/Layout';
import { useAuth } from '../../lib/auth';

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch saved searches
  const { data: savedSearches, mutate: mutateSaved } = useSWR(
    user ? '/api/search/saved' : null,
    url => api.get(url).then(res => res.data)
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSearch = async (searchQuery, searchFilters = {}) => {
    try {
      setSearchLoading(true);
      setError(null);
      
      const response = await api.get('/api/search/media', {
        params: {
          query: searchQuery,
          ...searchFilters
        }
      });
      
      setResults(response.data);
      setQuery(searchQuery);
      setFilters(searchFilters);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    try {
      await api.post('/api/search/saved', {
        query,
        filters
      });
      mutateSaved();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  if (authLoading || !user) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Openverse Media Search</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SearchForm 
              onSearch={handleSearch} 
              initialQuery={query}
              initialFilters={filters}
              loading={searchLoading}
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <SearchResults 
              results={results} 
              loading={searchLoading}
              onSaveSearch={handleSaveSearch}
              currentQuery={query}
            />
          </div>
          
          <div className="md:col-span-1">
            <SavedSearches 
              searches={savedSearches || []} 
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}