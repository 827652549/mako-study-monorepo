const { chromium } = require('playwright');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function fetchPage(page, keyword, pageNum) {
  const ts = Math.floor(Date.now() / 1000);
  const kw = encodeURIComponent(keyword);
  const url = `https://we.51job.com/api/job/search-pc?api_key=51job&timestamp=${ts}&keyword=${kw}&searchType=2&city=000000&sortType=0&pageNum=${pageNum}&pageCode=sou%7Csou%7Csoulb%7C${pageNum}`;

  const resp = await page.evaluate(async (u) => {
    const r = await fetch(u, { headers: { Accept: 'application/json', Referer: 'https://we.51job.com/' } });
    return r.text();
  }, url);

  return JSON.parse(resp);
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  console.log('初始化 Cookie...');
  await page.goto('https://we.51job.com/pc/search?keyword=%E5%89%8D%E7%AB%AF&searchType=2', {
    waitUntil: 'domcontentloaded', timeout: 20000,
  }).catch(() => {});
  await page.waitForTimeout(1500);

  // 抓5页共250条
  const PAGES = 5;
  const KEYWORD = '前端';
  let allJobs = [];

  for (let p = 1; p <= PAGES; p++) {
    process.stdout.write(`抓取第 ${p}/${PAGES} 页...`);
    const json = await fetchPage(page, KEYWORD, p);
    const items = json?.resultbody?.job?.items || [];
    allJobs = allJobs.concat(items);
    console.log(` ${items.length} 条`);
    if (items.length === 0) break;
    await page.waitForTimeout(800); // 礼貌性延迟
  }

  console.log(`\n共抓取 ${allJobs.length} 条岗位`);

  // ✅ 只用 jobTags 做技能统计（结构化标签，准确）
  const SKILLS = [
    'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript',
    'Node.js', 'Webpack', 'Vite', 'React Native', 'Flutter',
    'uni-app', '微前端', 'Next.js', 'Nuxt', '小程序',
    'Redux', 'MobX', 'Pinia', 'CSS', 'HTML', 'CSS3', 'HTML5',
  ];

  const counts = {};
  for (const s of SKILLS) counts[s] = 0;

  for (const j of allJobs) {
    // ✅ 只匹配 jobTags，不碰 jobDescribe
    const tags = (j.jobTags || []).map(t => t.toLowerCase());
    for (const s of SKILLS) {
      if (tags.some(t => t.includes(s.toLowerCase()))) counts[s]++;
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const total = allJobs.length;

  console.log(`\n📊 技能需求占比  [国内-前端-${date}  样本 ${total} 条]`);
  console.log('─'.repeat(55));

  const sorted = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  sorted.forEach(([k, v]) => {
    const pct = Math.round(v / total * 100);
    const bar = '█'.repeat(Math.round(pct / 3));
    console.log(`  ${k.padEnd(16)} ${String(pct + '%').padStart(5)}  ${bar}`);
  });

  // 存报告
  const report = {
    date,
    keyword: KEYWORD,
    platform: '前程无忧',
    sample: total,
    skills: Object.fromEntries(sorted.map(([k, v]) => [k, { count: v, pct: Math.round(v / total * 100) }]))
  };

  fs.writeFileSync('raw_jobs.json', JSON.stringify(allJobs, null, 2));
  fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
  console.log(`\n✅ 已保存 raw_jobs.json (${total}条) / report.json`);

  await browser.close();
}

main().catch(console.error);
