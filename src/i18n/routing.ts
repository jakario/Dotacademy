import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localeCookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
