import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div 
      className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 flex flex-col gap-2"
      role="alert"
    >
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="w-5 h-5" />
        <span>404 Not Found Data With Your Current URL.</span>
      </div>
      <Link 
        to="/" 
        className="font-semibold text-red-900 underline hover:text-red-700 w-fit"
      >
        Go home.
      </Link>
    </div>
  );
};

export default NotFound;