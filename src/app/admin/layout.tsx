import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isServerAdminAccess } from '@/lib/adminAccess';
import { ACCESS_TOKEN_COOKIE } from '@/lib/authCookie';
import { getAuthUserWithRoleFromToken } from '@/lib/authServerSupabase';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) {
        redirect('/login?next=/admin');
    }
    const auth = await getAuthUserWithRoleFromToken(token);
    if (!auth || !isServerAdminAccess(auth.role, auth.email)) {
        redirect('/login?next=/admin');
    }
    return children;
}
