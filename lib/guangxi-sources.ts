// 广西板块官媒源 — 面要广要深
// 涵盖:省级党报/都市报/行业报/各地市党报/政府官网/电视台/电台/期刊

export interface GuangxiMedia {
  id: string;
  name: string;
  category: "省级党报" | "都市报" | "行业报" | "地市党报" | "政府官网" | "广电" | "期刊" | "网站";
  url: string;
  wechatId?: string;
  description: string;
  crawlerType: "rss" | "html" | "wechat";
}

// ---- 省级媒体 ----
export const GUANGXI_PROVINCIAL: GuangxiMedia[] = [
  { id: "gxrb", name: "广西日报", category: "省级党报", url: "http://gxrb.gxrb.com.cn/", wechatId: "gxrb1949", crawlerType: "html", description: "广西壮族自治区党委机关报,权威发布广西政策与新闻" },
  { id: "ngzb", name: "南国早报", category: "都市报", url: "http://www.ngzb.cn/", wechatId: "ngzb2013", crawlerType: "html", description: "广西最大的都市类报纸,民生新闻与热点报道" },
  { id: "ddgx", name: "当代广西", category: "期刊", url: "http://www.ddgx.cn/", wechatId: "ddgx2101", crawlerType: "html", description: "广西壮族自治区党委机关刊物,理论宣传阵地" },
  { id: "gxnews", name: "广西新闻网", category: "网站", url: "https://www.gxnews.com.cn/", wechatId: "gxnews2006", crawlerType: "html", description: "广西重点新闻网站,广西日报传媒集团主办" },
  { id: "gxdt", name: "广西电台", category: "广电", url: "http://www.rxgbn.com/", wechatId: "gxdt970", crawlerType: "html", description: "广西广播电视台,覆盖全自治区的广播媒体" },
  { id: "gxtv", name: "广西电视台", category: "广电", url: "http://www.gxtv.cn/", wechatId: "gxtvnews", crawlerType: "html", description: "广西广播电视台电视频道,综合新闻与专题" },
  { id: "gxqnb", name: "广西青年报", category: "行业报", url: "http://www.gxqnb.cn/", crawlerType: "html", description: "共青团广西区委机关报,青年视角" },
  { id: "fzgx", name: "法治广西", category: "行业报", url: "http://www.fzgx.cn/", crawlerType: "html", description: "广西法治宣传阵地,政法报道" },
  { id: "gxjb", name: "广西科技报", category: "行业报", url: "http://www.gxkjb.com/", crawlerType: "html", description: "广西科协主办,科技传播" },
  { id: "gxjj", name: "广西经济", category: "期刊", url: "http://www.gxjj.cn/", crawlerType: "html", description: "广西经济发展研究院主办,经济理论与政策" },
];

// ---- 地市党报(14个地级市全覆盖) ----
export const GUANGXI_CITIES: GuangxiMedia[] = [
  { id: "nnrb", name: "南宁日报", category: "地市党报", url: "http://nnrb.nnnews.net/", wechatId: "nnrbwx", crawlerType: "html", description: "南宁市委机关报,首府新闻" },
  { id: "lzrb", name: "柳州日报", category: "地市党报", url: "http://www.lzrb.com.cn/", wechatId: "lzrbwx", crawlerType: "html", description: "柳州市委机关报,工业重镇报道" },
  { id: "glrb", name: "桂林日报", category: "地市党报", url: "http://www.guilinlife.com/glrb/", wechatId: "glrbwx", crawlerType: "html", description: "桂林市委机关报,旅游名城动态" },
  { id: "wzrb", name: "梧州日报", category: "地市党报", url: "http://wzrb.wzljl.cn/", crawlerType: "html", description: "梧州市委机关报,百年商埠新闻" },
  { id: "bhrb", name: "北海日报", category: "地市党报", url: "http://www.bhrb.net/", crawlerType: "html", description: "北海市委机关报,北部湾经济区报道" },
  { id: "fcbmqrb", name: "防城港日报", category: "地市党报", url: "http://www.fcgsnews.com/", crawlerType: "html", description: "防城港市委机关报,边海防与口岸新闻" },
  { id: "qzrb", name: "钦州日报", category: "地市党报", url: "http://qzrb.gxnews.com.cn/", crawlerType: "html", description: "钦州市委机关报,北部湾港与石化产业" },
  { id: "ggrb", name: "贵港日报", category: "地市党报", url: "http://ggrb.gxnews.com.cn/", crawlerType: "html", description: "贵港市委机关报,内河港口城市新闻" },
  { id: "yulinrb", name: "玉林日报", category: "地市党报", url: "http://yulinrb.gxnews.com.cn/", crawlerType: "html", description: "玉林市委机关报,桂东南重镇报道" },
  { id: "bssrb", name: "百色日报", category: "地市党报", url: "http://bsrb.bsnews.cn/", crawlerType: "html", description: "百色市委机关报,红色革命老区新闻" },
  { id: "hzzb", name: "贺州日报", category: "地市党报", url: "http://hzrb.gxnews.com.cn/", crawlerType: "html", description: "贺州市委机关报,长寿之乡报道" },
  { id: "hcbrb", name: "河池日报", category: "地市党报", url: "http://hcrb.gxnews.com.cn/", crawlerType: "html", description: "河池市委机关报,生态名城与少数民族" },
  { id: "lbzb", name: "来宾日报", category: "地市党报", url: "http://lbzb.gxnews.com.cn/", crawlerType: "html", description: "来宾市委机关报,桂中水城新闻" },
  { id: "czrb", name: "崇左日报", category: "地市党报", url: "http://czrb.gxnews.com.cn/", crawlerType: "html", description: "崇左市委机关报,边关与糖业报道" },
];

// ---- 政府官网 ----
export const GUANGXI_GOV: GuangxiMedia[] = [
  { id: "gxgov", name: "广西壮族自治区政府网", category: "政府官网", url: "http://www.gxzf.gov.cn/", crawlerType: "html", description: "自治区政府门户网站,权威政策发布" },
  { id: "gxrd", name: "广西人大网", category: "政府官网", url: "http://www.gxrd.gov.cn/", crawlerType: "html", description: "广西自治区人大常委会" },
  { id: "gxzx", name: "广西政协网", category: "政府官网", url: "http://www.gxzx.gov.cn/", crawlerType: "html", description: "广西自治区政协" },
  { id: "gxjw", name: "广西纪委监委网", category: "政府官网", url: "http://www.gxjjjc.gov.cn/", crawlerType: "html", description: "广西自治区纪委监委" },
  { id: "nngov", name: "南宁市政府网", category: "政府官网", url: "http://www.nanning.gov.cn/", crawlerType: "html", description: "首府政府门户" },
  { id: "lzgov", name: "柳州市政府网", category: "政府官网", url: "http://www.liuzhou.gov.cn/", crawlerType: "html", description: "工业重镇门户" },
  { id: "glgov", name: "桂林市政府网", category: "政府官网", url: "http://www.guilin.gov.cn/", crawlerType: "html", description: "国际旅游名城门户" },
];

// ---- 合并 ----
export const ALL_GUANGXI_MEDIA: GuangxiMedia[] = [
  ...GUANGXI_PROVINCIAL,
  ...GUANGXI_CITIES,
  ...GUANGXI_GOV,
];

export const GUANGXI_CATEGORIES = [
  "省级党报", "都市报", "行业报", "地市党报", "政府官网", "广电", "期刊", "网站",
] as const;

// 广西各地市
export const GUANGXI_CITY_NAMES = [
  "南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港",
  "玉林", "百色", "贺州", "河池", "来宾", "崇左",
];
