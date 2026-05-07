import { useTranslations } from 'next-intl';
import { Timeline } from '@/components/home/Timeline';
import type { ConflictEvent } from '@/lib/types';
import { getEvents } from '@/lib/data';

interface TimelinePageProps {
  params: { locale: string };
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const t = useTranslations();
  const events = getEvents(undefined, { page_size: 500 });

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            📊 {t('timeline.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        <Timeline events={events.events} />

        <footer className="mt-12 pt-8 border-t">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t('footer.sources')}</p>
            <p className="mt-1">{t('footer.warning')}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
