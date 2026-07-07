import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';

type FeedbackComment = { id: string; name: string; message: string; createdAt: string };
type FeedbackData = { rating: { avg: number; count: number }; comments: FeedbackComment[] };

const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

const T = {
  es: { ratingTitle: '¿Te sirvió este artículo?', votes: 'votos', thanks: 'Gracias', comments: 'Comentarios', empty: 'Sé el primero en comentar.', name: 'Tu nombre', message: 'Tu comentario…', send: 'Comentar', pending: 'Gracias — tu comentario aparecerá cuando sea aprobado.', error: 'No se pudo enviar. Intenta de nuevo.', tooMany: 'Demasiados comentarios por hoy.' },
  en: { ratingTitle: 'Was this article useful?', votes: 'votes', thanks: 'Thanks', comments: 'Comments', empty: 'Be the first to comment.', name: 'Your name', message: 'Your comment…', send: 'Comment', pending: 'Thanks — your comment will appear once approved.', error: 'Could not send. Try again.', tooMany: 'Too many comments for today.' },
} as const;

/** Live ratings + moderated comments under each blog post (via /api/feedback). */
export function PostFeedback({ slug }: { slug: string }) {
  const { locale } = useI18n();
  const t = T[locale];
  const [data, setData] = useState<FeedbackData>({ rating: { avg: 0, count: 0 }, comments: [] });
  const [myVote, setMyVote] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`rated:${slug}`);
      if (stored) setMyVote(Number(stored));
    }
    fetch(`/api/feedback?slug=${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setData(d as FeedbackData);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  const rate = async (stars: number) => {
    if (myVote) return;
    setMyVote(stars);
    if (typeof localStorage !== 'undefined') localStorage.setItem(`rated:${slug}`, String(stars));
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'rating', slug, stars }) });
      if (res.ok) {
        const d = (await res.json()) as { rating: FeedbackData['rating'] };
        setData((prev) => ({ ...prev, rating: d.rating }));
      }
    } catch {
      // el voto local se conserva; el agregado se verá en la próxima visita
    }
  };

  const submit = async () => {
    if (!name.trim() || !message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'comment', slug, name: name.trim(), message: message.trim() }) });
      if (res.status === 429) {
        setError(t.tooMany);
        return;
      }
      if (!res.ok) throw new Error('bad_status');
      setSent(true);
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 11, color: colors.text, fontSize: 14 } as const;

  return (
    <View style={{ gap: 20, marginTop: 32 }}>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>{t.ratingTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => {
              const filled = myVote ? s <= myVote : s <= hoverStar;
              return (
                <Pressable key={s} onPress={() => rate(s)} onHoverIn={() => setHoverStar(s)} onHoverOut={() => setHoverStar(0)} style={webCursor as object}>
                  <Text style={{ fontSize: 24, color: filled ? colors.accent : colors.textFaint }}>{filled ? '★' : '☆'}</Text>
                </Pressable>
              );
            })}
          </View>
          {data.rating.count > 0 ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.textMuted }}>
              {myVote ? `${t.thanks} · ` : ''}⭐ {data.rating.avg} · {data.rating.count} {t.votes}
            </Text>
          ) : myVote ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.textMuted }}>{t.thanks} ⭐</Text>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>
          {t.comments} ({data.comments.length})
        </Text>
        {data.comments.length === 0 ? <Text style={{ fontSize: 13.5, color: colors.textDim }}>{t.empty}</Text> : null}
        {data.comments.map((c) => (
          <View key={c.id} style={{ gap: 6, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 14.5, color: colors.text }}>{c.name}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{c.createdAt}</Text>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textMuted }}>{c.message}</Text>
          </View>
        ))}
        {sent ? (
          <Text style={{ fontSize: 13.5, color: colors.accent }}>{t.pending}</Text>
        ) : (
          <View style={{ gap: 10 }}>
            <TextInput value={name} onChangeText={setName} placeholder={t.name} placeholderTextColor={colors.textFaint} style={inputStyle} />
            <TextInput value={message} onChangeText={setMessage} placeholder={t.message} placeholderTextColor={colors.textFaint} multiline style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <AppButton label={t.send} onPress={submit} variant="primary" />
              {error ? <Text style={{ fontSize: 12.5, color: '#ff8a8a' }}>{error}</Text> : null}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
