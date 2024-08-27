import { FC, FormEvent, useState } from 'react';
import { Movie } from '@/models/movie-model';
import { StarIcon } from '@heroicons/react/24/solid';

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

export const Form: FC = () => {
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const movie = new Movie(title, rating, description);
    handleTransactionSubmit(movie);
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleTransactionSubmit = async (movie: Movie) => {
    console.log(JSON.stringify(movie));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="py-4 px-6 max-w-[450px] flex items-center justify-center flex-col border border-gray-700 rounded-lg bg-gray-800 text-white"
    >
      <div className="mb-4">
        <label className="block text-gray-400 mb-2" htmlFor="title">
          Movie Title
        </label>
        <input
          id="title"
          className="p-2 w-[400px] bg-gray-700 border border-gray-600 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 mb-2" htmlFor="review">
          Add Your Review
        </label>
        <textarea
          id="review"
          className="w-[400px] p-2 bg-gray-700 border border-gray-600 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-center text-gray-400 mb-2"
          htmlFor="rating"
        >
          Select Rating
        </label>
        <div className="flex  space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-8 w-8 cursor-pointer ${
                star <= rating ? 'text-yellow-400' : 'text-gray-500'
              }`}
              onClick={() => handleStarClick(star)}
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-[400px] p-2 bg-green-600 hover:bg-green-700 rounded"
      >
        Submit Review
      </button>
    </form>
  );
};
