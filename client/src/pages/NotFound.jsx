const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-8xl font-extrabold tracking-widest text-indigo-500">
        404
      </h1>

      <p className="mt-4 text-2xl text-">
        Page Not Found
      </p>

      <p className="mt-2 text-gray-400 text-center max-w-md">
        The page you’re looking for doesn’t exist.
      </p>

      <button
        onClick={() => window.history.back()}
        className="mt-8 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 text-white font-medium shadow-lg"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
