import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/entrar',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/espaco/:path*',
  ],
}
