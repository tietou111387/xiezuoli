// POST /api/seed — 生成示例数据用于开发测试
import { NextResponse } from "next/server";
import { getDb, genId } from "@/lib/db";
import { DEFAULT_SOURCES } from "@/lib/crawler";

const SEED_ARTICLES = [
  {
    title: "以新质生产力推动高质量发展",
    topic: "economy",
    source: "人民日报",
    content: `新质生产力是创新起主导作用，摆脱传统经济增长方式、生产力发展路径，具有高科技、高效能、高质量特征，符合新发展理念的先进生产力质态。

发展新质生产力是推动高质量发展的内在要求和重要着力点。当前，新一轮科技革命和产业变革深入发展，科技创新成为国际战略博弈的主要战场。我们必须抢抓机遇，加大创新力度，培育壮大新兴产业，超前布局建设未来产业，完善现代化产业体系。

习近平总书记强调，"发展新质生产力不是忽视、放弃传统产业"。要坚持从实际出发，先立后破、因地制宜、分类指导，根据本地的资源禀赋、产业基础、科研条件等，有选择地推动新产业、新模式、新动能发展，用新技术改造提升传统产业，积极促进产业高端化、智能化、绿色化。

具体而言，要重点做好以下几方面工作：一是加强关键核心技术攻关，打好关键核心技术攻坚战，使原创性、颠覆性科技创新成果竞相涌现。二是推动科技成果转化应用，打通从科技强到产业强、经济强的通道。三是深化科技体制改革，打通束缚新质生产力发展的堵点卡点，让各类先进优质生产要素向发展新质生产力顺畅流动。

站在新的历史起点上，我们有信心、有能力推动新质生产力加快发展，为以中国式现代化全面推进强国建设、民族复兴伟业作出新的更大贡献。`,
  },
  {
    title: "坚持以人民为中心的发展思想 扎实做好民生保障工作",
    topic: "livelihood",
    source: "求是",
    content: `治国有常，利民为本。我们党始终把人民放在心中最高位置，把人民对美好生活的向往作为奋斗目标。保障和改善民生没有终点，只有连续不断的新起点。

当前，我国社会主要矛盾已经转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。做好民生工作，要抓住人民最关心最直接最现实的利益问题，扭住突出民生难题，一件事情接着一件事情办，一年接着一年干。

在就业方面，要实施就业优先战略，强化就业优先政策，健全就业促进机制，促进高质量充分就业。在教育方面，要坚持以人民为中心发展教育，加快建设高质量教育体系，发展素质教育，促进教育公平。在医疗方面，要深化医药卫生体制改革，促进医保、医疗、医药协同发展和治理。

民生工作千头万绪，关键是要精准发力。要聚焦"一老一小"、困难群众等重点群体，兜住兜准兜牢民生底线。要完善分配制度，坚持按劳分配为主体、多种分配方式并存，构建初次分配、再分配、第三次分配协调配套的制度体系。

人民是我们党执政的最深厚基础和最大底气。只有始终坚持以人民为中心，不断满足人民对美好生活的向往，才能赢得人民的衷心拥护和支持。`,
  },
  {
    title: "深入打好污染防治攻坚战 建设人与自然和谐共生的美丽中国",
    topic: "ecology",
    source: "经济日报",
    content: `生态文明建设是关系中华民族永续发展的根本大计。党的十八大以来，我们以前所未有的力度抓生态文明建设，全党全国推动绿色发展的自觉性和主动性显著增强，美丽中国建设迈出重大步伐。

打好污染防治攻坚战，是决胜全面建成小康社会的三大攻坚战之一，也是推动生态文明建设的重要抓手。要深入打好蓝天、碧水、净土保卫战，持续改善生态环境质量。

在蓝天保卫战方面，要大力推进挥发性有机物和氮氧化物协同减排，加快推进钢铁、水泥、焦化等行业超低排放改造。在碧水保卫战方面，要统筹水资源、水环境、水生态治理，推动重要江河湖库生态保护治理。在净土保卫战方面，要加强土壤污染源头防控，推进受污染耕地安全利用。

实现碳达峰碳中和是一场广泛而深刻的经济社会系统性变革。要处理好发展和减排、整体和局部、长远目标和短期目标、政府和市场的关系，有计划分步骤实施碳达峰行动。要完善能源消耗总量和强度调控，重点控制化石能源消费，逐步转向碳排放总量和强度双控制度。

绿水青山就是金山银山。保护生态环境就是保护生产力，改善生态环境就是发展生产力。要坚持山水林田湖草沙一体化保护和系统治理，全方位、全地域、全过程加强生态环境保护。`,
  },
  {
    title: "坚定文化自信 推动中华优秀传统文化创造性转化和创新性发展",
    topic: "culture",
    source: "光明日报",
    content: `文化是一个国家、一个民族的灵魂。文化兴国运兴，文化强民族强。没有高度的文化自信，没有文化的繁荣兴盛，就没有中华民族伟大复兴。

中华优秀传统文化是中华文明的智慧结晶和精华所在，是中华民族的根和魂。要坚持把马克思主义基本原理同中国具体实际相结合、同中华优秀传统文化相结合，推动中华优秀传统文化创造性转化、创新性发展。

加强文物保护利用和文化遗产保护传承。文物承载灿烂文明，传承历史文化，维系民族精神。要像爱惜自己的生命一样保护好城市历史文化遗产，保护好前人留下的文化遗产。要加强考古工作和历史研究，让收藏在博物馆里的文物、陈列在广阔大地上的遗产、书写在古籍里的文字都活起来。

繁荣发展文化事业和文化产业。要坚持以人民为中心的创作导向，推出更多增强人民精神力量的优秀作品。要深化文化体制改革，完善文化产业规划和政策，推动文化产业高质量发展。要推进城乡公共文化服务体系一体建设，创新实施文化惠民工程。

增强中华文明传播力影响力。要加快构建中国话语和中国叙事体系，讲好中国故事、传播好中国声音，展现可信、可爱、可敬的中国形象。要深入开展同各国的文化交流合作，推动中华文化更好走向世界。`,
  },
];

export async function POST() {
  const db = getDb();

  // 确保媒体源存在
  const insertSource = db.prepare(`
    INSERT OR IGNORE INTO media_sources (id, name, type, province, city, url, rss_url, crawler_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const src of DEFAULT_SOURCES) {
    const id = Buffer.from(src.name).toString("base64").slice(0, 16);
    insertSource.run(
      id,
      src.name,
      src.type,
      null,
      null,
      src.url,
      src.rssUrl || null,
      src.crawlerType,
    );
  }

  // 查找源ID
  const sources = db.prepare("SELECT id, name FROM media_sources").all() as any[];
  const sourceMap: Record<string, string> = {};
  sources.forEach((s) => (sourceMap[s.name] = s.id));

  let count = 0;
  const insertArticle = db.prepare(`
    INSERT OR IGNORE INTO articles
      (id, title, author, source_id, source_name, publish_date, url, content, topic, province, city, word_count, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const article of SEED_ARTICLES) {
    const sourceId = sourceMap[article.source] || "unknown";
    const id = genId();
    const pubDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 3600000,
    ).toISOString();

    insertArticle.run(
      id,
      article.title,
      null,
      sourceId,
      article.source,
      pubDate,
      `https://example.com/article/${id}`,
      article.content,
      article.topic,
      null,
      null,
      article.content.length,
      JSON.stringify([article.topic]),
    );
    count++;
  }

  return NextResponse.json({
    success: true,
    message: `已生成 ${count} 篇示例文章`,
    count,
  });
}
