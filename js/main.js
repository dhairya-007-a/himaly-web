/* Himalay Thermoplast – site scripts */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const CAT="https://himalaythermoplast.com/catalogue-download/";/* swap for the direct PDF link */
const nv=$("nav"),mb=$("#mb"),cm=()=>{nv.classList.remove("open");mb.setAttribute("aria-expanded","false")};
mb.onclick=()=>mb.setAttribute("aria-expanded",nv.classList.toggle("open"));
$$("nav li a").forEach(a=>a.addEventListener("click",cm));
document.addEventListener("keydown",e=>{if(e.key==="Escape")cm()});
$("#sb").onclick=()=>{location.hash="#catalog";setTimeout(()=>$("#q").focus(),350)};
$("#q").oninput=e=>{const v=e.target.value.trim().toLowerCase();let n=0;$$(".tile").forEach(t=>{const s=t.dataset.n.includes(v);t.hidden=!s;if(s)n++});$("#cn").textContent=n?n+(n===1?" category":" categories"):"No categories found"};
const qi=$("#qi"),st=d=>{qi.value=Math.min(999,Math.max(1,(parseInt(qi.value,10)||1)+d))};
$("#qm").onclick=()=>st(-1);$("#qp").onclick=()=>st(1);qi.onchange=()=>st(0);
let col="Tide blue";
$$("#sw button").forEach(b=>b.onclick=()=>{$$("#sw button").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-pressed","false")});b.classList.add("on");b.setAttribute("aria-pressed","true");col=b.dataset.n;$("#cl").textContent=col;const m=$("#main");m.style.setProperty("--ph1",b.dataset.a);m.style.setProperty("--ph2",b.dataset.b)});
const dd=$("#dd"),enq=(t,p)=>{if(t)$("#ty").value=t;if(p)$("#pr").value=p;cm();dd.showModal()};
$$("[data-open]").forEach(b=>b.addEventListener("click",()=>enq(b.dataset.open||"Distributor")));
$("#dx").onclick=()=>dd.close();
dd.addEventListener("click",e=>{const r=dd.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dd.close()});
$$("[data-enq]").forEach(b=>b.onclick=()=>enq("Dealer",b.dataset.enq));
$("#eq").onclick=()=>enq("Dealer","Flower Pattern Dispenser, "+col+", qty "+qi.value);
$("#df").onsubmit=e=>{e.preventDefault();const f=e.target.elements,m=$("#dm"),a=document.createElement("a");m.textContent="Thank you, "+f.dn.value.trim()+". Your catalogue is ready.";a.className="btn";a.href=CAT;a.target="_blank";a.rel="noopener";a.textContent="Open the catalogue";m.append(document.createElement("br"),a);e.target.hidden=true};
$("#cf").onsubmit=e=>{e.preventDefault();const f=e.target.elements,t=["Enquiry: "+f.ty.value,"Name: "+f.nm.value,"Business: "+f.bz.value,"City: "+f.ct.value,"Phone: "+f.ph.value,"Email: "+f.em.value,"Product: "+f.pr.value,"","Message:",f.ms.value].join("\n");location.href="mailto:himalaythermoplast@gmail.com?subject="+encodeURIComponent("Himalay enquiry – "+f.ty.value)+"&body="+encodeURIComponent(t);$("#cs").textContent="Your email app should open with the enquiry filled in. If it does not, use WhatsApp or call +91 99790 11141."};

/* Scroll-reveal: fade+rise .tile / .four article / .new-grid article / .feat-inner div into view, staggered */
const revealItems = $$(".tile, .four > article, .new-grid > article, .feat-inner > div");
revealItems.forEach((el, i) => el.style.setProperty("--ri", i % 8));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealItems.forEach(el => io.observe(el));
} else {
  revealItems.forEach(el => el.classList.add("is-visible"));
}

/* HoverExpand_001 (Skiper 52) Interactive Accordion */
const expCards = document.querySelectorAll('.hover-expand-card');
expCards.forEach(c => {
  const onPick = () => {
    expCards.forEach(x => x.classList.remove('is-active'));
    c.classList.add('is-active');
  };
  c.addEventListener('mouseenter', onPick);
  c.addEventListener('click', onPick);
});
