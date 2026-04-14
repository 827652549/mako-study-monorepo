/**
 * 猎聘网前端岗位抓取
 */
const https = require('https');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Referer': 'https://www.liepin.com/zhaopin/?key=%E5%89%8D%E7%AB%AF',
  'Origin': 'https://www.liepin.com',
};

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: { ...HEADERS, ...options.headers },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function main() {
  // 猎聘搜索接口
  const url = 'https://www.liepin.com/api/www/search/job';
  const params = new URLSearchParams({
    activityId: '',
    degradeFlag: '0',
    dqCode: '',
    fromSearchPage: 'false',
    headCounts: '',
    industries: '',
    key: '前端',
    pageNo: '0',
    pageSize: '25',
    pubTime: '',
    salary: '',
    sortFlag: '0',
    subIndustries: '',
    targetCity: '',
  });

  const fullUrl = `${url}?${params}`;
  console.log('请求猎聘...', fullUrl.slice(0, 80));

  const res = await request(fullUrl);
  console.log('状态码:', res.status);

  let json;
  try {
    json = JSON.parse(res.body);
  } catch {
    console.log('非 JSON 返回:');
    console.log(res.body.slice(0, 500));
    return;
  }

  console.log('顶层 keys:', Object.keys(json));

  const jobs = json?.data?.jobCardList || json?.data?.result || json?.result || [];
  if (!jobs.length) {
    console.log('未解析到岗位，原始:');
    console.log(JSON.stringify(json, null, 2).slice(0, 1000));
    return;
  }

  console.log(`\n✅ 成功获取 ${jobs.length} 条岗位\n`);
  jobs.slice(0, 5).forEach((j, i) => {
    const title = j.jobName || j.title || j.positionName;
    const company = j.compFullName || j.companyName || j.company;
    const salary = j.salary || j.salaryInfo;
    const city = j.cityName || j.city;
    const skills = (j.labels || j.skillTags || []).join(', ');
    console.log(`[${i+1}] ${title} - ${company} (${city})`);
    console.log(`    薪资: ${salary}  技能: ${skills}`);
    console.log();
  });
}

main().catch(console.error);
