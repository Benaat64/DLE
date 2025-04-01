// src/routes/Root.tsx
import { Outlet } from "react-router-dom";

const Root = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Root;
