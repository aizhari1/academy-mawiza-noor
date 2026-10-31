'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const WA = 'https://wa.me/201095591415'
const PHONE = 'tel:+201062510428'
const FB = 'https://www.facebook.com/Mawizah.academy?locale=ar_AR'

export function LandingClient() {
  const [soundOn, setSoundOn] = useState(false)
  const [botOpen, setBotOpen] = useState(false)
  const [botMsgs, setBotMsgs] = useState<{ who: 'bot' | 'user'; text: string }[]>([
    { who: 'bot', text: 'السلام عليكم ورحمة الله 🌿 أنا مساعد أكاديمية موعظة ونور، تقدري تسأليني عن الباقات، الأسعار، أو طريقة التسجيل.' },
  ])
  const [botInput, setBotInput] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const idxRef = useRef(0)
  const bodyRef = useRef<HTMLDivElement | null>(null)

  const files = [
    'https://everyayah.com/data/Husary_128kbps/001001.mp3',
    'https://everyayah.com/data/Husary_128kbps/001002.mp3',
    'https://everyayah.com/data/Husary_128kbps/001003.mp3',
    'https://everyayah.com/data/Husary_128kbps/001004.mp3',
    'https://everyayah.com/data/Husary_128kbps/001005.mp3',
    'https://everyayah.com/data/Husary_128kbps/001006.mp3',
    'https://everyayah.com/data/Husary_128kbps/001007.mp3',
  ]

  useEffect(() => {
    const a = new Audio(files[0])
    a.preload = 'auto'
    audioRef.current = a
    const onEnded = () => {
      idxRef.current = (idxRef.current + 1) % files.length
      a.src = files[idxRef.current]
      a.play().catch(() => {})
    }
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('ended', onEnded)
      a.pause()
    }
  }, [])

  function toggleSound() {
    const a = audioRef.current
    if (!a) return
    if (soundOn) {
      a.pause()
      setSoundOn(false)
    } else {
      a.muted = false
      a.play().catch(() => {})
      setSoundOn(true)
    }
  }

  const faq = [
    { keys: ['باق', 'سعر', 'فلوس', 'تمن', 'اشتراك'], a: 'متاح معنا 4 باقات شهرية: 4 حلقات بـ200ج، 6 حلقات بـ300ج، 8 حلقات بـ400ج، 12 حلقة بـ600ج. ومعظم طلابنا يختارون مدة نصف الساعة للحلقة 🌱' },
    { keys: ['رقم', 'تواصل', 'واتس', 'اتصال', 'موبايل'], a: 'للتواصل المباشر: 01062510428 — وعلى واتساب: +201095591415 وسنرد عليكِ في أقرب وقت 📱' },
    { keys: ['طفل', 'أطفال', 'ابني', 'بنتي'], a: 'حلقات الأطفال عندنا مصممة بأسلوب تفاعلي ومحفّز، مع تقارير دورية لولي الأمر عن مستوى الحفظ 👦👧' },
    { keys: ['نساء', 'سيدات', 'حريم', 'بنات'], a: 'حلقات النساء بالكامل مع معلمات متخصصات، في خصوصية تامة ومواعيد مرنة تناسب أعمالكِ المنزلية 🌸' },
    { keys: ['سجل', 'تسجيل', 'احجز', 'حجز', 'اشترك'], a: 'للتسجيل: راسلينا على واتساب، نحدد مستواكِ، نعطيكِ حلقة تجريبية مجانية، ثم تختاري الباقة المناسبة ✨' },
    { keys: ['تجريب', 'مجان'], a: 'نعم، نوفر حلقة تجريبية أولى لتتعرفي على أسلوب المعلم أو المعلمة قبل الاشتراك في أي باقة 🤍' },
    { keys: ['مدة', 'نص ساعة', 'ساعة'], a: 'مدة الحلقة قابلة للاختيار: نصف ساعة أو ساعة كاملة، وأغلب طلابنا (99%) يفضّلون نصف الساعة ⏱️' },
  ]

  function respond(text: string) {
    const t = text.trim()
    if (!t) return
    setBotMsgs((m) => [...m, { who: 'user', text: t }])
    const match = faq.find((f) => f.keys.some((k) => t.includes(k)))
    setTimeout(() => {
      setBotMsgs((m) => [
        ...m,
        { who: 'bot', text: match ? match.a : 'شكرًا لتواصلك 🌿 لمزيد من التفاصيل يفضل التواصل المباشر على واتساب: +201095591415' },
      ])
      setTimeout(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
      }, 50)
    }, 350)
  }

  function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '')
    const phone = String(fd.get('phone') || '')
    const type = String(fd.get('type') || '')
    const msg = encodeURIComponent(`السلام عليكم، اسمي ${name}، أرغب في الاستفسار عن: ${type}. رقم التواصل: ${phone}`)
    window.open(`${WA}?text=${msg}`, '_blank')
  }

  const packages = [
    { title: 'الباقة الأولى', price: '200', sessions: '4 حلقات شهريًا', note: 'حلقة أسبوعية واحدة · مناسبة للمتابعة الخفيفة', featured: false },
    { title: 'الباقة الثانية', price: '300', sessions: '6 حلقات شهريًا', note: 'توازن مثالي بين الوقت والسعر', featured: true },
    { title: 'الباقة الثالثة', price: '400', sessions: '8 حلقات شهريًا', note: 'حلقتان أسبوعيًا · لتسريع الحفظ', featured: false },
    { title: 'الباقة الرابعة', price: '600', sessions: '12 حلقة شهريًا', note: '3 حلقات أسبوعيًا · للحفظ المكثف', featured: false },
  ]

  return (
    <div className="landing-root" dir="rtl">
      <style>{`
        .landing-root {
          --g950:#08291F; --g900:#0B3D2E; --g700:#1F6B4AA; --g600:#27815A; --g500:#2E8B57;
          --g200:#CFE8DA; --g100:#E7F3EC; --g50:#F5FAF7; --ink:#173A2C; --line:#D9EAE0;
          --shadow:0 14px 34px -12px rgba(11,61,46,.25); --radius:18px;
          font-family: 'Tajawal', 'IBM Plex Sans Arabic', sans-serif;
          color: var(--ink); background: #fff; line-height: 1.8; overflow-x: hidden;
        }
        .landing-root h1,.landing-root h2,.landing-root h3,.landing-root h4 {
          font-family: Cairo, 'IBM Plex Sans Arabic', sans-serif; color: var(--g900); line-height: 1.35;
        }
        .landing-root a { color: inherit; text-decoration: none; }
        .l-container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .l-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: Cairo, sans-serif; font-weight: 700; font-size: 13px;
          color: var(--g700); background: var(--g100); border: 1px solid var(--g200);
          padding: 6px 16px; border-radius: 999px;
        }
        .l-topbar { background: var(--g950); color: var(--g100); font-size: 13.5px; }
        .l-topbar .l-container { display: flex; align-items: center; justify-content: space-between; padding: 8px 24px; gap: 14px; flex-wrap: wrap; }
        .l-topbar a:hover { color: #fff; }
        .l-sound {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
          color: var(--g100); padding: 5px 12px; border-radius: 999px; font-size: 12.5px; cursor: pointer;
        }
        header.l-nav {
          position: sticky; top: 0; z-index: 40;
          background: rgba(255,255,255,.92); backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--line);
        }
        .l-nav .l-container { display: flex; align-items: center; justify-content: space-between; height: 78px; }
        .l-brand { display: flex; align-items: center; gap: 12px; }
        .l-brand b { font-family: Cairo, sans-serif; font-weight: 800; color: var(--g900); font-size: 18px; display: block; }
        .l-brand span { font-size: 11.5px; color: var(--g600); }
        nav.l-links { display: flex; align-items: center; gap: 28px; }
        nav.l-links a { font-family: Cairo, sans-serif; font-weight: 600; font-size: 15px; color: var(--g900); }
        .l-nav-cta {
          font-family: Cairo, sans-serif; font-weight: 700; font-size: 14.5px;
          background: var(--g700); color: #fff; padding: 11px 22px; border-radius: 999px;
          display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow);
        }
        .l-nav-cta:hover { background: var(--g900); }
        .l-hero {
          position: relative; background: var(--g950); color: #fff;
          overflow: hidden; padding: 96px 0 90px; text-align: center;
        }
        .l-hero h1 { color: #fff; font-size: clamp(32px,5vw,54px); font-weight: 900; max-width: 880px; margin: 0 auto 16px; }
        .l-hero h1 span { color: var(--g200); }
        .l-hero .ayah { font-family: Amiri, serif; font-style: italic; font-size: 22px; color: var(--g200); margin-bottom: 18px; }
        .l-hero .lead { font-size: 18px; color: var(--g100); max-width: 620px; margin: 0 auto 28px; }
        .l-cta-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 28px; }
        .l-btn {
          font-family: Cairo, sans-serif; font-weight: 700; font-size: 15.5px;
          padding: 15px 30px; border-radius: 999px; display: inline-flex; align-items: center; gap: 10px;
          transition: .25s; border: none; cursor: pointer;
        }
        .l-btn-primary { background: #fff; color: var(--g900); }
        .l-btn-primary:hover { background: var(--g200); transform: translateY(-2px); }
        .l-btn-ghost { border: 1.5px solid rgba(255,255,255,.55); color: #fff; background: transparent; }
        .l-btn-ghost:hover { background: rgba(255,255,255,.12); }
        .l-stats { display: flex; gap: 28px; flex-wrap: wrap; justify-content: center; }
        .l-stats .stat { display: flex; align-items: center; gap: 8px; font-family: Cairo, sans-serif; font-weight: 700; font-size: 14px; color: var(--g100); }
        .l-trust { background: var(--g50); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 34px 0; }
        .l-trust .l-container { display: flex; flex-wrap: wrap; gap: 28px; justify-content: space-between; }
        .l-trust .item { display: flex; align-items: center; gap: 12px; font-family: Cairo, sans-serif; font-weight: 700; font-size: 14.5px; flex: 1; min-width: 200px; color: var(--g900); }
        section.l-sec { padding: 84px 0; }
        .l-sec-head { text-align: center; max-width: 680px; margin: 0 auto 52px; }
        .l-sec-head h2 { font-size: clamp(26px,3.4vw,38px); font-weight: 800; margin: 16px 0 14px; }
        .l-sec-head p { color: #4d6a5d; font-size: 16px; }
        .l-prog-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 26px; }
        .l-prog-card {
          background: var(--g50); border: 1px solid var(--line); border-radius: var(--radius);
          padding: 36px 32px; transition: .3s;
        }
        .l-prog-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); border-color: var(--g200); }
        .l-prog-card .icon {
          width: 58px; height: 58px; border-radius: 16px; background: var(--g700); color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 18px;
        }
        .l-prog-card h3 { font-size: 22px; margin-bottom: 10px; }
        .l-prog-card ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 11px; margin-top: 16px; }
        .l-prog-card li { font-size: 14.5px; display: flex; gap: 8px; }
        .l-steps { display: grid; grid-template-columns: repeat(5,1fr); gap: 18px; }
        .l-step {
          background: #fff; border: 1px solid var(--line); border-radius: var(--radius);
          padding: 26px 18px; text-align: center; transition: .3s;
        }
        .l-step:hover { border-color: var(--g200); box-shadow: var(--shadow); transform: translateY(-4px); }
        .l-step .num {
          width: 38px; height: 38px; border-radius: 50%; background: var(--g900); color: #fff;
          display: flex; align-items: center; justify-content: center; font-family: Cairo, sans-serif; font-weight: 800;
          margin: 0 auto 14px;
        }
        .l-pkg-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 22px; }
        .l-pkg {
          background: #fff; border: 1.5px solid var(--line); border-radius: var(--radius);
          padding: 30px 24px; display: flex; flex-direction: column; gap: 14px; position: relative; transition: .3s;
        }
        .l-pkg:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
        .l-pkg.featured { border-color: var(--g700); background: var(--g900); color: #fff; }
        .l-pkg.featured h3, .l-pkg.featured .price b { color: #fff; }
        .l-pkg .price b { font-size: 34px; font-weight: 900; color: var(--g900); font-family: Cairo, sans-serif; }
        .l-pkg .badge {
          position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
          background: #fff; color: var(--g900); font-family: Cairo, sans-serif; font-weight: 800; font-size: 12px;
          padding: 6px 16px; border-radius: 999px; box-shadow: var(--shadow); white-space: nowrap;
        }
        .l-test-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 22px; }
        .l-test {
          background: var(--g50); border: 1px solid var(--line); border-radius: var(--radius);
          padding: 28px 26px;
        }
        .l-contact { background: var(--g950); color: #fff; }
        .l-contact h2 { color: #fff; }
        .l-contact-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 50px; align-items: center; }
        .l-contact-card {
          background: #fff; color: var(--ink); border-radius: 20px; padding: 34px; box-shadow: var(--shadow);
        }
        .l-contact-card input, .l-contact-card select {
          width: 100%; padding: 13px 16px; border-radius: 10px; border: 1px solid var(--line);
          font-family: inherit; font-size: 14px; background: var(--g50); margin-bottom: 12px;
        }
        footer.l-foot { background: #06201A; color: var(--g100); padding: 48px 0 22px; }
        .l-fab {
          position: fixed; bottom: 24px; z-index: 50; width: 58px; height: 58px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff;
          box-shadow: 0 10px 26px -6px rgba(0,0,0,.35); border: none; cursor: pointer;
        }
        .l-fab-wa { left: 24px; background: #25D366; }
        .l-fab-bot { right: 24px; background: var(--g700); }
        .l-bot {
          position: fixed; bottom: 94px; right: 24px; width: 340px; max-height: 460px; background: #fff;
          border-radius: 18px; box-shadow: 0 22px 50px -14px rgba(0,0,0,.35); z-index: 55;
          display: flex; flex-direction: column; border: 1px solid var(--line);
          transform: translateY(16px) scale(.97); opacity: 0; pointer-events: none; transition: .22s;
        }
        .l-bot.open { transform: none; opacity: 1; pointer-events: auto; }
        .l-bot-head { background: var(--g900); color: #fff; padding: 16px 18px; display: flex; align-items: center; gap: 10px; }
        .l-bot-body { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; background: var(--g50); max-height: 260px; }
        .l-bub { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.7; }
        .l-bub.bot { background: #fff; border: 1px solid var(--line); align-self: flex-start; }
        .l-bub.user { background: var(--g700); color: #fff; align-self: flex-end; }
        @media (max-width: 980px) {
          nav.l-links { display: none; }
          .l-prog-grid { grid-template-columns: 1fr; }
          .l-steps { grid-template-columns: repeat(2,1fr); }
          .l-pkg-grid { grid-template-columns: repeat(2,1fr); }
          .l-test-grid { grid-template-columns: 1fr; }
          .l-contact-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .l-steps, .l-pkg-grid { grid-template-columns: 1fr; }
          .l-bot { width: 88vw; right: 6vw; }
        }
      `}</style>

      {/* Top bar */}
      <div className="l-topbar">
        <div className="l-container">
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <a href={PHONE}>📞 01062510428</a>
            <a href={WA} target="_blank" rel="noopener">💬 واتساب</a>
            <a href={FB} target="_blank" rel="noopener">فيسبوك</a>
          </div>
          <button type="button" className="l-sound" onClick={toggleSound}>
            {soundOn ? '🔊 إيقاف الترتيل' : '🔇 تشغيل ترتيل الشيخ الحصري'}
          </button>
        </div>
      </div>

      {/* Nav */}
      <header className="l-nav">
        <div className="l-container">
          <div className="l-brand">
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#0B3D2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#E7F3EC', fontSize: 26, fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div>
              <b>موعظة ونور</b>
              <span>QURAN ACADEMY</span>
            </div>
          </div>
          <nav className="l-links">
            <a href="#programs">برامجنا</a>
            <a href="#steps">كيف نبدأ</a>
            <a href="#packages">الباقات</a>
            <a href="#recommendations">نقتبس منه</a>
            <a href="#contact">تواصل</a>
            <Link href="/portal">دخول النظام</Link>
          </nav>
          <a className="l-nav-cta" href={WA} target="_blank" rel="noopener">احجزي حلقة تجريبية</a>
        </div>
      </header>

      {/* Hero */}
      <section className="l-hero">
        <div className="l-container">
          <span className="l-eyebrow" style={{ background: 'rgba(255,255,255,.1)', color: '#CFE8DA', borderColor: 'rgba(255,255,255,.2)', marginBottom: 20 }}>
            حلقات تعليم القرآن عبر الأونلاين
          </span>
          <p className="ayah">«وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا»</p>
          <h1>رحلتك مع كتاب الله تبدأ من <span>بيتك</span></h1>
          <p className="lead">
            حلقات تحفيظ وتجويد أونلاين متخصصة <strong>للنساء والأطفال والرجال</strong>،
            بإشراف معلمات ومعلمين مؤهلين، ومتابعة فردية حتى يصل القرآن إليهم بإتقان.
          </p>
          <div className="l-cta-row">
            <a className="l-btn l-btn-primary" href={WA} target="_blank" rel="noopener">ابدئي حلقتك التجريبية الآن</a>
            <a className="l-btn l-btn-ghost" href="#packages">تعرّف على الباقات</a>
          </div>
          <div className="l-stats">
            <div className="stat">👩 حلقات للنساء</div>
            <div className="stat">🧒 حلقات للأطفال</div>
            <div className="stat">👨 حلقات للرجال</div>
            <div className="stat">⏰ مواعيد مرنة</div>
            <div className="stat">📜 شهادات إتمام</div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <div className="l-trust">
        <div className="l-container">
          <div className="item">🎓 معلمات ومعلمون متخصصون</div>
          <div className="item">📱 حلقات أونلاين من أي مكان</div>
          <div className="item">📈 تتبع مستمر للحفظ</div>
          <div className="item">💬 دعم مباشر عبر واتساب</div>
        </div>
      </div>

      {/* Programs */}
      <section className="l-sec" id="programs">
        <div className="l-container">
          <div className="l-sec-head">
            <span className="l-eyebrow">برامجنا</span>
            <h2>حلقات مصمَّمة لكل أفراد الأسرة</h2>
            <p>عناية خاصة في اختيار المعلمين والمنهج والمواعيد لكل فئة.</p>
          </div>
          <div className="l-prog-grid">
            {[
              { icon: '👩', title: 'حلقات النساء', desc: 'حلقات نسائية بالكامل بإشراف معلمات متخصصات في جو من الخصوصية.', points: ['معلمات نساء فقط', 'خطة حفظ تناسب ظروف كل سيدة', 'مواعيد مرنة مع المنزل والعمل'] },
              { icon: '🧒', title: 'حلقات الأطفال', desc: 'منهج محبّب يقوم على التحفيز حتى يصل الحفظ برغبة حقيقية.', points: ['أساليب تفاعلية حسب العمر', 'تقارير دورية لولي الأمر', 'شهادات تشجيعية عند إتمام كل جزء'] },
              { icon: '👨', title: 'حلقات الرجال', desc: 'من المبتدئين حتى إتمام القرآن، بإشراف معلمين متخصصين.', points: ['خطة واضحة من الصفر للإتمام', 'مواعيد مسائية تناسب العمل', 'تركيز على التجويد والتصحيح'] },
            ].map((p) => (
              <div key={p.title} className="l-prog-card">
                <div className="icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p style={{ color: '#4d6a5d', fontSize: 15 }}>{p.desc}</p>
                <ul>
                  {p.points.map((x) => <li key={x}>✦ {x}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="l-sec" id="steps" style={{ background: 'var(--g50)' }}>
        <div className="l-container">
          <div className="l-sec-head">
            <span className="l-eyebrow">الخطوات</span>
            <h2>كيف تبدأ رحلتك معنا؟</h2>
          </div>
          <div className="l-steps">
            {['تواصل واتساب', 'تحديد المستوى', 'حلقة تجريبية', 'اختيار الباقة', 'بدء الرحلة'].map((t, i) => (
              <div key={t} className="l-step">
                <div className="num">{i + 1}</div>
                <h4 style={{ fontSize: 15.5, marginBottom: 6 }}>{t}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="l-sec" id="packages">
        <div className="l-container">
          <div className="l-sec-head">
            <span className="l-eyebrow">الباقات</span>
            <h2>باقات تناسب وقتك وميزانيتك</h2>
            <p>أربع باقات شهرية — مدة الحلقة نصف ساعة أو ساعة حسب رغبتك.</p>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 40,
            background: 'var(--g900)', color: '#fff', fontFamily: 'Cairo, sans-serif', fontWeight: 700,
            borderRadius: 999, padding: '12px 26px', maxWidth: 'max-content', marginInline: 'auto', fontSize: 14.5,
          }}>★ 99% من طلابنا يختارون حلقات بمدة نصف ساعة</div>
          <div className="l-pkg-grid">
            {packages.map((p) => (
              <div key={p.title} className={`l-pkg${p.featured ? ' featured' : ''}`}>
                {p.featured && <span className="badge">الأكثر طلبًا</span>}
                <h3 style={{ fontSize: 18 }}>{p.title}</h3>
                <div className="price"><b>{p.price}</b> <span style={{ fontSize: 13, opacity: .8 }}>جنيه / شهريًا</span></div>
                <div style={{ height: 1, background: p.featured ? 'rgba(255,255,255,.25)' : 'var(--line)' }} />
                <p style={{ fontSize: 14, fontWeight: 700 }}>{p.sessions}</p>
                <p style={{ fontSize: 13.5, opacity: .85, flex: 1 }}>{p.note}</p>
                <a href={WA} target="_blank" rel="noopener" className="l-btn" style={{
                  justifyContent: 'center', width: '100%', fontSize: 14, padding: '12px 18px',
                  background: p.featured ? '#fff' : 'var(--g100)', color: 'var(--g900)',
                }}>اشتركي الآن</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="l-sec" style={{ background: 'var(--g50)' }}>
        <div className="l-container">
          <div className="l-sec-head">
            <span className="l-eyebrow">آراء طلابنا</span>
            <h2>بعض آراء طلابنا وأولياء أمورهم</h2>
          </div>
          <div className="l-test-grid">
            {[
              'أول مرة أحفظ مع حد ويوصّلني إنه فعلًا بيحب القرآن. المعلمة يارا ممتازة جدًا.',
              'الحلقة كانت ممتازة وفوق الوصف، ودي من أفضل حلقات التحفيظ اللي حضرتها أونلاين.',
              'حبيت الحلقة وارتحت معاها جدًا، وجزاها الله كل خير.',
              'المعلمة شرحها جميل جدًا، وأنا فرحان جدًا لكونها معلمتي. ربنا يبارك لها.',
            ].map((q, i) => (
              <div key={i} className="l-test">
                <div style={{ color: 'var(--g600)', marginBottom: 10 }}>★★★★★</div>
                <p style={{ fontSize: 15 }}>&ldquo;{q}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact — rendered after recommendations via page order: recommendations is sibling */}
      <section className="l-sec l-contact" id="contact">
        <div className="l-container">
          <div className="l-contact-grid">
            <div>
              <span className="l-eyebrow" style={{ background: 'rgba(255,255,255,.1)', color: '#CFE8DA', borderColor: 'rgba(255,255,255,.2)' }}>تواصل معنا</span>
              <h2 style={{ margin: '16px 0 12px', fontSize: 'clamp(26px,3vw,36px)' }}>جاهزون نستقبل أول حلقة لك</h2>
              <p style={{ color: 'var(--g100)', marginBottom: 24 }}>راسلينا على واتساب أو من خلال النموذج.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href={WA} target="_blank" rel="noopener" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: '16px 18px' }}>
                  <span>💬</span><div><b style={{ display: 'block', fontFamily: 'Cairo, sans-serif' }}>واتساب الأكاديمية</b><span style={{ fontSize: 12.5, color: 'var(--g100)' }}>+201095591415</span></div>
                </a>
                <a href={PHONE} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: '16px 18px' }}>
                  <span>📞</span><div><b style={{ display: 'block', fontFamily: 'Cairo, sans-serif' }}>اتصال مباشر</b><span style={{ fontSize: 12.5, color: 'var(--g100)' }}>01062510428</span></div>
                </a>
              </div>
            </div>
            <div className="l-contact-card">
              <h3 style={{ marginBottom: 6, fontSize: 19 }}>اطلبي تواصلًا سريعًا</h3>
              <p style={{ fontSize: 13.5, color: '#587365', marginBottom: 16 }}>اكتبي بياناتك وسنرسل تفاصيل الباقات.</p>
              <form onSubmit={handleContact}>
                <input name="name" placeholder="الاسم" required />
                <input name="phone" type="tel" placeholder="رقم الواتساب" required />
                <select name="type">
                  <option>حلقات النساء</option>
                  <option>حلقات الأطفال</option>
                  <option>حلقات الرجال</option>
                </select>
                <button type="submit" className="l-btn" style={{ width: '100%', justifyContent: 'center', background: 'var(--g700)', color: '#fff', marginTop: 4 }}>
                  إرسال عبر واتساب
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="l-foot">
        <div className="l-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <b style={{ fontFamily: 'Cairo, sans-serif', color: '#fff', fontSize: 17 }}>موعظة ونور</b>
            <p style={{ fontSize: 13, color: 'var(--g200)', marginTop: 6 }}>حلقات تعليم القرآن أونلاين للنساء والأطفال والرجال</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13.5 }}>
            <a href="#packages">الباقات</a>
            <a href="#recommendations">نقتبس منه</a>
            <Link href="/portal">دخول النظام</Link>
            <a href={WA} target="_blank" rel="noopener">واتساب</a>
          </div>
        </div>
        <div className="l-container" style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.1)', fontSize: 12.5, color: 'var(--g200)' }}>
          © موعظة ونور — جميع الحقوق محفوظة
        </div>
      </footer>

      {/* FABs */}
      <a className="l-fab l-fab-wa" href={WA} target="_blank" rel="noopener" aria-label="واتساب">💬</a>
      <button type="button" className="l-fab l-fab-bot" onClick={() => setBotOpen(true)} aria-label="مساعد">💭</button>

      {/* Chatbot */}
      <div className={`l-bot${botOpen ? ' open' : ''}`}>
        <div className="l-bot-head">
          <div style={{ flex: 1 }}>
            <b style={{ fontFamily: 'Cairo, sans-serif', fontSize: 14.5, display: 'block' }}>مساعد موعظة ونور</b>
            <span style={{ fontSize: 11.5, color: 'var(--g200)' }}>أسئلة سريعة عن الباقات والتسجيل</span>
          </div>
          <button type="button" onClick={() => setBotOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div className="l-bot-body" ref={bodyRef}>
          {botMsgs.map((m, i) => (
            <div key={i} className={`l-bub ${m.who}`}>{m.text}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 16px 12px', background: 'var(--g50)' }}>
          {['الباقات والأسعار', 'رقم التواصل', 'حلقات الأطفال', 'طريقة التسجيل'].map((q) => (
            <button key={q} type="button" onClick={() => respond(q)} style={{
              fontSize: 12, background: '#fff', border: '1px solid var(--g200)', color: 'var(--g700)',
              padding: '7px 12px', borderRadius: 999, fontFamily: 'Cairo, sans-serif', fontWeight: 600, cursor: 'pointer',
            }}>{q}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--line)', background: '#fff' }}>
          <input
            value={botInput}
            onChange={(e) => setBotInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { respond(botInput); setBotInput('') } }}
            placeholder="اكتبي سؤالك..."
            style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 999, padding: '10px 16px', fontSize: 13 }}
          />
          <button type="button" onClick={() => { respond(botInput); setBotInput('') }} style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--g700)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>↑</button>
        </div>
      </div>
    </div>
  )
}
