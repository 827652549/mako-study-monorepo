/**
 * 双层技能匹配：
 * Layer 1 - jobTags（平台结构化标签，高置信度）
 * Layer 2 - jobDescribe 任职要求段落（精准上下文匹配，补充遗漏）
 */

const fs = require('fs');
const jobs = JSON.parse(fs.readFileSync('raw_jobs.json', 'utf8'));

// 技能定义：name + 匹配关键词（支持别名）
const SKILLS = [
  { name: 'Vue',          keywords: ['vue'] },
  { name: 'React',        keywords: ['react'] },
  { name: 'Angular',      keywords: ['angular'] },
  { name: 'TypeScript',   keywords: ['typescript', 'ts '] },
  { name: 'JavaScript',   keywords: ['javascript', 'js '] },
  { name: 'Node.js',      keywords: ['node.js', 'nodejs', 'node '] },
  { name: 'Webpack',      keywords: ['webpack'] },
  { name: 'Vite',         keywords: ['vite'] },
  { name: 'React Native', keywords: ['react native', 'react-native'] },
  { name: 'Flutter',      keywords: ['flutter'] },
  { name: 'uni-app',      keywords: ['uni-app', 'uniapp'] },
  { name: '小程序',         keywords: ['小程序', 'miniprogram'] },
  { name: '微前端',         keywords: ['微前端', 'micro-frontend', 'micro frontend'] },
  { name: 'Next.js',      keywords: ['next.js', 'nextjs'] },
  { name: 'Nuxt',         keywords: ['nuxt'] },
  { name: 'Redux',        keywords: ['redux'] },
  { name: 'Pinia',        keywords: ['pinia'] },
  { name: 'Vuex',         keywords: ['vuex'] },
  { name: 'MobX',         keywords: ['mobx'] },
  { name: 'Tailwind',     keywords: ['tailwind'] },
  { name: 'ECharts',      keywords: ['echarts'] },
  { name: 'Three.js',     keywords: ['three.js', 'threejs'] },
  { name: 'CSS3',         keywords: ['css3', 'css '] },
  { name: 'HTML5',        keywords: ['html5', 'html '] },
];

// 提取 JD 正文里「任职要求」段落（去掉职责描述，避免"熟悉XX的候选人可以指导..."这类误匹配）
const REQ_HEADING = /任职要求|岗位要求|职位要求|job\s*requirements?|qualifications?|requirements?/i;
const PREFER_PATTERN = /优先|加分|plus|preferred|nice\s*to\s*have/i;
// 要求动词：表示"必须/主要要求"
const REQ_VERB = /熟练|掌握|精通|熟悉|具备|要求|必须|需要|能够|负责|使用|开发|实现/;

function extractRequirementsSection(desc) {
  if (!desc) return '';
  const lines = desc.split(/[\n\r]+/);
  let inReq = false;
  const reqLines = [];
  for (const line of lines) {
    if (REQ_HEADING.test(line)) { inReq = true; continue; }
    // 遇到下一个大段落标题就停
    if (inReq && /^[一二三四五六七八九十\d]+[、.．:：]/.test(line) && !REQ_VERB.test(line)) {
      // 可能是新标题，但也可能是编号条款，保守处理：继续收录
    }
    if (inReq) reqLines.push(line);
  }
  // 如果没找到任职要求段落，就用全文（保底）
  return reqLines.length > 3 ? reqLines.join('\n') : desc;
}

function matchSkillInTags(tags, keywords) {
  const lower = tags.map(t => t.toLowerCase());
  return keywords.some(kw => lower.some(t => t.includes(kw)));
}

function matchSkillInDesc(desc, keywords) {
  const lower = desc.toLowerCase();
  return keywords.some(kw => {
    const idx = lower.indexOf(kw);
    if (idx === -1) return false;
    // 检查前后80字符是否有"优先/加分"（preferred），如果是则不算必选
    const context = lower.slice(Math.max(0, idx - 30), idx + kw.length + 60);
    if (PREFER_PATTERN.test(context)) return false; // 跳过"优先"项
    return true;
  });
}

// 统计
const results = {};
for (const s of SKILLS) results[s.name] = { tags: 0, desc: 0, total: 0 };

for (const j of jobs) {
  const tags = j.jobTags || [];
  const reqSection = extractRequirementsSection(j.jobDescribe || '');

  for (const s of SKILLS) {
    const inTags = matchSkillInTags(tags, s.keywords);
    const inDesc = !inTags && matchSkillInDesc(reqSection, s.keywords); // desc 只补充 tags 没有的

    if (inTags) results[s.name].tags++;
    if (inDesc) results[s.name].desc++;
    if (inTags || inDesc) results[s.name].total++;
  }
}

const total = jobs.length;
const date = new Date().toISOString().slice(0, 10);

console.log(`\n📊 技能需求占比  [国内-前端-${date}  样本 ${total} 条]`);
console.log(`   匹配策略: jobTags（高置信）+ JD任职要求段落（排除"优先"项）`);
console.log('─'.repeat(62));
console.log(`  ${'技能'.padEnd(16)} ${'占比'.padStart(5)}  ${'tags'.padEnd(6)} ${'+desc'.padEnd(6)}  图示`);
console.log('─'.repeat(62));

Object.entries(results)
  .filter(([, v]) => v.total > 0)
  .sort((a, b) => b[1].total - a[1].total)
  .forEach(([k, v]) => {
    const pct = Math.round(v.total / total * 100);
    const bar = '█'.repeat(Math.round(pct / 3));
    console.log(
      `  ${k.padEnd(16)} ${String(pct + '%').padStart(5)}  ` +
      `${String(v.tags).padEnd(6)} ${String('+' + v.desc).padEnd(6)}  ${bar}`
    );
  });

// 保存
const report = JSON.parse(fs.readFileSync('report.json', 'utf8'));
report.skills = Object.fromEntries(
  Object.entries(results)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([k, v]) => [k, { ...v, pct: Math.round(v.total / total * 100) }])
);
fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
console.log('\n✅ report.json 已更新');
