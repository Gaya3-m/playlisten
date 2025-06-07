import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButton from "./SignInOAuthButton.tsx";
import { useAuthStore } from "@/stores/useAuthStore.ts";
import { buttonVariants } from "./ui/button.tsx";
import { cn } from "@/lib/utils.ts";

const Topbar = () =>{
    const {isAdmin} = useAuthStore();
    console.log({isAdmin});

    return (
        <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75
        backdrop-blur-md z-10">
            <div className="flex gap-2 items-center">
                <img src="/playlisten2.jpg" className="size-8" alt="Playlisten logo" />
                Playlist-en
            </div>
            <div className="flex items-center gap-4">
                {isAdmin &&(
                    <Link to={'/admin'} className={cn (buttonVariants({variant: "outline"}))}>
                        <LayoutDashboardIcon className="size-4 mr-2"/>
                        Admin Dashboard
                    </Link>
                )}
                <SignedOut>
                    <SignInOAuthButton/>
                </SignedOut>
                <UserButton/>

            </div>
        </div>

    )
}

export default Topbar