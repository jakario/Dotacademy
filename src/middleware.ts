import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/th/login",
  },
});

export const config = {
  matcher: [
    // Protect profile routes
    "/profile/:path*",
    "/:locale/profile/:path*",
    
    // Protect admin routes
    "/admin/:path*",
    "/:locale/admin/:path*",
    
    // Protect certificate routes
    "/courses/certificate/:path*",
    "/:locale/courses/certificate/:path*"
  ]
};
