

const API_BASE_URL = 'http://localhost:8080/api';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  releaseYear: number;
  videoUrl: string;
}

export interface Comment {
  user: string;
  text: string;
  rating: number;
}

export interface MovieDetails {
  id?: string;
  movieId: number;
  synopsis: string;
  cast: string[];
  comments: Comment[];
}

export const api = {
  // PostgreSQL - Movies
  getMovies: async (): Promise<Movie[]> => {
    const res = await fetch(`${API_BASE_URL}/postgres/movies`, { cache: 'no-store' });
    return res.json();
  },
  createMovie: async (movie: Omit<Movie, 'id'>): Promise<Movie> => {
    const res = await fetch(`${API_BASE_URL}/postgres/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    return res.json();
  },
  deleteMovie: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/postgres/movies/${id}`, { method: 'DELETE' });
  },

  // MongoDB - Details
  getDetails: async (): Promise<MovieDetails[]> => {
    const res = await fetch(`${API_BASE_URL}/mongo/details`, { cache: 'no-store' });
    return res.json();
  },
  getDetailsByMovieId: async (movieId: number): Promise<MovieDetails | null> => {
    const res = await fetch(`${API_BASE_URL}/mongo/details/movie/${movieId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  },
  createDetails: async (details: MovieDetails): Promise<MovieDetails> => {
    const res = await fetch(`${API_BASE_URL}/mongo/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    return res.json();
  },

  // Redis - Watch Progress
  getProgress: async (userId: string, movieId: number): Promise<{ progressSeconds: number }> => {
    const res = await fetch(`${API_BASE_URL}/redis/progress/${userId}/${movieId}`, { cache: 'no-store' });
    return res.json();
  },
  updateProgress: async (userId: string, movieId: number, progressSeconds: number) => {
    await fetch(`${API_BASE_URL}/redis/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, movieId, progressSeconds }),
    });
  },
  getRedisKeys: async (): Promise<Record<string, string>> => {
    const res = await fetch(`${API_BASE_URL}/redis/keys`, { cache: 'no-store' });
    return res.json();
  },

  // Seed Data
  seedData: async (): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    return res.text();
  }
};