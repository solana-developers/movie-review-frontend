import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Movie } from '@/models/movie-model';

export const MovieList: FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [movies, setMovies] = useState<Movie[]>([]); // Specify the type here

  useEffect(() => {
    setMovies(Movie.mocks);
  }, []);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
      {movies.map((movie, i) => (
        <Card key={i} movie={movie} />
      ))}
    </div>
  );
};
