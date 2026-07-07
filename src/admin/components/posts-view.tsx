import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';
import { Field, Label } from './field';
import { StringListEditor } from './string-list-editor';
import { AccentButton, ViewHeader } from './admin-shell';
import { listPosts, savePost, deletePost, type BlogPost } from '../posts-repo';

const EMPTY: BlogPost = { slug: '', status: 'draft', publishedAt: '', tags: [], es: { title: '', excerpt: '', content: '' }, en: { title: '', excerpt: '', content: '' } };

function slugify(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PostsView() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reload = () => {
    setPosts(null);
    listPosts()
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reload, []);

  if (editing) {
    const set = (patch: Partial<BlogPost>) => setEditing({ ...editing, ...patch });
    const onSave = async () => {
      if (!editing.slug.trim() || !editing.es.title.trim()) {
        setStatus('Error: slug y título ES son obligatorios');
        return;
      }
      setStatus('Guardando…');
      try {
        await savePost({ ...editing, slug: editing.slug.trim(), publishedAt: editing.publishedAt || today() });
        setStatus(null);
        setEditing(null);
        reload();
      } catch (e) {
        setStatus(e instanceof Error ? `Error: ${e.message}` : 'Error al guardar');
      }
    };
    return (
      <View style={{ gap: 16 }}>
        <View style={{ alignSelf: 'flex-start' }}>
          <HoverLink label="← Volver" onPress={() => { setEditing(null); setStatus(null); }} color={colors.textFaint} hoverColor={colors.text} />
        </View>
        <ViewHeader title={isNew ? 'Nuevo post' : `Editar · ${editing.slug}`} subtitle="Guarda y luego usa Publicar para verlo en vivo." />
        <Field label="es.title" value={editing.es.title} onChangeText={(t) => setEditing({ ...editing, es: { ...editing.es, title: t }, slug: isNew && !slugTouched ? slugify(t) : editing.slug })} />
        <Field label="slug" value={editing.slug} onChangeText={(t) => { setSlugTouched(true); set({ slug: slugify(t) }); }} />
        <Field label="publishedAt (YYYY-MM-DD)" value={editing.publishedAt} onChangeText={(t) => set({ publishedAt: t })} />
        <StringListEditor label="tags" items={editing.tags} onChange={(tags) => set({ tags })} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Borrador" active={editing.status === 'draft'} onPress={() => set({ status: 'draft' })} />
          <Chip label="Publicado" active={editing.status === 'published'} onPress={() => set({ status: 'published' })} />
        </View>
        <Label>español</Label>
        <Field label="es.excerpt" value={editing.es.excerpt} onChangeText={(t) => set({ es: { ...editing.es, excerpt: t } })} multiline />
        <Field label="es.content (markdown)" value={editing.es.content} onChangeText={(t) => set({ es: { ...editing.es, content: t } })} multiline />
        <Label>english</Label>
        <Field label="en.title" value={editing.en.title} onChangeText={(t) => set({ en: { ...editing.en, title: t } })} />
        <Field label="en.excerpt" value={editing.en.excerpt} onChangeText={(t) => set({ en: { ...editing.en, excerpt: t } })} multiline />
        <Field label="en.content (markdown)" value={editing.en.content} onChangeText={(t) => set({ en: { ...editing.en, content: t } })} multiline />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <AccentButton label="💾 Guardar" onPress={onSave} />
          {status ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: status.startsWith('Error') ? '#ff6b6b' : colors.accent }}>{status}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <ViewHeader title="Blog" subtitle={posts ? `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}` : '…'} />
        <AccentButton label="+ Nuevo post" onPress={() => { setEditing({ ...EMPTY, publishedAt: today() }); setIsNew(true); setSlugTouched(false); setStatus(null); }} />
      </View>
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
      {!posts ? (
        <ActivityIndicator color={colors.accent} />
      ) : posts.length === 0 ? (
        <Text style={{ color: colors.textDim, fontSize: 13.5 }}>Sin posts todavía — crea el primero.</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {posts.map((p) => (
            <View key={p.slug} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface }}>
              <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: p.status === 'published' ? 'rgba(228,227,87,0.15)' : colors.surfaceStrong }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: p.status === 'published' ? colors.accent : colors.textDim }}>
                  {p.status === 'published' ? 'PUBLICADO' : 'BORRADOR'}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.text }}>{p.es.title}</Text>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{p.publishedAt} · {p.slug}</Text>
              </View>
              <Chip label="Editar" active={false} onPress={() => { setEditing(p); setIsNew(false); setSlugTouched(true); setConfirmDelete(null); setStatus(null); }} />
              <HoverLink
                label={confirmDelete === p.slug ? '¿Seguro?' : 'Eliminar'}
                onPress={async () => {
                  if (confirmDelete !== p.slug) {
                    setConfirmDelete(p.slug);
                    return;
                  }
                  try {
                    await deletePost(p.slug);
                    setConfirmDelete(null);
                    reload();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e));
                  }
                }}
                color={confirmDelete === p.slug ? '#ff6b6b' : colors.textFaint}
                hoverColor="#ff6b6b"
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
