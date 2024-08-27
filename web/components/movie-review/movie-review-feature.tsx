'use client';

import { MovieList } from '../ui/movie-list';
import { Form } from '../ui/review-form';

export default function MovieReviewFeature() {
  return (
    <div className="h-full">
      <div className="w-full items-center flex flex-col  px-4 mt-8">
        <h1 className="text-2xl text-gray-200 font-semibold mb-4">
          Add a review
        </h1>
        <div className="w-[700px] items-center flex justify-center ">
          <Form />
        </div>
        <h1 className="text-2xl text-gray-200 font-semibold mt-8 mb-4">
          Existing Reviews
        </h1>
        <div className=" ">
          <MovieList />
        </div>
      </div>
    </div>
  );
}
