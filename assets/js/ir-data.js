/* ==========================================================================
   ข้อมูลหุ้น RPC สำหรับหน้านักลงทุน — แก้ที่ไฟล์นี้ที่เดียว
   --------------------------------------------------------------------------
   ราคาหุ้น: หน้าราคา SET (set.or.th/th/market/product/stock/quote/RPC/price) ณ 09 ต.ค. 2569 09:56:19
             ขณะนั้นตลาดอยู่ช่วง Pre-Open ยังไม่มีราคาล่าสุด จึงแสดงราคาปิดก่อนหน้า 0.42 บาท
             สูงสุด/ต่ำสุด = ราคาสูงสุด/ต่ำสุดของวัน (ประวัติราคา SET ณ 09 ต.ค. 2569: 0.42 / 0.42)
   งบการเงิน: ตัวเลขรายปี (ล้านบาท) รวมจากงบรายไตรมาสที่ยื่นต่อ SET (ผ่านข้อมูล efinanceThai/SET)
             รายได้รวม = รวมรายได้อื่น · กำไรสุทธิ = ส่วนของผู้ถือหุ้นบริษัทใหญ่ · สินทรัพย์/ส่วนผู้ถือหุ้น = ณ สิ้นปี
             หมายเหตุ: ปี 2565 ยังไม่รวม SAMCO (เริ่มมีอำนาจควบคุมโดยพฤตินัย 1 ม.ค. 2566) จึงสินทรัพย์ต่ำกว่าปีถัดไป
   เงินปันผล: ตามประกาศ XD ของ SET (ปีผลการดำเนินงาน 2566 = 0.04 · 2567 = 0.01 · 2568 = 0.01 บาท/หุ้น)
   ========================================================================== */
window.RPC_IR = {
  /* holders / news / events ยังเป็นตัวอย่างจากดีไซน์ — ต้องแทนด้วยข้อมูลจริงก่อนเผยแพร่ (finance / stock / dividend อ้างอิง SET แล้ว) */
  finance: {
    years: ['2565', '2566', '2567', '2568', 'Q2/2569'],
    assets: [4130.90, 9014.75, 9530.25, 8823.78, 8861.41],      /* สินทรัพย์รวม ณ สิ้นปี (ล้านบาท) */
    liabilities: [1677.24, 5018.26, 5658.71, 5058.21, 5027.07],  /* หนี้สินรวม (ล้านบาท) ตามตารางงบการเงินที่บริษัทส่งมา */
    revenue: [7857.63, 10285.41, 8990.84, 8408.61, 4563.72],    /* รายได้รวม (ล้านบาท) */
    gross: [458, 1010, 844, 821, null],        /* กำไรขั้นต้น (ล้านบาท) — อัตรากำไรขั้นต้นคำนวณจาก gross / revenue */
    net: [63.99, 27.80, -71.92, -52.75, 25.36],             /* กำไรสุทธิ (ล้านบาท) — อัตรากำไรสุทธิคำนวณจาก net / revenue */
    netRate: [0.81, 0.5, -0.5, -1, 1.85],      /* อัตรากำไรสุทธิ (%) ตามตารางงบการเงินที่บริษัทส่งมา */
    equity: [2453.66, 2479.09, 2352.17, 2282.81, 2296.99],    /* ส่วนของผู้ถือหุ้น ณ สิ้นปี (ล้านบาท) */
    eps: [0.05, 0.02, -0.06, -0.04, 0.02],     /* กำไรสุทธิต่อหุ้น (บาท/หุ้น) */
    profile: { market: 'SET', industry: 'ทรัพยากร', sector: 'พลังงานและสาธารณูปโภค', listed: '30 ม.ค. 2556', industryEn: 'Resources', sectorEn: 'Energy & Utilities', listedEn: '30 Jan 2013' }
  },
  /* ผู้ถือหุ้น 10 อันดับแรก — จากหน้า SET (set.or.th/th/market/product/stock/quote/RPC/major-shareholders)
     TODO: ใส่วันที่ปิดสมุดทะเบียนที่หน้า SET ระบุไว้ใน holdersAsOf (เช่น '2 พ.ค. 2569') */
  holdersAsOf: '',
  holders: [
    { name: 'บริษัท เพทโทร-อินสตรูเมนท์ จำกัด', nameEn: 'Petro-Instrument Co., Ltd.', shares: 257227140, pct: 19.72 },
    { name: 'นายบุญฉัตร พลอยจิระชัย', nameEn: 'Mr. Boonchat Ployjirachai', shares: 52653400, pct: 4.04 },
    { name: 'นางสาวพิมอุมา เจนธรรมนุกูล', nameEn: 'Miss Pimuma Janetumnugul', shares: 38658950, pct: 2.96 },
    { name: 'นางสาวมณฑนา เจนธรรมนุกูล', nameEn: 'Miss Monthana Janetumnugul', shares: 34481978, pct: 2.64 },
    { name: 'นายธวัช อึ้งสุประเสริฐ', nameEn: 'Mr. Thawat Ungsuprasert', shares: 33057578, pct: 2.53 },
    { name: 'นางสาวปริญณี เจนธรรมนุกูล', nameEn: 'Miss Parinyanee Janetumnugul', shares: 29101578, pct: 2.23 },
    { name: 'นายณพน เจนธรรมนุกูล', nameEn: 'Mr. Napon Janetumnugul', shares: 21400000, pct: 1.64 },
    { name: 'นางสาวเมทนี สุคนธรักษ์', nameEn: 'Miss Metanee Sukontharak', shares: 20500000, pct: 1.57 },
    { name: 'นายกฤษฎ์ จรูญศรีรัตน์', nameEn: 'Mr. Kritch Jaroonsrirat', shares: 16800000, pct: 1.29 },
    { name: 'นางมัทนา อึ้งสุประเสริฐ', nameEn: 'Mrs. Mattana Ungsuprasert', shares: 15481660, pct: 1.19 }
  ],
  dividend: { years: ['2566', '2567', '2568'], perShare: [0.04, 0.01, 0.01] },
  /* type: 'set' = ข่าวจากตลาดหลักทรัพย์ · 'company' = ข่าวจากบริษัท */
  news: [
    { type: 'set', date: '2026-10-06', tag: 'คดีความ', title: 'รายงานคดีความฟ้องร้องของบริษัทแกน (บริษัท เพียวพลังงานไทย จำกัด )', tagEn: 'Litigation', titleEn: 'Report on the lawsuit against the core company (Pure Thai Energy Company Limited)', href: '#' },
    { type: 'set', date: '2026-09-30', tag: 'ประกาศ', title: 'แจ้งวันหยุดตามประเพณี ประจำปี 2570', tagEn: 'Announcement', titleEn: 'Notification of traditional holidays for 2027', href: '#' },
    { type: 'set', date: '2026-09-02', tag: 'ผู้ถือหุ้น', title: 'การเสนอวาระการประชุมสามัญผู้ถือหุ้น ประจำปี 2570 และเสนอชื่อบุคคลเพื่อเข้ารับการคัดเลือกเป็นกรรมการล่วงหน้า', tagEn: 'Shareholders', titleEn: 'Proposal of agenda items for the 2027 Annual General Meeting of Shareholders and advance nomination of persons for election as directors', href: '#' },
    { type: 'set', date: '2026-08-11', tag: 'รายการเกี่ยวโยง', title: 'รายการเกี่ยวโยงกัน ประเภทการให้ความช่วยเหลือทางการเงิน', tagEn: 'Connected transaction', titleEn: 'Connected transaction: provision of financial assistance', href: '#' },
    { type: 'set', date: '2026-08-11', tag: 'งบการเงิน', title: 'สรุปผลการดำเนินงานของ บจ. ไตรมาสที่ 2 (F45) (สอบทานแล้ว)', tagEn: 'Financial statements', titleEn: 'Summary of the listed company’s operating results for Q2 (F45) (reviewed)', href: '#' },
    { type: 'company', date: '2026-09-30', tag: 'ข่าวองค์กร', title: 'RPC เปิดสถานีบริการคาลเท็กซ์แห่งใหม่ เสริมเครือข่ายในภูมิภาค', tagEn: 'Corporate news', titleEn: 'RPC opens a new Caltex service station, strengthening its regional network', href: 'ir-news.html' },
    { type: 'company', date: '2026-08-21', tag: 'ความยั่งยืน', title: 'กลุ่มบริษัทฯ ร่วมกิจกรรมปลูกป่าชายเลนเนื่องในวันสิ่งแวดล้อม', tagEn: 'Sustainability', titleEn: 'The Group joins a mangrove planting activity on Environment Day', href: 'ir-news.html' },
    { type: 'company', date: '2026-06-30', tag: 'ข่าวองค์กร', title: 'RPC เดินหน้าติดตั้งโซลาร์รูฟท็อปที่สถานีบริการเพิ่มเติม', tagEn: 'Corporate news', titleEn: 'RPC continues installing rooftop solar at additional service stations', href: 'ir-news.html' }
  ],
  events: [
    { date: '2026-10-28', title: 'พบนักวิเคราะห์ ไตรมาส 3/2569', type: 'Analyst Meeting', place: 'ออนไลน์', titleEn: 'Analyst Meeting Q3/2026', typeEn: 'Analyst Meeting', placeEn: 'Online' },
    { date: '2026-11-13', title: 'ประกาศผลการดำเนินงาน ไตรมาส 3/2569', type: 'งบการเงิน', place: 'ผ่านระบบ SET', titleEn: 'Q3/2026 operating results announcement', typeEn: 'Financial statements', placeEn: 'Via the SET system' },
    { date: '2026-12-04', title: 'Opportunity Day', type: 'Opp Day', place: 'ตลาดหลักทรัพย์แห่งประเทศไทย', titleEn: 'Opportunity Day', typeEn: 'Opp Day', placeEn: 'The Stock Exchange of Thailand' },
    { date: '2027-04-22', title: 'ประชุมสามัญผู้ถือหุ้น ประจำปี 2570', type: 'AGM', place: 'จะแจ้งให้ทราบ', titleEn: '2027 Annual General Meeting of Shareholders', typeEn: 'AGM', placeEn: 'To be announced' }
  ],
  stock: { symbol: 'RPC', price: 0.42, change: 0, changePct: 0, high: 0.42, low: 0.42, asOf: '2026-10-09T09:56:19' }
};

(() => {
  const d = window.RPC_IR.stock;
  const EN = document.documentElement.lang === 'en';
  const $ = (k) => document.querySelector(`[data-stock="${k}"]`);
  const num = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = (n) => (n > 0 ? '+' : '');
  if (!$('price')) return;

  const set = (k, v) => { const el = $(k); if (el) el.textContent = v; };
  if (d.price == null) { set('price', '—'); set('price2', '—'); set('asof', EN ? 'Awaiting data' : 'รอข้อมูล'); return; }

  set('price', num(d.price));
  set('price2', num(d.price));
  if (d.high != null) set('high', num(d.high));
  if (d.low != null) set('low', num(d.low));
  if (d.change != null) {
    set('change', `${sign(d.change)}${num(d.change)}${d.changePct != null ? ` (${sign(d.changePct)}${num(d.changePct)}%)` : ''}`);
    const cg = $('change'); if (cg) { cg.classList.toggle('is-up', d.change > 0); cg.classList.toggle('is-down', d.change < 0); }
    set('delta', `${sign(d.change)}${num(d.change)}${d.changePct != null ? ` (${sign(d.changePct)}${num(d.changePct)}%)` : ''}`);
    const q = $('quote');
    if (q) { /* ชั่วคราว: ราคาไม่เปลี่ยน (0.00) ให้แสดงเป็นสถานะขึ้น (ลูกศรขึ้นสีเขียว) */
      q.classList.toggle('is-up', d.change >= 0); q.classList.toggle('is-down', d.change < 0); q.classList.remove('is-flat'); }
  }
  /* ป้ายกิจกรรมถัดไป: กิจกรรมที่ใกล้ถึงที่สุดนับจากวันนี้ (ไม่แสดงถ้าไม่มี) */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const asof = $('asof');
  if (asof) {
    if (d.asOf) {
      asof.dateTime = d.asOf;
      asof.textContent = new Date(d.asOf).toLocaleString(EN ? 'en-GB' : 'th-TH-u-ca-buddhist', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + (EN ? ' (GMT+7)' : ' น.');
    } else asof.textContent = EN ? 'Awaiting data' : 'รอข้อมูล';
  }
})();
