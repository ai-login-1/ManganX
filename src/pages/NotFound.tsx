import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-[hsl(var(--amber))] font-mono">404</div>
        <div className="text-xl font-semibold text-[hsl(var(--text-primary))]">Route not found</div>
        <p className="text-sm text-[hsl(var(--text-tertiary))]">{location.pathname} does not exist in MANGAN-X</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 rounded bg-[hsl(var(--amber))] text-black text-sm font-semibold hover:bg-[hsl(38_92%_44%)] transition-colors"
        >
          Return to Command Center
        </button>
      </div>
    </div>
  );
};

export default NotFound;
