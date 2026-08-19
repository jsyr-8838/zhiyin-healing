import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    // ── 访客登录（原有逻辑，保持兼容） ──
    CredentialsProvider({
      id: 'visitor',
      name: 'visitor',
      credentials: {},
      async authorize(_credentials, req) {
        const visitorId = req.headers?.['x-visitor-id'] as string
          || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        let user = await prisma.user.findUnique({ where: { id: visitorId } });
        if (!user) {
          user = await prisma.user.create({
            data: { id: visitorId, nickname: '疗愈行者', vipLevel: 'pro' },
          });
        }

        return { id: user.id, name: user.nickname };
      },
    }),

    // ── 手机号登录（新增） ──
    // 注意：实际的验证码校验由 /api/auth/phone-login 完成
    // 这里只在 NextAuth 层面完成 session 创建
    CredentialsProvider({
      id: 'phone',
      name: 'phone',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.userId) return null;

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        });
        if (!user) return null;

        return {
          id: user.id,
          name: user.nickname || user.name || '用户',
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 365 * 24 * 60 * 60 }, // 1年有效
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = ('role' in user ? (user as Record<string, unknown>).role : null) || 'visitor';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',  // 指向新的登录/注册页
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
