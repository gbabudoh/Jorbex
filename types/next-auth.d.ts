import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: string;
      portalId?: string;
      portalType?: string;
      portalSlug?: string;
      portalName?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    userType: string;
    portalId?: string;
    portalType?: string;
    portalSlug?: string;
    portalName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userType: string;
    portalId?: string;
    portalType?: string;
    portalSlug?: string;
    portalName?: string;
  }
}
