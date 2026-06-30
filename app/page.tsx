import Link from "next/link";
import { NATIONAL_MEDIA, PROVINCIAL_MEDIA, MUNICIPAL_MEDIA, PROVINCES } from "@/lib/media-sources";

const FEATURES = [
  {
    icon: "📰",
    title: "全量官媒覆盖",
    desc: "央媒+31省省级党报+主要城市党报,从人民日报到地方日报,从网站到公众号,全量收录。",
  },
  {
    icon: "🔬",
    title: "AI十四维深度拆解",
    desc: "逻辑/论证/修辞/金句/词汇/行测/政策溯源/历史脉络/对比分析/写作迁移/思维模型/申论真题联动——14个维度彻底拆透。",
  },
  {
    icon: "🔥",
    title: "每日热点聚合",
    desc: "聚合微博/知乎/B站/抖音/头条等40+平台实时热搜,按申论相关性筛选,一键跳转官媒深度报道。",
  },
  {
    icon: "🧠",
    title: "行测申论联动",
    desc: "读文章同时关联言语理解、判断推理、常识判断考点,打通申论与行测,一通百通。",
  },
  {
    icon: "✏️",
    title: "五大仿写模式",
    desc: "自由仿写/填空练习/重组练习/对比仿写/续写练习,AI逐句批改、打分、给修改建议和范文对照。",
  },
  {
    icon: "📈",
    title: "学习进度追踪",
    desc: "阅读历史/练习记录/能力雷达图/弱项诊断,看得见的进步轨迹。",
  },
];

function MediaCard({ media }: { media: typeof NATIONAL_MEDIA[number] }) {
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-sm text-gray-900">{media.name}</h4>
        {media.category && (
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded shrink-0">
            {media.category}
          </span>
        )}
      </div>
      {media.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {media.description}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
        {media.rssUrl && <span className="text-orange-500">RSS</span>}
        {media.wechatId && <span className="text-green-600">公众号</span>}
        <span className="truncate">{new URL(media.url).hostname}</span>
      </div>
    </a>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* 官媒导航区 */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              全国官媒导航
            </h1>
            <p className="text-gray-500">
              收录 <span className="text-primary font-bold">{NATIONAL_MEDIA.length}</span> 家央媒 · <span className="text-primary font-bold">{PROVINCIAL_MEDIA.length}</span> 家省级党报 · <span className="text-primary font-bold">{MUNICIPAL_MEDIA.length}</span> 家城市党报
            </p>
          </div>

          {/* 央媒 */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-red-600 rounded"></span>
              <h2 className="text-lg font-bold text-gray-900">央媒 · 中央级</h2>
              <span className="text-xs text-gray-400">({NATIONAL_MEDIA.length}家)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {NATIONAL_MEDIA.map((m) => <MediaCard key={m.id} media={m} />)}
            </div>
          </div>

          {/* 省级党报 */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-primary rounded"></span>
              <h2 className="text-lg font-bold text-gray-900">省级党报 · 31省全覆盖</h2>
              <span className="text-xs text-gray-400">({PROVINCIAL_MEDIA.length}家)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {PROVINCIAL_MEDIA.map((m) => <MediaCard key={m.id} media={m} />)}
            </div>
          </div>

          {/* 主要城市党报 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-blue-400 rounded"></span>
              <h2 className="text-lg font-bold text-gray-900">主要城市党报</h2>
              <span className="text-xs text-gray-400">({MUNICIPAL_MEDIA.length}家)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {MUNICIPAL_MEDIA.map((m) => <MediaCard key={m.id} media={m} />)}
            </div>
          </div>
        </div>
      </section>

      {/* 每日热点入口 */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 text-9xl opacity-10">🔥</div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">每日热点聚合</h2>
              <p className="text-white/90 mb-6 leading-relaxed">
                实时聚合微博热搜、知乎热榜、B站热门、抖音热点、今日头条、百度热搜等 40+ 平台数据。
                按申论相关性智能筛选,一键跳转官媒深度报道,把握命题风向。
              </p>
              <Link
                href="/hot"
                className="inline-block px-6 py-2.5 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                查看今日热点 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 工作流 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            四步打通写作能力
          </h2>
          <p className="text-gray-500 text-center mb-12">
            从读到写,从拆解到落地
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "自动采集", desc: "RSS+爬虫双引擎\n全量抓取官媒" },
              { step: "02", title: "AI拆解", desc: "14维深度分析\n联动行测申论" },
              { step: "03", title: "精读学习", desc: "逻辑+修辞+词汇\n政策+历史+对比" },
              { step: "04", title: "仿写落地", desc: "五大练习模式\nAI逐句批改" },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm whitespace-pre-line">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 功能卡片 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            今天就改变你的写作方式
          </h2>
          <p className="text-blue-200 mb-8">
            适合申论备考考生、在职公职人员、文秘工作者
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/my-library"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              进入素材库
            </Link>
            <Link
              href="/practice"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-colors"
            >
              开始练习
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>写作力 — AI驱动的写作能力提升工具</p>
        <p className="mt-1">面向申论考生与公职人员 · 本地运行版</p>
      </footer>
    </div>
  );
}
