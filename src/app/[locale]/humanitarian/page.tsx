import { useTranslations } from 'next-intl';
import { HumanitarianStats } from '@/components/home/HumanitarianStats';
import { getEvents } from '@/lib/data';

export default function HumanitarianPage() {
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
            🏥 {t('humanitarian.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        <HumanitarianStats events={events.events} />

        {/* 伤亡热力图说明 */}
        <div className="mt-8 border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">📍 伤亡热力分布</h3>
          <p className="text-sm text-muted-foreground mb-4">
            下图展示了过去30天内各地理位置的伤亡密度分布。颜色越深表示伤亡越集中。
          </p>
          <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
            <p>热力图需要地图组件支持</p>
            <p className="text-xs mt-2">可在 WorldMap 中开启热力图层查看</p>
          </div>
        </div>

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
