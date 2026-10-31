import type { Recommendation } from '@/app/actions/recommendations'

const TYPE_META = {
  book: { label: 'كتاب', icon: 'menu_book', color: '#176b52', bg: '#e8f7f0' },
  video: { label: 'فيديو', icon: 'play_circle', color: '#b45309', bg: '#fef3c7' },
  course: { label: 'دورة', icon: 'school', color: '#5b21b6', bg: '#ede9fe' },
}

export function RecommendationsSection({ items }: { items: Recommendation[] }) {
  if (!items.length) return null

  const featured = items.filter((i) => i.is_featured)
  const rest = items.filter((i) => !i.is_featured)
  const ordered = [...featured, ...rest]

  return (
    <section id="recommendations" style={{ padding: '84px 0', background: 'linear-gradient(180deg, #f5faf7 0%, #fff 100%)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13,
            color: '#1f6b4a', background: '#e7f3ec', border: '1px solid #cfe8da',
            padding: '6px 16px', borderRadius: 999,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_stories</span>
            نقتبس منه
          </span>
          <h2 style={{
            fontFamily: 'Cairo, sans-serif', fontSize: 'clamp(26px,3.4vw,38px)',
            fontWeight: 800, color: '#0b3d2e', margin: '16px 0 14px',
          }}>
            ترشيحات كتب وفيديوهات ودورات
          </h2>
          <p style={{ color: '#4d6a5d', fontSize: 16 }}>
            مصادر منتقاة بعناية لتدعم رحلتك في الحفظ والتجويد — تُحدَّث من إدارة الأكاديمية
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 22,
        }}>
          {ordered.map((item, idx) => {
            const meta = TYPE_META[item.type] || TYPE_META.book
            const Card = item.url ? 'a' : 'div'
            const cardProps = item.url
              ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' }
              : {}
            return (
              <Card
                key={item.id}
                {...(cardProps as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  border: item.is_featured ? '2px solid #1f6b4a' : '1px solid #d9eae0',
                  borderRadius: 18,
                  padding: '28px 24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: item.is_featured ? '0 14px 34px -12px rgba(11,61,46,.2)' : 'none',
                  transition: 'transform .25s, box-shadow .25s',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `fadeUp .6s ease forwards ${0.08 * idx}s`,
                  opacity: 0,
                }}
              >
                {item.is_featured && (
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    background: '#0b3d2e', color: '#fff', fontSize: 11,
                    fontFamily: 'Cairo, sans-serif', fontWeight: 700,
                    padding: '4px 10px', borderRadius: 999,
                  }}>مميّز</span>
                )}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: meta.bg, color: meta.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
                    {meta.icon}
                  </span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: meta.color,
                  fontFamily: 'Cairo, sans-serif', marginBottom: 6,
                }}>{meta.label}</span>
                <h3 style={{
                  fontFamily: 'Cairo, sans-serif', fontSize: 18, fontWeight: 800,
                  color: '#0b3d2e', marginBottom: 6, lineHeight: 1.4,
                }}>{item.title}</h3>
                {item.author && (
                  <p style={{ fontSize: 13, color: '#5f7c6f', marginBottom: 8 }}>{item.author}</p>
                )}
                {item.description && (
                  <p style={{ fontSize: 14, color: '#4d6a5d', lineHeight: 1.7, flex: 1 }}>{item.description}</p>
                )}
                {item.url && (
                  <span style={{
                    marginTop: 16, fontSize: 13, fontWeight: 700,
                    color: '#1f6b4a', fontFamily: 'Cairo, sans-serif',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    عرض المزيد
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  </span>
                )}
              </Card>
            )
          })}
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
