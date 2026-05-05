import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
 
export default async function middleware(request: NextRequest) {
  const response = createMiddleware({
    locales: ['zh-CN', 'zh-TW', 'en', 'ru', 'fa'],
    defaultLocale: 'zh-CN',
    localePrefix: 'always'
  })(request);
 
  // Store locale in cookie for client-side access
  const locale = request.nextUrl.pathname.split('/')[1];
  if (locale && ['zh-CN', 'zh-TW', 'en', 'ru', 'fa'].includes(locale)) {
    response.cookies.set('locale', locale, { path: '/' });
  }
 
  return response;
}
 
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};