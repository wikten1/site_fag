'use strict';
// Add a template in src/pages and register its public route here.
module.exports = [
  {
    route: 'index.html', template: 'index.html', active: 'home', footer: 'institutional',
    title: 'FAG — Educação que conecta oportunidades',
    description: 'Conheça a FAG: educação profissional e tecnológica, amparo à pesquisa, políticas sociais e desenvolvimento socioeconômico em Tanguá.',
    styles: ['components/header', 'pages/home', 'components/institutional', 'components/courses', 'components/programs', 'components/news', 'components/attendance', 'components/quick-access', 'components/footer'],
    scripts: ['components/header', 'pages/home', 'components/footer', 'components/institutional', 'components/attendance', 'components/courses', 'shared/news-model', 'data/news', 'components/news-interactions', 'pages/news', 'components/quick-access'],
    extra: '<link rel="preload" href="assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>'
  },
  {
    route: 'sobre.html', template: 'sobre.html', active: 'about', footer: 'editorial',
    title: 'Sobre a FAG — Educação, conhecimento e desenvolvimento',
    description: 'Conheça a FAG, Fundação de Educação Profissional e Tecnológica, Amparo à Pesquisa, Políticas Sociais e Desenvolvimento Socioeconômico de Tanguá.',
    image: 'assets/images/institutional/sobre-fag.png',
    styles: ['components/header', 'pages/about'],
    scripts: ['components/header', 'pages/about']
  },
  {
    route: 'parcerias.html', template: 'parcerias.html', active: 'partners', footer: 'editorial',
    title: 'Parcerias — FAG',
    description: 'Conheça as instituições parceiras da FAG: uma rede de colaboração pela educação, ciência, tecnologia e desenvolvimento social em Tanguá.',
    styles: ['components/header', 'pages/partners'],
    scripts: ['components/header', 'pages/partners']
  },
  {
    route: 'cursos.html', template: 'cursos.html', header: 'catalog',
    title: 'Cursos e oportunidades — FAG',
    description: 'Conheça os cursos técnicos e a formação complementar da FAG, em Tanguá.',
    styles: ['pages/catalog', 'components/courses'], scripts: []
  },
  {
    route: 'contato.html', template: 'contato.html', footer: 'contact',
    title: 'Contato e Atendimento — FAG',
    description: 'Entre em contato com a FAG. Encontre a localização da Fundação em Tanguá e encaminhe dúvidas sobre cursos, serviços e informações institucionais.',
    styles: ['components/header', 'pages/contact'], scripts: ['components/header', 'pages/contact']
  }
];
