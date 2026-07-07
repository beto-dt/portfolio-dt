import type { ReactNode } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

const linkWeb = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

// Inline tokens: **bold**, *italic*, `code`, [text](url)
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <Text key={key} style={{ fontFamily: fonts.bodyMedium, color: colors.text }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <Text key={key} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <Text key={key} style={{ fontFamily: fonts.mono, fontSize: 13.5, color: colors.text, backgroundColor: colors.surfaceStrong, borderRadius: 4, paddingHorizontal: 5 }}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (link) {
        const url = link[2];
        return (
          <Text key={key} style={[{ color: colors.accent }, linkWeb as object]} onPress={() => Linking.openURL(url)}>
            {link[1]}
          </Text>
        );
      }
      return <Text key={key}>{part}</Text>;
    });
}

const P_STYLE = { fontSize: 15, lineHeight: 26, color: colors.textMuted } as const;
const BLOCK_START = /^(#{1,3})\s|^\s*[-*]\s|^\s*\d+\.\s|^>\s|^```/;

/** Minimal markdown → RN renderer: headings, lists, quotes, code, inline styles. */
export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  let key = 0;
  const push = (node: ReactNode) => {
    blocks.push(
      <View key={key++} style={{ marginTop: blocks.length ? 14 : 0 }}>
        {node}
      </View>,
    );
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.trim().startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      push(
        <ScrollView
          horizontal
          style={{ backgroundColor: colors.surfaceCell, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md }}
          contentContainerStyle={{ padding: 14 }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 13, lineHeight: 20, color: colors.text }}>{buf.join('\n')}</Text>
        </ScrollView>,
      );
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line.trim());
    if (h) {
      const size = h[1].length === 1 ? 28 : h[1].length === 2 ? 22 : 18;
      push(
        <Text style={{ fontFamily: fonts.display, fontSize: size, color: colors.text, marginTop: 10 }}>
          {renderInline(h[2], `h${key}`)}
        </Text>,
      );
      i++;
      continue;
    }
    if (line.trim().startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        buf.push(lines[i].trim().slice(2));
        i++;
      }
      push(
        <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 14 }}>
          <Text style={[P_STYLE, { fontStyle: 'italic' }]}>{renderInline(buf.join(' '), `q${key}`)}</Text>
        </View>,
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const items: { marker: string; text: string }[] = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        const ordered = /^\s*(\d+)\.\s+(.*)$/.exec(lines[i]);
        if (ordered) items.push({ marker: `${ordered[1]}.`, text: ordered[2] });
        else items.push({ marker: '•', text: lines[i].replace(/^\s*[-*]\s+/, '') });
        i++;
      }
      push(
        <View style={{ gap: 8 }}>
          {items.map((it, j) => (
            <View key={j} style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={{ color: colors.accent, fontSize: 15, lineHeight: 26 }}>{it.marker}</Text>
              <Text style={[P_STYLE, { flex: 1 }]}>{renderInline(it.text, `li${key}-${j}`)}</Text>
            </View>
          ))}
        </View>,
      );
      continue;
    }
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i].trim())) {
      buf.push(lines[i]);
      i++;
    }
    push(<Text style={P_STYLE}>{renderInline(buf.join(' '), `p${key}`)}</Text>);
  }

  return <View>{blocks}</View>;
}
