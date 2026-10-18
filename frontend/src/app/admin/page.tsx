
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Movie, MovieDetails } from '../../lib/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'postgres' | 'mongo' | 'redis'>('postgres');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [details, setDetails] = useState<MovieDetails[]>([]);
  const [redisKeys, setRedisKeys] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>('');

  // Form states
  const [newMovie, setNewMovie] = useState({ title: '', genre: '', releaseYear: 2024, videoUrl: '' });
  const [newDetail, setNewDetail] = useState({ movieId: 1, synopsis: '', cast: '' });
  const [redisUpdate, setRedisUpdate] = useState({ userId: 'user123', movieId: 1, seconds: 0 });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setMovies(await api.getMovies());
    setDetails(await api.getDetails());
    setRedisKeys(await api.getRedisKeys());
  };

  const handleSeed = async () => {
    const res = await api.seedData();
    setMessage(res);
    refreshData();
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createMovie(newMovie);
    setNewMovie({ title: '', genre: '', releaseYear: 2024, videoUrl: '' });
    refreshData();
  };

  const handleDeleteMovie = async (id: number) => {
    await api.deleteMovie(id);
    refreshData();
  };

  const handleCreateDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createDetails({
      movieId: Number(newDetail.movieId),
      synopsis: newDetail.synopsis,
      cast: newDetail.cast.split(',').map((s) => s.trim()),
      comments: []
    });
    setNewDetail({ movieId: 1, synopsis: '', cast: '' });
    refreshData();
  };

  const handleUpdateRedis = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateProgress(redisUpdate.userId, Number(redisUpdate.movieId), Number(redisUpdate.seconds));
    refreshData();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Admin Control Panel</h1>
            <p className="text-sm text-neutral-400 mt-1">Multi-Database Operations (PostgreSQL, MongoDB, Redis)</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSeed} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
              Seed Dummy Data 🚀
            </button>
            <Link href="/" className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-semibold border border-neutral-700">
              ← Back to App
            </Link>
          </div>
        </div>

        {message && <div className="bg-green-900/50 border border-green-500 text-green-200 p-3 rounded-lg">{message}</div>}

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-800 gap-2">
          {(['postgres', 'mongo', 'redis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold uppercase tracking-wider text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-red-600 text-red-500 bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab === 'postgres' ? 'PostgreSQL (Relational)' : tab === 'mongo' ? 'MongoDB (Documents)' : 'Redis (Key-Value)'}
            </button>
          ))}
        </div>

        {/* PostgreSQL Tab */}
        {activeTab === 'postgres' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateMovie} className="bg-neutral-800/40 p-6 rounded-xl border border-neutral-700 grid gap-4 md:grid-cols-2">
              <h3 className="md:col-span-2 font-bold text-lg text-red-400">Add New Movie (PostgreSQL)</h3>
              <input type="text" placeholder="Title" value={newMovie.title} onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <input type="text" placeholder="Genre" value={newMovie.genre} onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <input type="number" placeholder="Year" value={newMovie.releaseYear} onChange={(e) => setNewMovie({ ...newMovie, releaseYear: Number(e.target.value) })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <input type="text" placeholder="Video URL (.mp4)" value={newMovie.videoUrl} onChange={(e) => setNewMovie({ ...newMovie, videoUrl: e.target.value })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <button type="submit" className="md:col-span-2 bg-red-600 hover:bg-red-700 py-3 rounded font-bold">Add Movie</button>
            </form>

            <div className="bg-neutral-800/20 rounded-xl border border-neutral-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-neutral-800 text-neutral-400 text-xs uppercase">
                  <tr><th className="p-4">ID</th><th className="p-4">Title</th><th className="p-4">Genre</th><th className="p-4">Year</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-sm">
                  {movies.map((m) => (
                    <tr key={m.id}>
                      <td className="p-4 font-mono">{m.id}</td>
                      <td className="p-4 font-bold">{m.title}</td>
                      <td className="p-4">{m.genre}</td>
                      <td className="p-4">{m.releaseYear}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteMovie(m.id)} className="text-red-400 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MongoDB Tab */}
        {activeTab === 'mongo' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateDetail} className="bg-neutral-800/40 p-6 rounded-xl border border-neutral-700 space-y-4">
              <h3 className="font-bold text-lg text-red-400">Add Movie Details Document (MongoDB)</h3>
              <input type="number" placeholder="PostgreSQL Movie ID" value={newDetail.movieId} onChange={(e) => setNewDetail({ ...newDetail, movieId: Number(e.target.value) })} className="w-full bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <textarea placeholder="Synopsis" value={newDetail.synopsis} onChange={(e) => setNewDetail({ ...newDetail, synopsis: e.target.value })} className="w-full bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <input type="text" placeholder="Cast (comma separated)" value={newDetail.cast} onChange={(e) => setNewDetail({ ...newDetail, cast: e.target.value })} className="w-full bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-bold">Save Document</button>
            </form>

            <div className="space-y-4">
              {details.map((d) => (
                <div key={d.id} className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800 font-mono text-xs">
                  <p className="text-red-400">_id: {d.id} | movieId: {d.movieId}</p>
                  <p className="text-neutral-300 mt-2">{d.synopsis}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redis Tab */}
        {activeTab === 'redis' && (
          <div className="space-y-6">
            <form onSubmit={handleUpdateRedis} className="bg-neutral-800/40 p-6 rounded-xl border border-neutral-700 grid gap-4 md:grid-cols-3">
              <h3 className="md:col-span-3 font-bold text-lg text-red-400">Modify Cache Watch Progress (Redis Key-Value)</h3>
              <input type="text" placeholder="User ID" value={redisUpdate.userId} onChange={(e) => setRedisUpdate({ ...redisUpdate, userId: e.target.value })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <input type="number" placeholder="Movie ID" value={redisUpdate.movieId} onChange={(e) => setRedisUpdate({ ...redisUpdate, movieId: Number(e.target.value) })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <input type="number" placeholder="Progress Seconds" value={redisUpdate.seconds} onChange={(e) => setRedisUpdate({ ...redisUpdate, seconds: Number(e.target.value) })} className="bg-neutral-900 p-3 rounded border border-neutral-700" required />
              <button type="submit" className="md:col-span-3 bg-red-600 hover:bg-red-700 py-3 rounded font-bold">Update Redis Key</button>
            </form>

            <div className="bg-neutral-800/20 p-6 rounded-xl border border-neutral-800">
              <h4 className="font-bold mb-4 text-neutral-400">Stored Redis Keys:</h4>
              <div className="space-y-2 font-mono text-sm">
                {Object.entries(redisKeys).map(([key, val]) => (
                  <div key={key} className="flex justify-between bg-neutral-900 p-3 rounded border border-neutral-800">
                    <span className="text-green-400">{key}</span>
                    <span className="font-bold">{val} seconds</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}