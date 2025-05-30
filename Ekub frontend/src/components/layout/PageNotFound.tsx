import React, { ReactElement } from 'react';

const PageNotFound: React.FC = (): ReactElement => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-screen-md text-center">
        <h1 className="text-7xl font-extrabold text-red-500 dark:text-red-400 tracking-widest mb-6">
          404
        </h1>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-8">
          Uh oh! Looks like you got lost.
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for is not found.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded-full shadow-sm transition ease-in-out duration-100"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default PageNotFound;
