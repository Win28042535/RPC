/* include.js — ฝัง header / footer ตอนโหลดหน้า (ไม่ต้องรัน build.py)
   partial เป็นไฟล์ HTML ปกติ: partials/header.html · header-en.html · footer.html · footer-en.html — แก้ไฟล์เดียว ทุกหน้าเปลี่ยนตาม
   ดึงไฟล์แบบ synchronous (XHR) แล้วเขียนลงหน้า ณ ตำแหน่งที่เรียก → DOM พร้อมก่อน main.js / menu.js ทำงาน (ไม่กระพริบ ไม่ต้องรอ)
   ใช้ในหน้า:
     <script src="assets/js/include.js"></script>        ← ใน <head>
     <script>rpcgInclude('header', 'business')</script>   ← ชื่อ partial + KEY เมนูที่ไฮไลต์ (data-key · ไม่ใส่ = ไม่ไฮไลต์) · หน้า EN ใช้ 'header-en'
     <script>rpcgInclude('footer')</script>               ← หน้า EN ใช้ 'footer-en'
   ข้อจำกัด: ต้องเปิดผ่าน server (http/https) — เปิดไฟล์ตรง file:// เบราว์เซอร์บล็อกการอ่านไฟล์ partial
             ตอนทำงานในเครื่องใช้ Live Server (VS Code) หรือ  python3 -m http.server  */
(function () {
  var P = {}; /* cache ต่อหน้า */
  /* หน้าที่ไม่มีในเมนูโดยตรง → ไฮไลต์รายการเมนูแม่แทน */
  var ALIAS = { 'unsub-email-alert.html': 'e-mail-alert.html', 'read-detail.html': 'news-update.html' };
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  function currentPage() {
    var p = decodeURIComponent(location.pathname.split('/').pop() || '');
    return p || 'index.html';
  }

  /* รายการเมนูของหน้าปัจจุบัน: ใส่ .is-current + aria-current และเปิดกลุ่มเมนูมือถือ (<details class="ir-group">) ที่มีหน้านั้น */
  function markCurrent(html, page) {
    var en = /-en\.html$/.test(page);
    var base = en ? page.slice(0, -8) + '.html' : page;
    var target = ALIAS[base];
    var exact = !target;
    if (target) target = en && target !== 'news-update.html' ? target.slice(0, -5) + '-en.html' : target;
    else target = page;
    html = html.replace(new RegExp('<a [^>]*href="' + esc(target) + '"[^>]*>', 'g'), function (attrs) {
      if (/class="[^"]*(rpcg-logo|nav-link|button)/.test(attrs) || attrs.indexOf('aria-current') > -1) return attrs;
      var cur = ' aria-current="' + (exact ? 'page' : 'true') + '"';
      if (attrs.indexOf('class="') > -1) attrs = attrs.replace(/class="([^"]*)"/, function (_, c) { return 'class="' + c + ' is-current"'; });
      else attrs = attrs.replace('<a ', '<a class="is-current" ');
      return attrs.slice(0, -1) + cur + '>';
    });
    return html.replace(/<details class="ir-group">((?:(?!<\/details>)[\s\S])*?is-current)/g, '<details class="ir-group" open>$1');
  }

  function load(name) {
    if (P[name] != null) return P[name];
    var x = new XMLHttpRequest();
    try { x.open('GET', 'partials/' + name + '.html', false); x.send(); } catch (e) { return null; }
    if (x.status && x.status >= 400) return null;
    var h = x.responseText || '';
    if (!h) return null;
    h = h.replace(/^\s*<!--[\s\S]*?-->\s*/, '').replace(/^\n+|\n+$/g, ''); /* ตัดคอมเมนต์หัวไฟล์ */
    return (P[name] = h);
  }

  function render(name, active) {
    var html = load(name);
    if (html == null) {
      console.error('include.js: โหลด partials/' + name + '.html ไม่ได้ — ต้องเปิดผ่าน server (เช่น Live Server / python3 -m http.server) ไม่ใช่ file://');
      return name === 'header' || name === 'header-en'
        ? '<div style="padding:12px 16px;background:#fff3cd;color:#664d03;font:16px/1.5 sans-serif">โหลดเมนูไม่ได้: กรุณาเปิดผ่าน server (เช่น Live Server) ไม่ใช่เปิดไฟล์ตรง</div>' : '';
    }
    var page = currentPage();
    if (active) {
      html = html.replace(new RegExp('<a class="(nav-link(?: [^"]*)?)"( href="[^"]*"(?: [\\w-]+="[^"]*")*? data-key="' + esc(active) + '")', 'g'),
        '<a class="$1 active"$2 aria-current="page"');
    }
    /* ลิงก์ที่ชี้หน้าเดียวกัน (index.html#about ในหน้า index.html) → #about เพื่อให้เลื่อนแบบ smooth */
    html = html.split('href="' + page + '#').join('href="#');
    return markCurrent(html, page);
  }

  window.rpcgInclude = function (name, active) { document.write(render(name, active)); };
})();
