'use client';

import { FC } from 'react';
import { Movie } from '@/models/movie-model';
export interface CardProps {
  movie: Movie;
}

export const Card: FC<CardProps> = ({ movie }) => {
  return (
    <div className="p-4 w-[500px] border border-gray-700 rounded-lg m-2 bg-gray-900 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{movie.title}</h2>
        <span className="text-yellow-400">{movie.rating}/5</span>
      </div>
      <p className="text-gray-400 mt-2">{movie.description}</p>
    </div>
  );
};
