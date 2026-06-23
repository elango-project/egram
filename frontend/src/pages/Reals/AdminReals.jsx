import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import realService from '../../services/realService';

const AdminReals = () => {
  const [reals, setReals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReals();
  }, []);

  const fetchReals = async () => {
    try {
      const data = await realService.getReals(0, 100);
      setReals(data.content);
    } catch (error) {
      console.error('Failed to fetch reals', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await realService.uploadReal({ 
        title, 
        description, 
        youtubeUrl,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setCategory('');
      setTags('');
      fetchReals();
    } catch (error) {
      console.error('Failed to upload real', error);
      toast.error('Failed to upload real');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Real?')) {
      try {
        await realService.deleteReal(id);
        fetchReals();
      } catch (error) {
        console.error('Failed to delete real', error);
        toast.error('Failed to delete real');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Reals</h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upload New Real</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input 
              type="text" 
              placeholder="Title" 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input 
              type="url" 
              placeholder="YouTube URL" 
              required
              value={youtubeUrl} 
              onChange={e => setYoutubeUrl(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input 
              type="text" 
              placeholder="Category (e.g. Frontend, Backend)" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input 
              type="text" 
              placeholder="Tags (comma separated)" 
              value={tags} 
              onChange={e => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <textarea 
              placeholder="Description" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 sm:col-span-2"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Real'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analytics</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reals.map(real => (
              <tr key={real.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {real.thumbnailUrl && (
                      <img src={real.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover mr-3" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{real.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-4 text-sm font-medium text-gray-600">
                    <span title="Total Views">👁 {real.viewCount || 0}</span>
                    <span title="Total Likes">❤️ {real.likeCount || 0}</span>
                    <span title="Total Comments">💬 {real.commentCount || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(real.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(real.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {reals.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No Reals uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReals;
