/**
 * 拉勾网前端岗位抓取脚本
 * 接口: POST https://www.lagou.com/api/v2/search/position
 */

const https = require('https');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': 'https://www.lagou.com',
  'Referer': 'https://www.lagou.com/wn/jobs?kd=%E5%89%8D%E7%AB%AF',
  'X-Requested-With': 'XMLHttpRequest',
  'Cookie': ''  // 可留空先试，不行再补
};

function postRequest(url, body) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams(body).toString();
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Length': Buffer.byteLength(postData),
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`状态码: ${res.statusCode}`);
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function fetchLagouJobs(keyword = '前端', city = '全国', page = 1) {
  const url = 'https://www.lagou.com/api/v2/search/position';
  const body = {
    first: page === 1 ? 'true' : 'false',
    pn: page,
    kd: keyword,
    city: city,
    needAddtionalResult: 'false'
  };

  console.log(`\n正在请求拉勾网: keyword="${keyword}", city="${city}", page=${page}`);
  const result = await postRequest(url, body);

  let parsed;
  try {
    parsed = JSON.parse(result.body);
  } catch (e) {
    console.log('返回内容（非JSON）:');
    console.log(result.body.slice(0, 500));
    return null;
  }

  return parsed;
}

async function main() {
  const data = await fetchLagouJobs('前端', '全国', 1);
  if (!data) {
    console.log('\n❌ 拉勾网返回非 JSON，可能需要 Cookie 或已被拦截');
    return;
  }

  console.log('\n返回结构 keys:', Object.keys(data));

  // 尝试拉勾网常见结构
  const positions = data?.content?.positionResult?.result
    || data?.data?.result
    || data?.positions
    || [];

  if (positions.length === 0) {
    console.log('\n⚠️ 没有解析到岗位，原始返回:');
    console.log(JSON.stringify(data, null, 2).slice(0, 1000));
    return;
  }

  console.log(`\n✅ 成功获取 ${positions.length} 条岗位\n`);
  positions.slice(0, 5).forEach((p, i) => {
    console.log(`[${i+1}] ${p.positionName || p.title} - ${p.companyFullName || p.company} - ${p.city}`);
    console.log(`    薪资: ${p.salary}, 经验: ${p.workYear}, 技能: ${p.skillLables?.join(', ') || p.skills}`);
    console.log();
  });
}

main().catch(console.error);
