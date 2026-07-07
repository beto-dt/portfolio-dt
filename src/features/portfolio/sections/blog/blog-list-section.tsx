import { Text, View } from 'react-native';
import { router } from 'expo-router';
import postsJson from '@/content/published/posts.json';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { ArrowLink } from '@/ui/arrow-link';
import { GlowCard } from '@/ui/glow-card';
import { TagChips } from '@/ui/tag-chips';
import { Reveal } from '@/ui/reveal';
import type { PublishedPost } from '@/content/posts-types';

const posts = postsJson as PublishedPost[];


function PostCard({ post, locale, readCta }: { post: PublishedPost; locale: 'es' | 'en'; readCta: string }) {
  const t = locale === 'es' ? post.es : post.en;
  const open = () => router.push(`/blog/${post.slug}` as never);
  return (
    <GlowCard style={{ width: '100%', flexGrow: 1, padding: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg }}>
      {() => (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>{post.publishedAt}</Text>
            <TagChips tags={post.tags} />
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.2, color: colors.text, marginBottom: 9 }}>{t.title}</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>{t.excerpt}</Text>
          <View style={{ marginTop: 'auto', paddingTop: 18 }}>
            <ArrowLink label={readCta} onPress={open} />
          </View>
        </>
      )}
    </GlowCard>
  );
}

export function BlogListSection() {
  const { locale } = useI18n();
  const heading = locale === 'es' ? 'Ideas y notas de ingeniería' : 'Engineering notes & ideas';
  const empty = locale === 'es' ? 'Pronto — estoy escribiendo los primeros posts.' : "Soon — I'm writing the first posts.";
  const readCta = locale === 'es' ? 'Leer' : 'Read';

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="blog">
      <Reveal delay={0}>
        <SectionHeading kicker="blog" heading={heading} />
      </Reveal>
      {posts.length === 0 ? (
        <Text style={{ fontSize: 14.5, color: colors.textDim }}>{empty}</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={70 + i * 70} style={{ flexGrow: 1, flexBasis: 340, maxWidth: 620 }}>
              <PostCard post={post} locale={locale} readCta={readCta} />
            </Reveal>
          ))}
        </View>
      )}
    </Container>
  );
}
