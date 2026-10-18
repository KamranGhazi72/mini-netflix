

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api, Movie, MovieDetails } from '../lib/api';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const userId = 'user123';

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    const data = await api.getMovies();
    setMovies(data);
    if (data.length > 0) {
      selectMovie(data[0]);
    }
  };

  const selectMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    const mDetails = await api.getDetailsByMovieId(movie.id);
    setDetails(mDetails);

    const progData = await api.getProgress(userId, movie.id);
    setProgress(progData.progressSeconds || 0);

    if (videoRef.current) {
      videoRef.current.currentTime = progData.progressSeconds || 0;
    }
  };

  const handlePauseOrSeek = () => {
    if (videoRef.current && selectedMovie) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      setProgress(currentTime);
      api.updateProgress(userId, selectedMovie.id, currentTime);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-black/80 backdrop-blur border-b border-neutral-800 sticky top-0 z-50">
        <h1 className="text-3xl font-extrabold text-red-600 tracking-wider">NETFLIX</h1>
        <Link
          href="/admin"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition"
        >
          Admin Panel 🛠️
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {selectedMovie ? (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
              <video
                ref={videoRef}
                src={selectedMovie.videoUrl}
                controls
                onPause={handlePauseOrSeek}
                onSeeked={handlePauseOrSeek}
                className="w-full aspect-video"
              />
            </div>

            {/* Movie Info */}
            <div className="flex justify-between items-start bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50">
              <div>
                <h2 className="text-3xl font-bold">{selectedMovie.title}</h2>
                <div className="flex gap-4 text-sm text-neutral-400 mt-2">
                  <span>{selectedMovie.releaseYear}</span>
                  <span className="border border-neutral-600 px-2 py-0.5 rounded">{selectedMovie.genre}</span>
                </div>
              </div>
              <div className="text-right bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-700">
                <p className="text-xs text-neutral-400">Redis Cache Watch Progress:</p>
                <p className="text-lg font-mono font-bold text-green-400">{progress} seconds</p>
              </div>
            </div>

            {/* MongoDB Section */}
            {details && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-neutral-800/30 p-6 rounded-xl border border-neutral-700/40">
                  <h3 className="text-xl font-semibold mb-2 text-red-400">Synopsis & Cast (MongoDB)</h3>
                  <p className="text-neutral-300 leading-relaxed mb-4">{details.synopsis}</p>
                  <h4 className="font-semibold text-sm text-neutral-400 mb-1">Cast:</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.cast?.map((actor, idx) => (
                      <span key={idx} className="bg-neutral-700 text-xs px-3 py-1 rounded-full">{actor}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-800/30 p-6 rounded-xl border border-neutral-700/40">
                  <h3 className="text-xl font-semibold mb-3 text-red-400">Comments & Ratings (MongoDB)</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {details.comments?.map((comment, idx) => (
                      <div key={idx} className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
                        <div className="flex justify-between text-xs text-neutral-400 mb-1">
                          <span className="font-bold text-white">{comment.user}</span>
                          <span className="text-yellow-400">{"★".repeat(comment.rating)}</span>
                        </div>
                        <p className="text-sm text-neutral-300">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Movie List Selection */}
            <div className="pt-8">
              <h3 className="text-xl font-bold mb-4">Movies Catalog (PostgreSQL)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movies.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMovie(m)}
                    className={`p-4 rounded-xl text-left transition border ${
                      selectedMovie.id === m.id
                        ? 'bg-red-600/20 border-red-500 font-bold'
                        : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    <p className="text-lg">{m.title}</p>
                    <p className="text-xs text-neutral-400 mt-1">{m.genre} • {m.releaseYear}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-20">No movies found. Please run Seed Data from Admin Panel.</p>
        )}
      </main>
    </div>
  );
}