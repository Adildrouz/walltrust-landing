import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import WidgetConfig from "@/models/WidgetConfig";
import User from "@/models/User";
import { PLAN_LIMITS } from "@/lib/utils";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

type Params = { params: { userId: string } };

export async function GET(_req: Request, { params }: Params) {
  await connectDB();

  const [user, config] = await Promise.all([
    User.findById(params.userId).select("plan username name"),
    WidgetConfig.findOne({ userId: params.userId }),
  ]);

  const cfg = {
    style: config?.style ?? "grid",
    colorBg: config?.colorBg ?? "#ffffff",
    colorText: config?.colorText ?? "#0f172a",
    colorAccent: config?.colorAccent ?? "#3730a3",
    showRating: config?.showRating ?? true,
    showAvatar: config?.showAvatar ?? true,
    maxItems: config?.maxItems ?? 6,
    minRating: config?.filterMinRating ?? 1,
  };

  const query: Record<string, unknown> = {
    userId: params.userId,
    status: "approved",
  };
  if (cfg.minRating > 1) query.rating = { $gte: cfg.minRating };

  const testimonials = await Testimonial.find(query)
    .sort({ featured: -1, approvedAt: -1 })
    .limit(cfg.maxItems)
    .select("authorName authorTitle authorCompany authorAvatar text rating photo")
    .lean();

  const hasBranding = user ? PLAN_LIMITS[user.plan].hasBranding : true;

  const data = {
    cfg,
    testimonials: testimonials.map((t) => ({
      authorName: t.authorName,
      authorTitle: t.authorTitle || "",
      authorCompany: t.authorCompany || "",
      authorAvatar: t.authorAvatar || "",
      text: t.text,
      rating: t.rating || 0,
      photo: t.photo || "",
    })),
    branding: hasBranding,
    baseUrl: BASE_URL,
  };

  const js = buildWidgetScript(data);

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function buildWidgetScript(data: unknown): string {
  // JSON is embedded into a JS string that runs in the browser.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `(function(){
  var DATA = ${json};
  var cfg = DATA.cfg, items = DATA.testimonials;
  var mount = document.getElementById('walltrust-widget');
  if (!mount) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}
  function stars(n){
    if(!cfg.showRating||!n) return '';
    var s='<div class="wt-stars" aria-label="'+n+' out of 5">';
    for(var i=1;i<=5;i++){s+='<span class="wt-star'+(i<=n?' on':'')+'">\\u2605</span>';}
    return s+'</div>';
  }
  function avatar(t){
    if(!cfg.showAvatar) return '';
    if(t.authorAvatar) return '<img class="wt-avatar" src="'+esc(t.authorAvatar)+'" alt="'+esc(t.authorName)+'" loading="lazy"/>';
    var initial = (t.authorName||'?').charAt(0).toUpperCase();
    return '<div class="wt-avatar wt-avatar-fallback">'+esc(initial)+'</div>';
  }
  function meta(t){
    var sub = [t.authorTitle, t.authorCompany].filter(Boolean).join(', ');
    return '<div class="wt-meta">'+avatar(t)+'<div><div class="wt-name">'+esc(t.authorName)+'</div>'+
      (sub?'<div class="wt-sub">'+esc(sub)+'</div>':'')+'</div></div>';
  }
  function card(t){
    return '<figure class="wt-card">'+stars(t.rating)+
      '<blockquote class="wt-text">'+esc(t.text)+'</blockquote>'+
      (t.photo?'<img class="wt-photo" src="'+esc(t.photo)+'" alt="" loading="lazy"/>':'')+
      meta(t)+'</figure>';
  }

  var css = ''
    + '#walltrust-widget{--wt-bg:'+cfg.colorBg+';--wt-text:'+cfg.colorText+';--wt-accent:'+cfg.colorAccent+';font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--wt-text);box-sizing:border-box}'
    + '#walltrust-widget *,#walltrust-widget *::before,#walltrust-widget *::after{box-sizing:border-box}'
    + '.wt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}'
    + '.wt-carousel{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}'
    + '.wt-carousel .wt-card{min-width:300px;scroll-snap-align:start}'
    + '.wt-single{max-width:560px;margin:0 auto}'
    + '.wt-card{background:var(--wt-bg);border:1px solid rgba(15,23,42,.08);border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 3px rgba(15,23,42,.06);margin:0}'
    + '.wt-stars{display:flex;gap:2px;font-size:16px;line-height:1}'
    + '.wt-star{color:rgba(15,23,42,.18)}.wt-star.on{color:var(--wt-accent)}'
    + '.wt-text{margin:0;font-size:15px;line-height:1.6}'
    + '.wt-photo{width:100%;border-radius:8px;object-fit:cover}'
    + '.wt-meta{display:flex;align-items:center;gap:10px;margin-top:auto}'
    + '.wt-avatar{width:40px;height:40px;border-radius:999px;object-fit:cover;flex:0 0 auto}'
    + '.wt-avatar-fallback{display:flex;align-items:center;justify-content:center;background:var(--wt-accent);color:#fff;font-weight:600;font-size:16px}'
    + '.wt-name{font-weight:600;font-size:14px}'
    + '.wt-sub{font-size:13px;opacity:.65}'
    + '.wt-badge{display:inline-flex;align-items:center;gap:8px;background:var(--wt-bg);border:1px solid rgba(15,23,42,.08);border-radius:999px;padding:8px 14px;box-shadow:0 1px 3px rgba(15,23,42,.06)}'
    + '.wt-badge b{font-size:15px}.wt-badge .wt-sub{font-size:12px}'
    + '.wt-powered{margin-top:14px;font-size:12px;opacity:.6;text-align:center}'
    + '.wt-powered a{color:var(--wt-accent);text-decoration:none}'
    + '.wt-empty{padding:24px;text-align:center;opacity:.6;font-size:14px}';

  function badge(){
    var rated = items.filter(function(t){return t.rating;});
    var avg = rated.length ? (rated.reduce(function(a,t){return a+t.rating;},0)/rated.length) : 0;
    return '<div class="wt-badge">'+(avg?stars(Math.round(avg)):'')+
      '<span><b>'+(avg?avg.toFixed(1):'New')+'</b> <span class="wt-sub">('+items.length+' review'+(items.length===1?'':'s')+')</span></span></div>';
  }

  var body;
  if(!items.length){
    body = '<div class="wt-empty">No testimonials yet.</div>';
  } else if(cfg.style==='badge'){
    body = badge();
  } else if(cfg.style==='single'){
    body = '<div class="wt-single">'+card(items[0])+'</div>';
  } else if(cfg.style==='carousel'){
    body = '<div class="wt-carousel"'+(reduce?'':' data-auto="1"')+'>'+items.map(card).join('')+'</div>';
  } else {
    body = '<div class="wt-grid">'+items.map(card).join('')+'</div>';
  }

  var powered = DATA.branding
    ? '<div class="wt-powered">Powered by <a href="'+DATA.baseUrl+'" target="_blank" rel="noopener">WallTrust</a></div>'
    : '';

  var style = document.createElement('style');
  style.textContent = css;
  mount.appendChild(style);
  var wrap = document.createElement('div');
  wrap.innerHTML = body + powered;
  mount.appendChild(wrap);

  // Gentle carousel auto-advance (respects reduced-motion)
  if(cfg.style==='carousel' && !reduce){
    var car = mount.querySelector('.wt-carousel');
    if(car){
      setInterval(function(){
        if(car.scrollLeft + car.clientWidth >= car.scrollWidth - 4){ car.scrollTo({left:0,behavior:'smooth'}); }
        else { car.scrollBy({left:316,behavior:'smooth'}); }
      }, 4000);
    }
  }
})();`;
}
