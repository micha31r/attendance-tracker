import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
    
  const { data, error } = await supabase.auth.getClaims();
  const user = data?.claims;
  const isAuthenticated = !error && user;
  
  return (
    <nav className="flex gap-4 justify-between items-center w-full shadow-[inset_0_-1px_0_0px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_-1px_0_0px_rgba(255,255,255,0.1)] bg-background p-4 py-2 sticky top-0 z-10">
      <div>
        <h3 className="line-clamp-1 break-all">{user?.email}</h3>
      </div>
      {isAuthenticated && (
        <LogoutButton variant="secondary" className="" />
      )}
    </nav>
  );
}
