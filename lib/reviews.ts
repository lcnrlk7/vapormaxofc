// Avaliações geradas de forma determinística a partir do ID do produto.
// Mesmo produto = sempre as mesmas avaliações (não muda a cada carregamento).
// Sem nomes: apenas estrelas + texto. Textos realistas, com alguns erros de ortografia.

export type Review = {
  stars: number
  text: string
  daysAgo: number
}

export type ProductRating = {
  average: number // ex.: 4.7
  count: number // total de avaliações
  reviews: Review[] // amostra exibida
}

// Pool de textos reais (com pequenos erros propositais), variando o tom.
const REVIEW_POOL: { text: string; stars: number }[] = [
  { text: "produto otimo chegou rapido recomendo dms", stars: 5 },
  { text: "muito bom o sabor, durou bastante mesmo vou comprar denovo", stars: 5 },
  { text: "amei demais!! veio certinho e o gosto e mt bom", stars: 5 },
  { text: "entrega foi rapida e o pod ta funcionando perfeito", stars: 5 },
  { text: "esse aqui e o melhor que ja usei, sabor top", stars: 5 },
  { text: "comprei meio na duvida mas superou minha expectativa, recomendo", stars: 5 },
  { text: "chegou rapidinho e bem embalado, nota 10 pra loja", stars: 5 },
  { text: "o sabor e otimo mas a bateria podia durar um pouquinho mais", stars: 4 },
  { text: "ja e a terceira vez que compro aqui, nunca decepciona", stars: 5 },
  { text: "muito satisfeito, atendimento nota mil pelo zap", stars: 5 },
  { text: "veio tudo certo, so demorou um pouco a entrega mas valeu", stars: 4 },
  { text: "sabor maravilhoso da pra sentir bem a fruta, recomendo", stars: 5 },
  { text: "produto original igual da foto, amei mesmo", stars: 5 },
  { text: "melhor loja de vape da regiao sem duvida nenhuma", stars: 5 },
  { text: "comprei pra um amigo e ele adorou, qualidade boa", stars: 5 },
  { text: "a puxada e muito boa e o sabor nao enjoa", stars: 5 },
  { text: "recomendo dms ja indiquei pros meus amigos tudo", stars: 5 },
  { text: "valeu cada centavo, sabor incrivel de verdade", stars: 5 },
  { text: "chegou no precinho e funcionando, top dms", stars: 5 },
  { text: "bom mas esperava que rendesse um pouco mais de puff", stars: 4 },
  { text: "perfeito! ja e meu segundo e continua otimo", stars: 5 },
  { text: "gostei bastante so achei a fumaça um cadin fraca", stars: 4 },
  { text: "muito bom mesmo, entrega foi no msm dia inclusive", stars: 5 },
  { text: "sabor gelado otimo refresca bem, recomendadissimo", stars: 5 },
  { text: "produto de qualidade, chegou lacradinho tudo certo", stars: 5 },
  { text: "atendimento muito bom me ajudaram a escolher, gostei", stars: 5 },
  { text: "ta bom mas veio um pouco diferente do que imaginei", stars: 3 },
  { text: "comprei e ja quero mais, sabor surpreendente", stars: 5 },
  { text: "entregaram certinho no endereço, sem erro nenhum", stars: 5 },
  { text: "o melhor custo beneficio que achei, vale mt a pena", stars: 5 },
  { text: "razoavel, cumpre o que promete mas nada de outro mundo", stars: 3 },
  { text: "amei o sabor docinho na medida certa, recomendo", stars: 5 },
  { text: "muito bom, so a bateria que acabou meio rapido pra mim", stars: 4 },
  { text: "show de bola, chegou antes do prazo ate", stars: 5 },
  { text: "produto top demais, com certeza vou comprar de novo", stars: 5 },
  { text: "gostei muito, embalagem caprichada e sabor otimo", stars: 5 },
]

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function getProductRating(productId: number): ProductRating {
  const rand = mulberry32(productId * 2654435761)

  // Quantidade variada por produto (de 6 a ~240).
  const count = Math.floor(6 + rand() * 234)

  // Média alta e realista, entre 4.2 e 5.0.
  const average = Math.round((4.2 + rand() * 0.8) * 10) / 10

  // Quantos comentários exibir (3 a 6), limitado ao total.
  const showCount = Math.min(count, 3 + Math.floor(rand() * 4))

  // Seleciona textos sem repetir, embaralhando o pool com a seed.
  const indices = REVIEW_POOL.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const reviews: Review[] = indices.slice(0, showCount).map((idx) => {
    const base = REVIEW_POOL[idx]
    return {
      text: base.text,
      stars: base.stars,
      daysAgo: 1 + Math.floor(rand() * 90),
    }
  })

  return { average, count, reviews }
}
