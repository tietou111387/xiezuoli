// ============================================================
// 全国官媒源数据库 — 央媒 / 省媒 / 市媒三级
// 数据来源：求是网党报党刊目录 + 搜狐"四大官媒八大党媒" + 北化工省级党报名单
// 维护：写作力项目
// ============================================================

export interface MediaSourceDef {
  id: string;
  name: string;            // 媒体名称
  level: "national" | "provincial" | "municipal";
  province?: string;       // 省级/地市级时有值
  city?: string;           // 地市级时有值
  url: string;             // 官网
  rssUrl?: string;         // RSS 订阅地址
  wechatId?: string;       // 微信公众号标识
  crawlerType: "rss" | "html" | "wechat";
  category?: string;       // 媒体类型细分(党报/通讯社/广电/行业)
  description?: string;
}

// ---- 央媒（中央级）----
export const NATIONAL_MEDIA: MediaSourceDef[] = [
  // 四大官媒网站
  { id: "xinhuanet", name: "新华网", level: "national", url: "http://www.xinhuanet.com/", rssUrl: "http://www.xinhuanet.com/politics/news_politics.xml", crawlerType: "rss", category: "通讯社", description: "国家通讯社新华社主办" },
  { id: "people", name: "人民网", level: "national", url: "http://www.people.com.cn/", rssUrl: "http://www.people.com.cn/rss/politics.xml", crawlerType: "rss", category: "党报", description: "人民日报主办的网上信息发布平台" },
  { id: "cctv", name: "央视网", level: "national", url: "http://www.cctv.com/", crawlerType: "html", category: "广电", description: "中央广播电视总台主办" },
  { id: "gmw", name: "光明网", level: "national", url: "https://www.gmw.cn/", rssUrl: "https://www.gmw.cn/rss/news.xml", crawlerType: "rss", category: "党报", description: "光明日报社创办,思想理论领域" },

  // 八大党媒
  { id: "rmrb", name: "人民日报", level: "national", url: "http://paper.people.com.cn/", rssUrl: "http://www.people.com.cn/rss/politics.xml", wechatId: "rmrbwx", crawlerType: "rss", category: "党报", description: "中共中央委员会机关报" },
  { id: "gmrb", name: "光明日报", level: "national", url: "https://epaper.gmw.cn/gmrb/", crawlerType: "html", wechatId: "gmrb1949", category: "党报", description: "中共中央主管,知识分子为主要读者" },
  { id: "zqb", name: "中国青年报", level: "national", url: "http://news.cyol.com/", crawlerType: "html", wechatId: "cyoltest", category: "党报", description: "共青团中央机关报" },
  { id: "jjrb", name: "经济日报", level: "national", url: "http://www.ce.cn/", crawlerType: "html", wechatId: "jjrbwx", category: "党报", description: "国务院主办,经济类综合性日报" },
  { id: "jfrb", name: "解放日报", level: "national", url: "http://www.jfdaily.com/", crawlerType: "html", wechatId: "jfdaily", category: "党报", description: "中共上海市委机关报,省级党报代表" },
  { id: "xhrb", name: "新华日报", level: "national", url: "http://xh.xhby.net/", crawlerType: "html", wechatId: "xhrb2014", category: "党报", description: "中共江苏省委机关报" },
  { id: "jfb", name: "解放军报", level: "national", url: "http://www.81.cn/", crawlerType: "html", wechatId: "jfjbdzgb", category: "党报", description: "中央军委机关报" },
  { id: "grrb", name: "工人日报", level: "national", url: "http://www.workercn.com/", crawlerType: "html", wechatId: "grrbwx", category: "党报", description: "中华全国总工会机关报" },

  // 其他中央级党报党刊
  { id: "qs", name: "求是", level: "national", url: "http://www.qstheory.cn/", crawlerType: "html", wechatId: "qstheory", category: "党刊", description: "中共中央理论刊物" },
  { id: "xhmrdx", name: "新华每日电讯", level: "national", url: "http://www.xinhuanet.com/mrdx/", crawlerType: "html", category: "通讯社", description: "新华社主办的中央级报纸" },
  { id: "jjjcb", name: "中国纪检监察报", level: "national", url: "http://www.jjjcb.cn/", crawlerType: "html", wechatId: "jjjjbw", category: "党报", description: "中央纪委国家监委机关报" },
  { id: "zgrsb", name: "中国组织人事报", level: "national", url: "http://www.zuzhiren.com/", crawlerType: "html", category: "党报", description: "中组部主办的报纸" },
  { id: "rmzxb", name: "人民政协报", level: "national", url: "http://www.rmzxb.com.cn/", crawlerType: "html", wechatId: "rmzxb01", category: "党报", description: "全国政协机关报" },
  { id: "kjrb", name: "科技日报", level: "national", url: "http://www.stdaily.com/", crawlerType: "html", wechatId: "kjrbwx", category: "行业", description: "科技部主办" },
  { id: "fnrb", name: "中国妇女报", level: "national", url: "http://www.cnwomen.com.cn/", crawlerType: "html", wechatId: "fnb1984", category: "行业", description: "全国妇联机关报" },
  { id: "nmrb", name: "农民日报", level: "national", url: "http://www.farmer.com.cn/", crawlerType: "html", wechatId: "farmersdaily", category: "行业", description: "农业农村部主管" },
  { id: "fzb", name: "法治日报", level: "national", url: "http://www.legaldaily.com.cn/", crawlerType: "html", wechatId: "fzrbwx", category: "行业", description: "中央政法委机关报" },
  { id: "jyb", name: "中国教育报", level: "national", url: "http://www.jyb.cn/", crawlerType: "html", wechatId: "jybnews", category: "行业", description: "教育部主管" },
  { id: "jcb", name: "检察日报", level: "national", url: "http://newspaper.jcrb.com/", crawlerType: "html", wechatId: "jcrbszb", category: "行业", description: "最高人民检察院主办" },
  { id: "rmfyb", name: "人民法院报", level: "national", url: "http://rmfyb.chinacourt.org/", crawlerType: "html", category: "行业", description: "最高法主办" },
  { id: "rmgab", name: "人民公安报", level: "national", url: "http://www.cpd.com.cn/", crawlerType: "html", category: "行业", description: "公安部主办" },
  { id: "tjb", name: "团结报", level: "national", url: "http://www.tuanjiebao.com/", crawlerType: "html", wechatId: "tuanjiebao", category: "党报", description: "民革中央机关报" },
  { id: "zgrb", name: "中国日报", level: "national", url: "https://www.chinadaily.com.cn/", crawlerType: "html", wechatId: "RealTimeChina", category: "通讯社", description: "国务院新闻办主管,英文版" },
  { id: "xxsb", name: "学习时报", level: "national", url: "http://www.dzbstudy.com/", crawlerType: "html", category: "党报", description: "中央党校主办" },
];

// ---- 31个省级党报（含直辖市/自治区）----
export const PROVINCIAL_MEDIA: MediaSourceDef[] = [
  { id: "bjrb", name: "北京日报", level: "provincial", province: "北京", url: "https://bjrb.bjd.com.cn/", crawlerType: "html", wechatId: "bjdaily", category: "党报" },
  { id: "tjrb", name: "天津日报", level: "provincial", province: "天津", url: "http://news.enorth.com.cn/tjrb/", crawlerType: "html", wechatId: "tjrbwx", category: "党报" },
  { id: "hbrb", name: "河北日报", level: "provincial", province: "河北", url: "http://hbrb.hebnews.cn/", crawlerType: "html", wechatId: "hbrbgfwx", category: "党报" },
  { id: "sxrb", name: "山西日报", level: "provincial", province: "山西", url: "http://sxrb.sxrb.com/", crawlerType: "html", wechatId: "sxrbwx", category: "党报" },
  { id: "nmgrb", name: "内蒙古日报", level: "provincial", province: "内蒙古", url: "http://szb.northnews.cn/nmgrb/", crawlerType: "html", wechatId: "nmgrb", category: "党报" },
  { id: "lnrb", name: "辽宁日报", level: "provincial", province: "辽宁", url: "http://szb.lnd.com.cn/lndzb/", crawlerType: "html", wechatId: "lnrbwx", category: "党报" },
  { id: "jlrb", name: "吉林日报", level: "provincial", province: "吉林", url: "http://jlrbszb.cnjiwang.com/", crawlerType: "html", wechatId: "jlrbwx", category: "党报" },
  { id: "hljrb", name: "黑龙江日报", level: "provincial", province: "黑龙江", url: "http://hlj.people.com.cn/", crawlerType: "html", wechatId: "hljrbwx", category: "党报" },
  { id: "jfrb_sh", name: "解放日报(上海)", level: "provincial", province: "上海", url: "http://www.jfdaily.com/", crawlerType: "html", wechatId: "jfdaily", category: "党报" },
  { id: "xhrb_js", name: "新华日报(江苏)", level: "provincial", province: "江苏", url: "http://xh.xhby.net/", crawlerType: "html", wechatId: "xhrb2014", category: "党报" },
  { id: "zjrb", name: "浙江日报", level: "provincial", province: "浙江", url: "https://zjrb.zjol.com.cn/", crawlerType: "html", wechatId: "zjrbwx", category: "党报" },
  { id: "ahrb", name: "安徽日报", level: "provincial", province: "安徽", url: "http://szb.ahnews.com.cn/", crawlerType: "html", wechatId: "ahrbwx", category: "党报" },
  { id: "fjrb", name: "福建日报", level: "provincial", province: "福建", url: "http://fjrb.fjsen.com/", crawlerType: "html", wechatId: "fjrbwx", category: "党报" },
  { id: "jxrb", name: "江西日报", level: "provincial", province: "江西", url: "http://jxrb.jxxw.com.cn/", crawlerType: "html", wechatId: "jxrbwx", category: "党报" },
  { id: "dzrb", name: "大众日报(山东)", level: "provincial", province: "山东", url: "http://paper.dzwww.com/", crawlerType: "html", wechatId: "dzwww01", category: "党报" },
  { id: "hnrb_henan", name: "河南日报", level: "provincial", province: "河南", url: "http://newpaper.dahe.cn/", crawlerType: "html", wechatId: "hnrbwg", category: "党报" },
  { id: "hbrb_hubei", name: "湖北日报", level: "provincial", province: "湖北", url: "http://hbrb.cnhubei.com/", crawlerType: "html", wechatId: "hbrbwx", category: "党报" },
  { id: "hnrb_hunan", name: "湖南日报", level: "provincial", province: "湖南", url: "http://hnrb.voc.com.cn/", crawlerType: "html", wechatId: "hnrbwx", category: "党报" },
  { id: "nfrb", name: "南方日报(广东)", level: "provincial", province: "广东", url: "http://epaper.southcn.com/nfdaily/", crawlerType: "html", wechatId: "nfrbzx", category: "党报" },
  { id: "gxrb", name: "广西日报", level: "provincial", province: "广西", url: "http://gxrb.gxrb.com.cn/", crawlerType: "html", wechatId: "gxrbwx", category: "党报" },
  { id: "hnrb_hainan", name: "海南日报", level: "provincial", province: "海南", url: "http://hnrb.hinews.cn/", crawlerType: "html", wechatId: "hnrbwx", category: "党报" },
  { id: "cqrb", name: "重庆日报", level: "provincial", province: "重庆", url: "http://cqrbepaper.cqliving.com/", crawlerType: "html", wechatId: "cqrbwg", category: "党报" },
  { id: "scrb", name: "四川日报", level: "provincial", province: "四川", url: "https://epaper.scdaily.cn/", crawlerType: "html", wechatId: "scdsb", category: "党报" },
  { id: "gzrb", name: "贵州日报", level: "provincial", province: "贵州", url: "http://szb.gog.cn/", crawlerType: "html", wechatId: "gzrbwx", category: "党报" },
  { id: "ynrb", name: "云南日报", level: "provincial", province: "云南", url: "http://yndaily.yunnan.cn/", crawlerType: "html", wechatId: "ynrbwx", category: "党报" },
  { id: "xzrb", name: "西藏日报", level: "provincial", province: "西藏", url: "http://www.xzrb.com.cn/", crawlerType: "html", wechatId: "xzrbwx", category: "党报" },
  { id: "sxrb_sx", name: "陕西日报", level: "provincial", province: "陕西", url: "http://esb.sxdaily.com.cn/", crawlerType: "html", wechatId: "sxrbwx", category: "党报" },
  { id: "gsrb", name: "甘肃日报", level: "provincial", province: "甘肃", url: "http://gsrb.gansudaily.com.cn/", crawlerType: "html", wechatId: "gsrbwx", category: "党报" },
  { id: "qhrb", name: "青海日报", level: "provincial", province: "青海", url: "http://epaper.tibet3.com/", crawlerType: "html", wechatId: "qhrbwx", category: "党报" },
  { id: "nxrb", name: "宁夏日报", level: "provincial", province: "宁夏", url: "http://nxrb.nxnews.net/", crawlerType: "html", wechatId: "nxrbwx", category: "党报" },
  { id: "xjrb", name: "新疆日报", level: "provincial", province: "新疆", url: "http://xjrb.ts.cn/", crawlerType: "html", wechatId: "xjrbwx", category: "党报" },
];

// ---- 主要城市党报 ----
export const MUNICIPAL_MEDIA: MediaSourceDef[] = [
  { id: "gzrb", name: "广州日报", level: "municipal", province: "广东", city: "广州", url: "https://gzdaily.dayoo.com/", crawlerType: "html", wechatId: "gzdaily", category: "党报" },
  { id: "sztb", name: "深圳特区报", level: "municipal", province: "广东", city: "深圳", url: "http://sztqb.sznews.com/", crawlerType: "html", wechatId: "sztqb", category: "党报" },
  { id: "qdrb", name: "青岛日报", level: "municipal", province: "山东", city: "青岛", url: "http://www.dailyqd.com/", crawlerType: "html", wechatId: "qdrbwx", category: "党报" },
  { id: "hrbtb", name: "哈尔滨日报", level: "municipal", province: "黑龙江", city: "哈尔滨", url: "http://hrbwb.harbinnews.com/", crawlerType: "html", wechatId: "hrbwb", category: "党报" },
  { id: "syrb", name: "沈阳日报", level: "municipal", province: "辽宁", city: "沈阳", url: "http://newspaper.syd.com.cn/", crawlerType: "html", wechatId: "syrbwg", category: "党报" },
  { id: "whrb", name: "武汉晚报", level: "municipal", province: "湖北", city: "武汉", url: "http://whwb.cjn.cn/", crawlerType: "html", wechatId: "whwbwx", category: "党报" },
  { id: "csrb", name: "长沙晚报", level: "municipal", province: "湖南", city: "长沙", url: "http://www.icswb.com/", crawlerType: "html", wechatId: "cswbwx", category: "党报" },
  { id: "cdwanbao", name: "成都晚报", level: "municipal", province: "四川", city: "成都", url: "http://www.cdxww.cn/", crawlerType: "html", wechatId: "cdwbwx", category: "党报" },
  { id: "hzrb", name: "杭州日报", level: "municipal", province: "浙江", city: "杭州", url: "http://hzdaily.hangzhou.com.cn/", crawlerType: "html", wechatId: "hzrbwx", category: "党报" },
  { id: "njrb", name: "南京日报", level: "municipal", province: "江苏", city: "南京", url: "http://njrb.njdaily.cn/", crawlerType: "html", wechatId: "njrbwg", category: "党报" },
  { id: "tjwb", name: "今晚报", level: "municipal", province: "天津", city: "天津", url: "http://www.jwb.com.cn/", crawlerType: "html", wechatId: "jwbwx", category: "党报" },
  { id: "xarb", name: "西安日报", level: "municipal", province: "陕西", city: "西安", url: "http://epaper.xiancn.com/", crawlerType: "html", wechatId: "xarbwx", category: "党报" },
];

// ---- 合并导出 ----
export const ALL_MEDIA_SOURCES: MediaSourceDef[] = [
  ...NATIONAL_MEDIA,
  ...PROVINCIAL_MEDIA,
  ...MUNICIPAL_MEDIA,
];

// 按级别分组
export function getMediaByLevel(level: MediaSourceDef["level"]) {
  return ALL_MEDIA_SOURCES.filter((m) => m.level === level);
}

// 按省份分组
export function getMediaByProvince(province: string) {
  return ALL_MEDIA_SOURCES.filter((m) => m.province === province);
}

// 省份列表
export const PROVINCES = [
  "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
  "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南",
  "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州",
  "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆",
];
