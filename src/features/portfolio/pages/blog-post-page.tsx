import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { PageShell } from '../components/page-shell';
import { Container } from '../components/container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { HoverLink } from '@/ui/hover-link';
import { Markdown } from '@/ui/markdown';
import { PostFeedback } from '../sections/blog/post-feedback';
import { TagChips } from '@/ui/tag-chips';
import type { PublishedPost } from '@/content/posts-types';

export function BlogPostPage({ post }: { post: PublishedPost }) {
  const { locale } = useI18n();
  const t = locale === 'es' ? post.es : post.en;
  const back = locale === 'es' ? '← Volver al blog' : '← Back to blog';

  return (
    <PageShell>
      <Container style={{ paddingVertical: 56, maxWidth: 800 }}>
        <View style={{ gap: 16 }}>
          <View style={{ alignSelf: 'flex-start' }}>
            <HoverLink label={back} onPress={() => router.push('/blog' as never)} color={colors.textFaint} hoverColor={colors.accent} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.accent }}>{post.publishedAt}</Text>
            <TagChips tags={post.tags} />
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.5, color: colors.text }}>{t.title}</Text>
          <Markdown source={t.content} />
          <PostFeedback slug={post.slug} />
          <View style={{ marginTop: 24, alignSelf: 'flex-start' }}>
            <HoverLink label={back} onPress={() => router.push('/blog' as never)} color={colors.textFaint} hoverColor={colors.accent} />
          </View>
        </View>
      </Container>
    </PageShell>
  );
}
