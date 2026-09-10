"""One-time migration of reviewed journalistic WordPress records.
Usage: python scripts/migrate-news.py PATH_TO_WORDPRESS_EXPORT
Requires Pillow; downloads only media explicitly attached to the reviewed posts.
Do not run over a subsequently edited editorial catalog without reviewing changes.
"""
import html
import json
import re
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'assets/images/noticias'
# Topic associations are factual relationships, not invented public categories.
REVIEWED = {
    764: ('cooperacao-mast', 'science', ['ciencia', 'cooperacao']),
    732: ('forum-inovacao-agricola', 'science', ['ciencia', 'cooperacao']),
    725: ('inovacao-desenvolvimento-local', 'community', ['ciencia', 'cooperacao']),
    716: ('acesso-e-oportunidade', 'education', ['educacao', 'pre-vestibular']),
    710: ('impacto-pre-vestibular-social', 'education', ['educacao', 'pre-vestibular']),
    682: ('lancamento-mulheres-mil', 'community', ['educacao', 'formacao-profissional']),
    554: ('cooperacao-fag-iff', 'science', ['ciencia', 'cooperacao']),
    512: ('novas-instalacoes-faetec', 'education', ['educacao', 'formacao-profissional']),
    475: ('capacitacao-servidores', 'education', ['educacao', 'formacao-profissional'])
}


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.images = []
        self.active = None
        self.link = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ['p', 'h2', 'h3', 'li', 'blockquote']:
            self.flush()
            self.active = {'type': tag, 'runs': []}
        elif tag == 'a':
            if self.active is None:
                self.active = {'type': 'p', 'runs': []}
            self.link = attrs.get('href')
        elif tag == 'br' and self.active:
            self.active['runs'].append({'text': '\n'})
        elif tag == 'img':
            self.images.append(attrs['src'])
        elif tag == 'video' and attrs.get('src'):
            self.flush()
            self.blocks.append({'type': 'p', 'runs': [{'text': 'Assistir ao depoimento em vídeo', 'href': attrs['src']}]})

    def handle_data(self, text):
        if self.active:
            run = {'text': text}
            if self.link:
                run['href'] = self.link
            self.active['runs'].append(run)

    def handle_endtag(self, tag):
        if tag == 'a':
            self.link = None
        elif tag in ['p', 'h2', 'h3', 'li', 'blockquote']:
            self.flush()

    def flush(self):
        if self.active and ''.join(r['text'] for r in self.active['runs']).strip():
            self.blocks.append(self.active)
        self.active = None


def download(url, name):
    # Source URLs come exclusively from the downloaded public WordPress export.
    if not url.startswith('https://fag.tangua.rj.gov.br/wp-content/uploads/'):
        raise ValueError('Unexpected media host')
    with tempfile.TemporaryDirectory(prefix='fag-media-') as folder:
        source = Path(folder) / 'original'
        subprocess.run(['curl.exe', '-sS', '-L', '--fail', '--max-time', '45', url, '-o', str(source)], check=True)
        with Image.open(source) as raw:
            image = raw.convert('RGB')
            width, height = image.size
            sources = []
            for size in sorted(set([min(400, width), min(800, width), min(1200, width)])):
                copy = image.copy()
                copy.thumbnail((size, round(size * height / width)))
                filename = f'{name}-{size}.webp'
                copy.save(MEDIA / filename, 'WEBP', quality=83, method=6)
                sources.append({'src': f'assets/images/noticias/{filename}', 'width': copy.width})
            # A thumbnail for visual review only; never used as editorial content.
            preview = image.copy()
            preview.thumbnail((500, 320))
            preview.save(MEDIA / f'review-{name}.jpg')
            return {'src': sources[min(1, len(sources) - 1)]['src'], 'sources': sources,
                    'width': width, 'height': height, 'kind': 'event', 'alt': '',
                    'caption': '', 'credit': '', 'sourceUrl': url}


posts = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
records = []
jobs = []
for post in posts:
    if post['id'] not in REVIEWED:
        continue
    key, fallback, topics = REVIEWED[post['id']]
    parser = Parser()
    parser.feed(post['content']['rendered'])
    parser.flush()
    # Promote the original forum subheadings without rewriting their wording.
    if post['id'] == 732:
        blocks = []
        for block in parser.blocks:
            text = ''.join(r['text'] for r in block['runs'])
            if text.startswith(('Abertura com Lideranças', 'Parcerias que fortalecem', 'Um Legado para')):
                heading, rest = text.split('\n', 1)
                blocks.extend([{'type': 'h2', 'runs': [{'text': heading}]}, {'type': 'p', 'runs': [{'text': rest}]}])
            else:
                blocks.append(block)
        parser.blocks = blocks
    first = next(''.join(r['text'] for r in b['runs']) for b in parser.blocks if b['type'] == 'p')
    # Verbatim preview excerpt, not a newly invented headline or event description.
    excerpt = re.sub(r'\s+', ' ', first).strip()
    if len(excerpt) > 220:
        excerpt = excerpt[:220].rsplit(' ', 1)[0] + '…'
    record = {'id': key, 'slug': post['slug'], 'type': 'news', 'status': 'published',
              'featured': post['id'] == 732, 'publishedAt': post['date'][:10],
              'category': 'Notícias', 'title': html.unescape(post['title']['rendered']),
              'excerpt': excerpt, 'sourceUrl': post['link'], 'sourceId': post['id'],
              'fallback': fallback, 'topics': topics, 'image': None, 'gallery': [], 'blocks': parser.blocks}
    media = post.get('_embedded', {}).get('wp:featuredmedia', [])
    # The forum gallery provides an authentic photograph instead of a title banner.
    urls = parser.images if post['id'] == 732 else ([media[0]['source_url']] if media else []) + parser.images
    for i, url in enumerate(dict.fromkeys(urls)):
        jobs.append((record, i, url, f'migrada-{post["id"]}-{i}'))
    records.append(record)

with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [(record, index, pool.submit(download, url, name)) for record, index, url, name in jobs]
    for record, index, future in futures:
        result = future.result()
        if index == 0:
            record['image'] = result
        else:
            record['gallery'].append(result)

review = json.loads((ROOT / 'scripts/news-photo-review.json').read_text(encoding='utf-8'))
for record in records:
    approval = review[str(record['sourceId'])]
    if approval is None:
        record['image'] = None
        record['gallery'] = []
    elif isinstance(approval, list):
        for image, description in zip([record['image']] + record['gallery'], approval):
            image['alt'] = image['caption'] = description
    else:
        record['image'].update(approval)
        record['image']['caption'] = 'Registro da entrevista.' if record['sourceId'] == 725 else 'Registro institucional publicado com a matéria.'
        record['gallery'] = []
    first = next((''.join(r['text'] for r in b['runs']) for b in record['blocks'] if b['type'] == 'p' and len(''.join(r['text'] for r in b['runs'])) > 60), record['excerpt'])
    first = ' '.join(first.split())
    record['excerpt'] = first if len(first) <= 220 else first[:220].rsplit(' ', 1)[0] + '…'
(ROOT / 'content').mkdir(exist_ok=True)
(ROOT / 'content/news.json').write_text(json.dumps({'items': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Migrated {len(records)} articles and {len(jobs)} media assets. Review photographs and alt text before building.')
