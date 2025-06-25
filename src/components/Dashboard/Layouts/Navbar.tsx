import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/api/apiEndpoints";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const { user } = useAuthStore()

    const navigate = useNavigate()
    const { mutate } = useMutation({
      mutationFn: logout,
      onSuccess: () => {
        navigate("/auth/login")
      }
    })


  return (
    <header className="flex items-center justify-between py-5 border-b border-white/10 bg-white/5 px-5 sticky top-0 backdrop-blur-2xl z-[9]">
      {/* Left Side - Title */}
      <div className="flex items-center gap-5">
        <h2 className="text-xl font-semibold">Dashboard</h2>

      </div>
      {/* Right Side - User Menu */}
      <div className="flex items-center gap-4">
        {/* Dropdown Menu for User Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <div className="bg-primary text-lg font-semibold text-background size-[40px] flex justify-center items-center rounded-full">
                <h2 className="">{user?.username[0].toUpperCase()}</h2>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border-white/20 text-white">
            <DropdownMenuItem asChild  className="hover:bg-white/5 bg-white/10">
              <Link to="/" className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>View Main Site</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => mutate()} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
