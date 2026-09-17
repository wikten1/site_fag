'use strict';
// Add a template in src/pages and register its public route here.
module.exports = [
  {
    route: 'conteudo-online.html', template: 'conteudo-online.html', active: 'online', footer: 'editorial',
    title: 'Conteúdo Online — FAG',
    description: 'Biblioteca Digital, Plataforma EAD e recursos de apoio à aprendizagem. Conheça os caminhos para estudar, pesquisar e ampliar seu conhecimento com a FAG.',
    styles: ['components/header', 'pages/editorial', 'pages/online'],
    scripts: ['components/header', 'pages/online']
  },
  {
    route: 'index.html', template: 'index.html', active: 'home', footer: 'institutional',
    title: 'FAG — Educação que conecta oportunidades',
    description: 'Conheça a FAG: educação profissional e tecnológica, amparo à pesquisa, políticas sociais e desenvolvimento socioeconômico em Tanguá.',
    styles: ['components/header', 'components/indicator', 'pages/home', 'components/institutional', 'components/courses', 'components/programs', 'components/news', 'components/attendance', 'components/quick-access', 'components/footer'],
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
    route: 'programas-e-projetos.html', template: 'programas-e-projetos.html', active: 'programs', footer: 'editorial',
    title: 'Programas e Projetos — FAG',
    description: 'Conheça os programas e projetos da FAG: iniciativas de educação profissional, inclusão e desenvolvimento social, com destaque para o Mulheres Mil.',
    image: 'assets/images/programs/mulheres-mil-1200.webp',
    styles: ['components/header', 'pages/editorial', 'components/programs', 'pages/programs'],
    scripts: ['components/header', 'pages/programs']
  },
  {
    route: 'inscricoes-e-selecoes.html', template: 'inscricoes-e-selecoes.html', active: 'opportunities', footer: 'editorial',
    title: 'Inscrições e Seleções — FAG',
    description: 'Acompanhe inscrições, processos seletivos, prazos, documentos e resultados da FAG. Consulte oportunidades e orientações para participar.',
    styles: ['components/header', 'pages/editorial', 'pages/opportunities'],
    scripts: ['components/header', 'shared/opportunities-model', 'pages/opportunities']
  },
  {
    route: 'cursos.html', template: 'cursos.html', header: 'catalog', footer: 'editorial',
    title: 'Cursos e oportunidades — FAG',
    description: 'Conheça os cursos técnicos e a formação complementar da FAG, em Tanguá.',
    styles: ['components/courses', 'pages/catalog'], scripts: ['components/courses', 'pages/catalog']
  },
  {
    route: 'contato.html', template: 'contato.html', footer: 'contact',
    title: 'Contato e Atendimento — FAG',
    description: 'Entre em contato com a FAG. Encontre a localização da Fundação em Tanguá e encaminhe dúvidas sobre cursos, serviços e informações institucionais.',
    styles: ['components/header', 'pages/contact'], scripts: ['components/header', 'pages/contact']
  }
];
