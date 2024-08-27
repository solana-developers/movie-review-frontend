import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Movie } from '@/models/movie-model';

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

export const MovieList: FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connection = new Connection(clusterApiUrl('devnet'));
  const [movies, setMovies] = useState<Movie[]>([]); // Specify the type here

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const accounts = await connection.getProgramAccounts(
          new PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        );
        const movies: Movie[] = accounts.reduce(
          (accumulator: Movie[], { account }) => {
            try {
              const movie = Movie.deserialize(account.data);
              if (movie) {
                accumulator.push(movie);
              }
            } catch (error) {
              console.error('Error deserializing movie:', error);
            }
            return accumulator;
          },
          []
        );

        setMovies(movies);
      } catch (error) {
        console.error('Error fetching program accounts:', error);
      }
    };

    fetchMovies();
  }, [connection]);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
      {movies.map((movie, i) => (
        <Card key={i} movie={movie} />
      ))}
    </div>
  );
};
