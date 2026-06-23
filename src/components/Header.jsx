const Header = () => {
  return (
    <div>
      <header className="h-16 bg-white shadow flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold text-gray-700">CMS Dashboard</h2>

        <div className="flex items-center gap-4">
          <img
            src="https://i.pravatar.cc/40"
            className="w-10 h-10 rounded-full"
            alt="user"
          />
        </div>
      </header>
    </div>
  );
};

export default Header;
