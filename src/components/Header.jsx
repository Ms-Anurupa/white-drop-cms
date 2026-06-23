const Header = () => {
  return (
    <header className="h-14 bg-white shadow px-3 sm:px-4 md:px-6 flex items-center justify-between">
      {/* Title */}
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 truncate">
          CMS Dashboard
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Optional username */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-700">Admin</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>

        {/* Avatar */}
        <img
          src="https://i.pravatar.cc/40"
          alt="user"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
};

export default Header;