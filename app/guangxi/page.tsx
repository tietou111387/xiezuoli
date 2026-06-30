import Link from "next/link";
import {
  GUANGXI_PROVINCIAL,
  GUANGXI_CITIES,
  GUANGXI_GOV,
  ALL_GUANGXI_MEDIA,
  type GuangxiMedia,
} from "@/lib/guangxi-sources";

function MediaCard({ media }: { media: GuangxiMedia }) {
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-green-400/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-sm text-gray-900">{media.name}</h4>
        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded shrink-0">
          {media.category}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {media.description}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
        {media.wechatId && <span className="text-green-600">公众号</span>}
        <span className="truncate">
          {(() => { try { return new URL(media.url).hostname; } catch { return media.url; } })()}
        </span>
      </div>
    </a>
  );
}

function SectionBlock({ title, count, sources, color }: { title: string; count: number; sources: GuangxiMedia[]; color: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-1 h-5 ${color} rounded`}></span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-400">({count}家)</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sources.map((m) => <MediaCard key={m.id} media={m} />)}
      </div>
    </div>
  );
}

export default function GuangxiPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🎋</span>
              <h1 className="text-3xl md:text-4xl font-extrabold">广西板块</h1>
            </div>
            <p className="text-green-100 leading-relaxed mb-6">
              专为广西考生打造的本土化专区。覆盖广西省级党报、14 个地市党报、政府官网、广电媒体,
              让你的申论答案扎根广西实际,有根有据。
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/analyze-text"
                className="px-5 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                📝 拆解广西文章
              </Link>
              <Link
                href="/hot"
                className="px-5 py-2 bg-white/10 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20"
              >
                🔥 今日热点
              </Link>
            </div>
            <div className="mt-6 text-sm text-green-200">
              收录 <span className="font-bold text-white">{ALL_GUANGXI_MEDIA.length}</span> 家广西媒体
              · <span className="font-bold text-white">{GUANGXI_CITIES.length}</span> 个地市全覆盖
            </div>
          </div>
        </div>
      </section>

      {/* 省级媒体 */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionBlock
            title="省级媒体"
            count={GUANGXI_PROVINCIAL.length}
            sources={GUANGXI_PROVINCIAL}
            color="bg-green-600"
          />

          <SectionBlock
            title="地市党报 · 14地市全覆盖"
            count={GUANGXI_CITIES.length}
            sources={GUANGXI_CITIES}
            color="bg-blue-500"
          />

          <SectionBlock
            title="政府官网"
            count={GUANGXI_GOV.length}
            sources={GUANGXI_GOV}
            color="bg-red-500"
          />
        </div>
      </section>

      {/* 使用指南 */}
      <section className="py-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            如何用好广西板块
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                01
              </div>
              <h3 className="font-bold mb-2 text-gray-900">浏览官媒</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                点击上方任一媒体卡片直达官网,浏览广西本地新闻、政策、评论。
                重点关注广西日报头版、当代广西理论文章。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                02
              </div>
              <h3 className="font-bold mb-2 text-gray-900">拆解文章</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                找到有深度的文章后,复制全文粘贴到"文本拆解"页,
                AI 将从 14 个维度深度拆解,自动入库。
              </p>
              <Link
                href="/analyze-text"
                className="inline-block mt-3 text-sm text-green-700 font-medium hover:underline"
              >
                去拆解 →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                03
              </div>
              <h3 className="font-bold mb-2 text-gray-900">积累素材</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                拆解过的文章自动存入"我的素材库",可随时回顾逻辑框架、金句、词汇、
                政策溯源、历史脉络等 14 维拆解内容。
              </p>
              <Link
                href="/my-library"
                className="inline-block mt-3 text-sm text-green-700 font-medium hover:underline"
              >
                查看素材库 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 广西特色板块 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            广西特色议题
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { topic: "东盟合作", emoji: "🌏", desc: "中国-东盟博览会永久举办地" },
              { topic: "北部湾港", emoji: "🚢", desc: "西部陆海新通道关键节点" },
              { topic: "乡村振兴", emoji: "🌾", desc: "脱贫攻坚到乡村振兴衔接" },
              { topic: "民族团结", emoji: "🤝", desc: "少数民族自治区模范" },
              { topic: "生态屏障", emoji: "🌲", desc: "珠江-西江生态廊道" },
              { topic: "红色旅游", emoji: "🔴", desc: "百色起义革命老区" },
              { topic: "糖业基地", emoji: "🍬", desc: "全国糖业第一大省" },
              { topic: "内河港口", emoji: "⚓", desc: "贵港西江黄金水道" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h4 className="font-bold text-sm text-gray-900">{item.topic}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>广西板块 — 扎根本土,服务广西考生</p>
        <p className="mt-1">收录 {ALL_GUANGXI_MEDIA.length} 家媒体 · 14 地市全覆盖</p>
      </footer>
    </div>
  );
}
