"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Choice = { prompt: string; options: string[]; answer: number; why: string; hint: string };
type Lesson = {
  id: number; icon: string; kicker: string; title: string; question: string; color: string;
  concepts: string[]; cards: { tag: string; title: string; text: string }[];
  tool: { title: string; intro: string; items: string[] };
  challenges: Choice[]; scenario: Choice;
};

const prerequisites: Choice[] = [
  { prompt: "臺灣位在哪一洲？", options: ["亞洲", "歐洲", "美洲"], answer: 0, why: "臺灣在亞洲大陸東側。", hint: "觀察世界地圖，先找到亞洲。" },
  { prompt: "日本大致位在臺灣的哪個方向？", options: ["東北方", "西南方", "正西方"], answer: 0, why: "以臺灣為中心，日本大致在東北方。", hint: "先找北方，再看日本的位置。" },
  { prompt: "哪一種工具出現得較早？", options: ["打製石器", "鐵器", "現代機器"], answer: 0, why: "先民先以敲擊方式製作石器，之後才出現磨製石器與鐵器。", hint: "想想人們最早能直接取得的材料。" },
];

const lessons: Lesson[] = [
  {
    id: 1, icon: "◎", kicker: "任務 01・海洋與位置", title: "海島導航站", color: "blue",
    question: "臺灣的位置如何影響氣候、生物與人們的生活？",
    concepts: ["海陸位置", "季風", "寒暖流", "候鳥遷徙"],
    cards: [
      { tag: "位置", title: "站在海陸交會處", text: "臺灣島位在亞洲大陸東側、太平洋西側，鄰近東北亞與東南亞。四面環海的位置有利航運、交流與貿易。" },
      { tag: "氣候", title: "兩種季風的訊息", text: "冬季東北季風使北部、東北部溼冷多雨；夏季西南季風帶來溫暖潮溼氣流，使全臺溼熱多雨。" },
      { tag: "遷徙", title: "跟著海流與季節", text: "冬季烏魚隨寒流南下，春夏黑鮪魚隨暖流北上；黑面琵鷺則在天氣轉冷時來臺度冬。" },
    ],
    tool: { title: "羅盤探究：從位置找影響", intro: "把線索依序連起來：位置不是地圖上的一個點，它會帶來一連串影響。", items: ["亞洲東側、太平洋西側", "海運交流方便", "文化與產業發展", "寒暖流交會、生物豐富"] },
    challenges: [
      { prompt: "從高雄港前往新加坡，最可能先航向哪個區域？", options: ["臺灣海峽與南海", "大西洋", "北冰洋"], answer: 0, why: "高雄在臺灣西南側，往新加坡會經臺灣海峽南部與南海。", hint: "找臺灣西南方與東南亞之間的海域。" },
      { prompt: "新竹居民利用冬季強風和日晒製作柿餅，主要適應哪種季風？", options: ["東北季風", "西南季風", "沒有季風"], answer: 0, why: "新竹冬季受東北季風影響，強風有助柿子乾燥保存。", hint: "關鍵詞是「冬季」和「強風」。" },
      { prompt: "黑面琵鷺通常何時飛來臺灣度冬？", options: ["9～10 月轉冷時", "6～8 月最熱時", "全年完全不移動"], answer: 0, why: "牠們在 9～10 月氣溫下降時南飛來臺，隔年 3～5 月北返。", hint: "「度冬」表示要在天氣轉冷時南飛。" },
    ],
    scenario: { prompt: "七股候鳥棲地旁要增設大型停車場，哪個方案較能兼顧需求？", options: ["先調查候鳥、居民與交通需求，再規畫低干擾接駁", "立刻填平溼地", "只聽遊客意見"], answer: 0, why: "先蒐集不同證據並評估替代方案，才能兼顧生態、居民與遊客。", hint: "好的公共決策要看證據，也要照顧不同角色。" },
  },
  {
    id: 2, icon: "◆", kicker: "任務 02・遺物與推論", title: "地下證據室", color: "ochre",
    question: "沒有文字紀錄時，怎樣從遺物推論史前生活？",
    concepts: ["考古證據", "史前分期", "農業聚落", "跨海交流"],
    cards: [
      { tag: "舊石器", title: "長濱：海邊的生活", text: "人們住在海濱洞穴，採集、狩獵、捕捉海中生物，已知用火，並敲擊石頭製作打製石器。" },
      { tag: "新石器", title: "卑南：聚落長大了", text: "人們使用磨製石器和陶器，種植芋頭、稻米並飼養家畜。食物來源穩定，人口增加並形成聚落。" },
      { tag: "金屬器", title: "十三行：鐵與遠方", text: "人們已會煉鐵製作農具。遺址中的琉璃珠與海外出土的臺灣玉，顯示當時已有跨海交易。" },
    ],
    tool: { title: "時間軸探究：工具如何改變", intro: "依教材提供的大致年代，觀察工具、食物取得與聚落的變化。", items: ["距今約 5 萬年前：打製石器、用火", "約 7,000 年前：磨製石器、農業聚落", "約 2,500 年前：煉鐵、鐵製農具", "器物交流：島內流通並跨越海洋"] },
    challenges: [
      { prompt: "哪一組配對正確？", options: ["長濱—打製石器", "卑南—煉鐵作坊", "十三行—海濱洞穴"], answer: 0, why: "長濱遺址屬舊石器時代，以打製石器為重要線索。", hint: "先找最早期、以敲擊製作的工具。" },
      { prompt: "卑南遺址出土大量石刀與石板棺，可以支持哪個推論？", options: ["已有農業與較大聚落", "完全沒有工具", "只靠現代機器生活"], answer: 0, why: "石刀可收割作物，二千多具石板棺顯示當地已有較大規模聚落。", hint: "把「農具」和「大量墓葬」分別連到生活線索。" },
      { prompt: "十三行的琉璃珠與東南亞出土的臺灣玉，最能證明什麼？", options: ["已有跨海交流與交易", "海洋完全阻隔人群", "所有器物都在原地製作"], answer: 0, why: "不同來源的器物跨地區出土，顯示人們具備航海與交換能力。", hint: "問問自己：器物為什麼會出現在很遠的地方？" },
    ],
    scenario: { prompt: "校園工程挖到石器與陶片，第一步怎麼做？", options: ["暫停附近施工、保護現場並通知文化資產單位", "帶回家收藏", "繼續挖土並丟掉"], answer: 0, why: "保留遺物的位置與文化層關係，考古人員才能取得可靠證據。", hint: "遺物在哪裡被發現，本身也是重要證據。" },
  },
  {
    id: 3, icon: "✤", kicker: "任務 03・文化與永續", title: "山海共生議會", color: "green",
    question: "原住民族文化如何展現與自然共存的智慧？",
    concepts: ["季節規範", "狩獵禁忌", "共享互助", "就地取材"],
    cards: [
      { tag: "海洋", title: "飛魚要留給明年", text: "雅美族（達悟族）的飛魚文化規範捕撈與食用季節，不把飛魚一網打盡，讓海洋資源持續繁衍。" },
      { tag: "山林", title: "獵人也守護生命", text: "泰雅族只在特定季節狩獵，遵守不獵殺幼小動物等禁忌，兼顧狩獵傳統與生態平衡。" },
      { tag: "部落", title: "一起做，比一個人更好", text: "泰雅族以竹木建屋、製器和引水，也透過共食與共勞分享獵物、互助建屋，凝聚部落。" },
    ],
    tool: { title: "因果鏈探究：規範帶來什麼", intro: "文化規範不是單一命令，而是讓資源、生活與群體都能延續的設計。", items: ["限制捕撈或狩獵季節", "動物獲得繁殖時間", "資源不易枯竭", "文化與部落持續傳承"] },
    challenges: [
      { prompt: "不把飛魚一網打盡，最主要的長期效果是什麼？", options: ["讓飛魚持續繁衍", "立刻捕到最多魚", "讓海洋沒有生物"], answer: 0, why: "保留部分成魚與幼魚，族群才有機會繁殖並延續。", hint: "想想「明年還有沒有魚」。" },
      { prompt: "泰雅族不獵殺幼小動物，反映哪一種智慧？", options: ["讓動物成長繁殖，維持生態平衡", "只追求眼前收穫", "完全不了解山林"], answer: 0, why: "保護幼小動物能維持族群數量，也讓狩獵傳統長久延續。", hint: "幼小動物長大後才能繁殖。" },
      { prompt: "共食與共勞為部落帶來什麼力量？", options: ["分享資源、互助合作並凝聚族群", "每個人彼此隔離", "資源只由一人占有"], answer: 0, why: "共享獵物、互助建屋能照顧成員，也使部落更穩定。", hint: "「共」表示大家一起。" },
    ],
    scenario: { prompt: "部落附近動物數量減少，哪個做法最合適？", options: ["會議訂定休獵期、保護幼獸並持續觀察", "增加全年獵捕", "不調查就責怪別人"], answer: 0, why: "休獵、保護幼獸和持續觀察，能兼顧文化傳承與生態恢復。", hint: "找一個能讓動物恢復，也讓文化延續的方法。" },
  },
];

const quiz: (Choice & { concept: string })[] = [
  { prompt: "臺灣的海陸位置是？", options: ["亞洲東側、太平洋西側", "歐洲西側、大西洋東側", "非洲北側、北冰洋南側"], answer: 0, why: "臺灣位於亞洲大陸東側、太平洋西側。", hint: "回想海島導航站。", concept: "海陸位置" },
  { prompt: "臺灣鄰近東北亞與東南亞，對發展有何影響？", options: ["有利航運、交流與貿易", "完全無法與外界接觸", "只能發展高山交通"], answer: 0, why: "四面環海且位置適中，有利航向東亞各地。", hint: "想想海洋是道路還是牆。", concept: "位置與交流" },
  { prompt: "冬季東北季風為臺灣北部帶來什麼天氣？", options: ["溼冷且容易降雨", "全年乾熱", "完全無風"], answer: 0, why: "東北季風經海洋吸收水氣，使北部、東北部溼冷多雨。", hint: "風經過海洋會帶來水氣。", concept: "季風" },
  { prompt: "冬季烏魚會隨什麼移動？", options: ["南下寒流", "北上暖流", "西南季風"], answer: 0, why: "烏魚冬季隨寒流南下，前往臺灣西南沿海產卵。", hint: "冬季水溫較低。", concept: "寒暖流" },
  { prompt: "七股溼地對黑面琵鷺的重要性是？", options: ["提供度冬棲地與食物", "提供煉鐵場所", "是玉器產地"], answer: 0, why: "魚塭、潟湖與鹽田溼地提供候鳥棲地與食物。", hint: "黑面琵鷺是候鳥。", concept: "候鳥棲地" },
  { prompt: "沒有文字紀錄的年代稱為？", options: ["史前時代", "資訊時代", "太空時代"], answer: 0, why: "沒有文字紀錄的年代稱為史前時代。", hint: "考古學家靠遺物與遺跡研究。", concept: "史前時代" },
  { prompt: "長濱遺址人們的重要工具是？", options: ["打製石器", "鐵製鋤頭", "蒸汽機"], answer: 0, why: "長濱遺址人們敲擊石頭，製作打製石器。", hint: "這是三個時期中最早的一個。", concept: "舊石器" },
  { prompt: "新石器時代食物來源穩定後，帶來什麼變化？", options: ["人口成長並形成聚落", "所有人離開臺灣", "不再製作任何工具"], answer: 0, why: "農耕與飼養使食物穩定，帶動人口與聚落發展。", hint: "穩定食物能養活更多人。", concept: "農業聚落" },
  { prompt: "十三行遺址的煉鐵作坊可證明？", options: ["人們已會製造鐵器", "人們只會打製石器", "當時已有電腦"], answer: 0, why: "煉鐵作坊是製造鐵器技術的直接證據。", hint: "找與「煉鐵」直接相關的推論。", concept: "金屬器" },
  { prompt: "臺灣玉出現在東南亞遺址，說明海洋可能是？", options: ["交流與移動的道路", "永遠無法跨越的阻隔", "與生活完全無關"], answer: 0, why: "玉器跨海分布，顯示人們已能航海、移動與交易。", hint: "器物已跨越海洋。", concept: "跨海交流" },
  { prompt: "雅美族（達悟族）規範飛魚季的目的之一是？", options: ["維持海洋生態平衡", "捕盡所有飛魚", "停止所有文化活動"], answer: 0, why: "季節規範與不趕盡捕撈能讓飛魚繁衍。", hint: "關鍵是資源能長久使用。", concept: "飛魚文化" },
  { prompt: "泰雅族的哪項禁忌有助生態平衡？", options: ["不獵殺幼小動物", "全年無限制狩獵", "丟棄所有獵物"], answer: 0, why: "保護幼小動物能讓動物成長與繁殖。", hint: "哪一項會留下繁殖機會？", concept: "狩獵禁忌" },
  { prompt: "泰雅族用竹子建屋、製器，展現什麼？", options: ["就地取材", "跨洋進口", "浪費資源"], answer: 0, why: "利用生活環境中的竹木，是就地取材的智慧。", hint: "材料就在周遭自然環境。", concept: "就地取材" },
  { prompt: "共食、共勞最能說明哪種文化？", options: ["共享互助", "彼此競爭", "個人壟斷"], answer: 0, why: "分享獵物、互助建屋能穩定部落並凝聚族群。", hint: "注意兩個詞都有「共」。", concept: "共享互助" },
  { prompt: "規畫永續方案時，最重要的思考是？", options: ["根據證據兼顧不同角色與長期影響", "只看眼前方便", "不需要了解問題"], answer: 0, why: "社會問題需要證據、不同觀點與長期影響一起評估。", hint: "好的決策不只照顧單一需求。", concept: "永續決策" },
];

const STORE = "taiwan-time-explorer-v1";
type Saved = { correct: Record<string, boolean>; quizBest: number; quizAnswers: number[]; name: string };
const emptySaved: Saved = { correct: {}, quizBest: 0, quizAnswers: Array(15).fill(-1), name: "" };

function ChoiceTask({ item, taskKey, saved, setSaved, unscored = false }: { item: Choice; taskKey: string; saved: Saved; setSaved: React.Dispatch<React.SetStateAction<Saved>>; unscored?: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const isCorrect = picked === item.answer;
  const already = !!saved.correct[taskKey];
  function choose(index: number) {
    setPicked(index);
    if (index === item.answer && !unscored) setSaved(s => ({ ...s, correct: { ...s.correct, [taskKey]: true } }));
  }
  return <div className={`choice-task ${already ? "is-complete" : ""}`}>
    <div className="task-heading"><span>{already ? "✓ 已完成" : unscored ? "暖身練習" : "等待解鎖"}</span></div>
    <h4>{item.prompt}</h4>
    <div className="choice-grid">{item.options.map((option, i) => <button key={option} className={picked === i ? (isCorrect ? "right" : "wrong") : ""} onClick={() => choose(i)}>{String.fromCharCode(65 + i)}. {option}</button>)}</div>
    {picked !== null && <p className={`feedback ${isCorrect ? "good" : "try"}`} role="status">{isCorrect ? `答對了！${item.why}` : `再想想：${item.hint}`}</p>}
  </div>;
}

function makeCertificate(name: string, score: number) {
  const canvas = document.createElement("canvas"); canvas.width = 1600; canvas.height = 1100;
  const c = canvas.getContext("2d")!; c.fillStyle = "#fffaf0"; c.fillRect(0, 0, 1600, 1100);
  c.strokeStyle = "#0f766e"; c.lineWidth = 28; c.strokeRect(35, 35, 1530, 1030); c.strokeStyle = "#f4c95d"; c.lineWidth = 5; c.strokeRect(70, 70, 1460, 960);
  c.textAlign = "center"; c.fillStyle = "#075985"; c.font = "700 42px sans-serif"; c.fillText("TAIWAN TIME EXPLORER", 800, 190);
  c.font = "900 82px sans-serif"; c.fillText("臺灣時空探險隊結業證書", 800, 320);
  c.fillStyle = "#49656b"; c.font = "34px sans-serif"; c.fillText("恭喜", 800, 410);
  c.fillStyle = "#083344"; c.font = "900 72px sans-serif"; c.fillText(name, 800, 515);
  c.fillStyle = "#49656b"; c.font = "34px sans-serif"; c.fillText("完成《臺灣的位置與先民足跡》全部任務", 800, 610); c.fillText("能以地圖、考古證據與生態智慧讀懂臺灣", 800, 670);
  c.fillStyle = "#f9735b"; c.font = "900 50px sans-serif"; c.fillText(`單元測驗最高成績 ${score} 分`, 800, 765);
  const date = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(new Date()); const cert = `TW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  c.fillStyle = "#49656b"; c.font = "26px sans-serif"; c.fillText(`完成日期：${date}`, 800, 875); c.font = "22px monospace"; c.fillText(`證書編號：${cert}`, 800, 930);
  const data = atob(canvas.toDataURL("image/jpeg", .92).split(",")[1]); const bytes = new Uint8Array(data.length); for (let i=0;i<data.length;i++) bytes[i]=data.charCodeAt(i);
  const enc = new TextEncoder(); const parts: Uint8Array[] = []; let pos = 0; const offsets: number[] = [0]; const add=(s:string|Uint8Array)=>{const b=typeof s==="string"?enc.encode(s):s;parts.push(b);pos+=b.length};
  add("%PDF-1.4\n"); const obj=(n:number, body:string|Uint8Array[])=>{offsets[n]=pos;add(`${n} 0 obj\n`); if(Array.isArray(body)) body.forEach(add); else add(body); add("\nendobj\n")};
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>"); obj(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>"); obj(3,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
  obj(4,[`<< /Type /XObject /Subtype /Image /Width 1600 /Height 1100 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`,bytes,"\nendstream"]);
  const stream="q 842 0 0 579 0 8 cm /Im0 Do Q"; obj(5,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`); const xref=pos; add("xref\n0 6\n0000000000 65535 f \n"); for(let i=1;i<=5;i++) add(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`); add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const blob=new Blob(parts,{type:"application/pdf"}); const url=URL.createObjectURL(blob); const a=document.createElement("a");a.href=url;a.download=`臺灣時空探險隊-${name}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export default function Home() {
  const [saved, setSaved] = useState<Saved>(emptySaved); const [ready, setReady] = useState(false); const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(15).fill(-1)); const [quizResult, setQuizResult] = useState<number | null>(null);
  useEffect(() => { const timer=window.setTimeout(() => { try { const raw=localStorage.getItem(STORE); if(raw){const value={...emptySaved,...JSON.parse(raw)};setSaved(value);setQuizAnswers(value.quizAnswers || Array(15).fill(-1));} } catch { localStorage.removeItem(STORE); } setReady(true); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if(ready) localStorage.setItem(STORE,JSON.stringify(saved)); }, [saved,ready]);
  const lessonDone = lessons.map(l => l.challenges.every((_,i)=>saved.correct[`l${l.id}c${i}`]) && saved.correct[`l${l.id}s`]);
  const completed = Object.values(saved.correct).filter(Boolean).length; const progress = Math.round(completed / 12 * 100); const eligible = lessonDone.every(Boolean) && saved.quizBest >= 80;
  const review = useMemo(() => quiz.filter((_,i)=>quizAnswers[i]!==-1 && quizAnswers[i]!==quiz[i].answer).map(q=>q.concept).filter((v,i,a)=>a.indexOf(v)===i), [quizAnswers]);
  function submitQuiz(){if(quizAnswers.some(a=>a<0)){setQuizResult(-1);return;}const score=Math.round(quizAnswers.filter((a,i)=>a===quiz[i].answer).length/15*100);setQuizResult(score);setSaved(s=>({...s,quizBest:Math.max(s.quizBest,score),quizAnswers}));}
  return <main>
    <section className="hero" aria-labelledby="hero-title"><nav className="topbar" aria-label="主要導覽"><a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">島</span><span>臺灣時空探險隊</span></a><div className="nav-links"><a href="#missions">任務地圖</a><a href="#quiz">單元測驗</a><a href="#finish">結業站</a></div><span className="progress-pill">探索進度 {progress}%</span></nav>
      <div className="hero-grid" id="top"><div className="hero-copy"><p className="eyebrow">五年級社會・第一單元</p><h1 id="hero-title">讀懂一座島，<br/><em>找到我們的足跡。</em></h1><p className="lead">從海洋位置、地下遺物到山林智慧，蒐集三枚證據徽章，完成守護臺灣的時空任務。</p><a className="primary-button" href="#base">開始探險 <span aria-hidden="true">→</span></a><p className="privacy-note">免登入即可學習・進度只保存在這個裝置</p></div>
        <figure className="hero-art"><Image src="/og.png" alt="臺灣時空探險隊主視覺：臺灣島結合海洋、考古地層、山林、陶片與玉器，主題為位置、足跡與共生智慧" width={1733} height={909} priority/><figcaption>從海洋到山林，沿著證據讀懂臺灣。</figcaption></figure></div><div className="wave" aria-hidden="true"/></section>

    <section className="section base-section" id="base"><div className="section-heading"><div><p className="eyebrow dark">出發前・不計分</p><h2>先備基地</h2></div><p>先確認方向、地圖和時間感。答錯沒關係，提示會帶你找到線索。</p></div><div className="warmups">{prerequisites.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`p${i}`} saved={saved} setSaved={setSaved} unscored/>)}</div></section>

    <section className="mission-overview" id="missions"><div><p className="eyebrow">探索地圖</p><h2>三座任務站</h2><p>每站完成三項證據挑戰與一題生活決策，就能獲得一枚徽章。</p><a className="next-unit-link" href="/unit2">接續第二單元：臺灣登上國際舞臺 →</a></div><div className="badge-row">{lessons.map((l,i)=><a key={l.id} href={`#lesson-${l.id}`} className={lessonDone[i]?"badge won":"badge"}><span>{lessonDone[i]?"✓":l.icon}</span><b>{l.title}</b><small>{lessonDone[i]?"徽章已取得":"等待探索"}</small></a>)}</div></section>

    {lessons.map((lesson,li)=><section className={`lesson lesson-${lesson.color}`} id={`lesson-${lesson.id}`} key={lesson.id}><div className="section lesson-inner"><header className="lesson-header"><div className="lesson-number">0{lesson.id}</div><div><p className="eyebrow dark">{lesson.kicker}</p><h2>{lesson.title}</h2><p>{lesson.question}</p></div><div className={`big-badge ${lessonDone[li]?"won":""}`}>{lessonDone[li]?"✓":lesson.icon}<small>{lessonDone[li]?"完成":"進行中"}</small></div></header>
      <div className="concept-strip">{lesson.concepts.map(c=><span key={c}>{c}</span>)}</div><div className="cards">{lesson.cards.map((c,i)=><article className="knowledge-card" key={c.title}><span className="card-count">0{i+1}</span><p className="card-tag">{c.tag}</p><h3>{c.title}</h3><p>{c.text}</p></article>)}</div>
      <div className="inquiry"><div className="tool-copy"><p className="eyebrow dark">探究工具</p><h3>{lesson.tool.title}</h3><p>{lesson.tool.intro}</p></div><ol>{lesson.tool.items.map((x,i)=><li key={x}><span>{i+1}</span>{x}</li>)}</ol></div>
      <div className="challenge-zone"><div className="zone-heading"><p className="eyebrow dark">證據挑戰</p><h3>用剛才的線索完成 3 關</h3></div>{lesson.challenges.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`l${lesson.id}c${i}`} saved={saved} setSaved={setSaved}/>)}</div>
      <div className="scenario"><div className="scenario-label">生活決策室</div><ChoiceTask item={lesson.scenario} taskKey={`l${lesson.id}s`} saved={saved} setSaved={setSaved}/></div>
    </div></section>)}

    <section className="section quiz-section" id="quiz"><div className="section-heading"><div><p className="eyebrow dark">最後檢核・可不限次重試</p><h2>15 題單元測驗</h2></div><div className="score-orb"><span>{saved.quizBest}</span><small>最高分</small></div></div><p className="quiz-note">三課平均出題。請完成全部題目再送出，送出後會看到解析與複習方向。</p><div className="quiz-list">{quiz.map((q,i)=><fieldset key={q.prompt}><legend><span>{String(i+1).padStart(2,"0")}</span>{q.prompt}</legend>{q.options.map((o,j)=><label key={o} className={quizAnswers[i]===j?"selected":""}><input type="radio" name={`q${i}`} checked={quizAnswers[i]===j} onChange={()=>setQuizAnswers(a=>a.map((v,k)=>k===i?j:v))}/>{o}</label>)}{quizResult!==null&&quizResult>=0&&<p className={quizAnswers[i]===q.answer?"explain correct":"explain incorrect"}>{quizAnswers[i]===q.answer?"✓":"→"} {q.why}</p>}</fieldset>)}</div><button className="submit-button" onClick={submitQuiz}>送出 15 題答案</button>{quizResult===-1&&<p className="feedback try" role="alert">還有題目沒完成，請檢查每一題。</p>}{quizResult!==null&&quizResult>=0&&<div className={`result-panel ${quizResult>=80?"pass":"review"}`} role="status"><span className="result-score">{quizResult}</span><div><h3>{quizResult>=80?"通過挑戰！":"再複習一次就更穩了"}</h3><p>{quizResult>=80?"已達 80 分門檻。確認三課任務完成後，即可領取證書。":`建議複習：${review.join("、") || "錯題解析"}。你可以回到任務站，再重新挑戰。`}</p></div></div>}</section>

    <section className="finish" id="finish"><div className="section finish-grid"><div><p className="eyebrow">結業站</p><h2>{eligible?"證據齊全，準備領證！":"最後一步，正在等你。"}</h2><p className="finish-lead">{eligible?"你已完成所有任務與情境題，也通過單元測驗。輸入姓名，下載只屬於你的橫式 PDF 證書。":"完成三枚任務徽章，並讓測驗最高分達到 80 分，就能解鎖證書。"}</p><div className="checklist">{lessonDone.map((done,i)=><p key={i} className={done?"done":""}><span>{done?"✓":"○"}</span>{lessons[i].title}：任務與生活決策</p>)}<p className={saved.quizBest>=80?"done":""}><span>{saved.quizBest>=80?"✓":"○"}</span>單元測驗最高分達 80 分</p></div></div>
      <div className="certificate-card"><div className="cert-mark">探險隊</div><p>學習回饋</p><h3>{saved.name||"你的名字"}</h3><p>{completed===12?"你能運用位置、證據與永續觀點理解臺灣。":`已完成 ${completed}／12 項任務，下一步前往尚未取得的徽章。`}</p><label>證書姓名<input value={saved.name} maxLength={20} placeholder="請輸入真實姓名" onChange={e=>setSaved(s=>({...s,name:e.target.value}))}/></label><button disabled={!eligible||!saved.name.trim()} onClick={()=>makeCertificate(saved.name.trim(),saved.quizBest)}>下載 PDF 證書</button><small>姓名僅用於本機產生證書，不會上傳。</small></div></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">島</span><span>臺灣時空探險隊</span></a><p>依據教材概念重新設計，未重製課本頁面與插圖。</p><button onClick={()=>{if(confirm("確定要清除這個裝置上的學習進度嗎？")){localStorage.removeItem(STORE);location.reload();}}}>清除本機進度</button></footer>
  </main>;
}
