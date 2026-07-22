import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Seo, { SITE_URL } from '@/components/shared/Seo';
import { useLanguage } from '@/components/shared/LanguageContext';
import { getGuideBySlug, guidesData } from '@/components/shared/guidesData';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';

const markdownComponents = {
  h2: ({ node, ...props }) => <h2 className="text-xl md:text-2xl font-semibold text-white mt-10 mb-3 first:mt-0" {...props} />,
  p: ({ node, ...props }) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
  a: ({ node, ...props }) => <a className="text-sky-400 hover:text-sky-300 underline underline-offset-2" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1.5 text-slate-300 mb-4" {...props} />,
  li: ({ node, ...props }) => <li {...props} />,
};

export default function GuideDetail() {
  const { slug } = useParams();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#060D1F] flex flex-col">
        <Seo title={isRTL ? 'المقال غير موجود | رواج كارد' : 'Guide Not Found | Rawajcard'} path={`/guides/${slug}`} noindex />
        <Navbar />
        <div className="public-subpage-offset flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-xl text-slate-300">{isRTL ? 'المقال غير موجود' : 'Guide not found'}</p>
          <Button onClick={() => navigate('/guides')} variant="outline">
            {isRTL ? 'العودة للدليل' : 'Back to guides'}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const title = isRTL ? guide.title_ar : guide.title_en;
  const excerpt = isRTL ? guide.excerpt_ar : guide.excerpt_en;
  const content = isRTL ? guide.content_ar : guide.content_en;
  const related = guidesData.filter((g) => g.slug !== guide.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#060D1F]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Seo
        title={`${title} | Rawajcard`}
        description={excerpt}
        path={`/guides/${guide.slug}`}
        type="article"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: excerpt,
            datePublished: guide.date,
            author: { '@type': 'Organization', name: 'Rawajcard' },
            publisher: { '@type': 'Organization', name: 'Rawajcard' },
            mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
              { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}/guides/${guide.slug}` },
            ],
          },
        ]}
      />
      <Navbar />

      <div className="public-subpage-offset pb-10 px-4">
        <div className="max-w-3xl mx-auto">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 mb-8">
            <Link to="/" className="hover:text-sky-400 transition-colors">{isRTL ? 'الرئيسية' : 'Home'}</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link to="/guides" className="hover:text-sky-400 transition-colors">{isRTL ? 'الدليل' : 'Guides'}</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-white font-medium line-clamp-1">{title}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            {isRTL ? 'دليل' : 'Guide'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">{title}</h1>
          <p className="text-slate-400 text-lg mb-2">{excerpt}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 md:p-9">
          <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-24">
          <h2 className="text-lg font-semibold text-white mb-4">{isRTL ? 'مقالات أخرى' : 'More guides'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((g) => (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-sky-500/30 transition-colors"
              >
                <h3 className="text-white font-semibold mb-1.5">{isRTL ? g.title_ar : g.title_en}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{isRTL ? g.excerpt_ar : g.excerpt_en}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
