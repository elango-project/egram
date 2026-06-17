import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import videoService from '../../services/videoService';

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedAnalytics, setSelectedAnalytics] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      // Fetch using the new pagination method
      const data = await videoService.getFeedPage(0, 50); 
      setVideos(data.content || []);
    } catch (error) {
      console.error('Failed to fetch videos', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await videoService.uploadVideo({ title, description, videoUrl, thumbnailUrl });
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      fetchVideos();
    } catch (error) {
      console.error('Failed to upload video', error);
      toast.error('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Video?')) {
      try {
        await videoService.deleteVideo(id);
        fetchVideos();
      } catch (error) {
        console.error('Failed to delete video', error);
        toast.error('Failed to delete video');
      }
    }
  };

  const loadAnalytics = async (id) => {
    try {
      const data = await videoService.getAnalytics(id);
      setSelectedAnalytics(data);
    } catch (err) {
      toast.error('Failed to load analytics');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Long-form Videos</h2>

      {selectedAnalytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Video Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Total Views:</span> <span className="font-bold">{selectedAnalytics.views}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Likes:</span> <span className="font-bold">{selectedAnalytics.likes}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Comments:</span> <span className="font-bold">{selectedAnalytics.comments}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Avg Watch %:</span> <span className="font-bold">{Math.round(selectedAnalytics.averageWatchPercentage)}%</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Completion Rate:</span> <span className="font-bold">{Math.round(selectedAnalytics.completionRate)}%</span></div>
              <div className="flex justify-between pb-2"><span className="text-gray-600">Continue Watching Count:</span> <span className="font-bold">{selectedAnalytics.continueWatchingCount}</span></div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setSelectedAnalytics(null)} className="px-4 py-2 bg-gray-200 rounded font-medium hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upload New Video</h3>
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
              type="text" 
              placeholder="Video URL" 
              required
              value={videoUrl} 
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input 
              type="text" 
              placeholder="Thumbnail URL" 
              required
              value={thumbnailUrl} 
              onChange={e => setThumbnailUrl(e.target.value)}
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
            className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrics</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {videos.map(video => (
              <tr key={video.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {video.thumbnailUrl && (
                      <img src={video.thumbnailUrl} alt="" className="w-16 h-9 rounded object-cover mr-3" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      <div className="text-xs text-gray-500">{new Date(video.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{video.viewCount} Views</div>
                  <div className="text-xs text-gray-500">{video.likeCount} Likes | {video.commentCount} Comments</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => loadAnalytics(video.id)} className="text-blue-600 hover:text-blue-900 mr-4">Analytics</button>
                  <button onClick={() => handleDelete(video.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No Videos uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVideos;
