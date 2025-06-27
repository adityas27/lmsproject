const Footer = () => {
  return (
    <footer className="h-96 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            BrainBoard LMS
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <a href="/about" className="hover:underline">About</a>
            <a href="/contact" className="hover:underline">Contact</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} LearnMate. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
