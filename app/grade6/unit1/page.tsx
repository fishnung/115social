"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Choice = { prompt:string; options:string[]; answer:number; why:string; hint:string; cards?:number[] };
type Card = { tag:string; title:string; visual:string[]; text:string; bridge:string };
type Lesson = { id:number; icon:string; kicker:string; title:string; question:string; concepts:string[]; cards:Card[]; challenges:Choice[]; scenario:Choice };
type Saved = { correct:Record<string,boolean>; quizBest:number; quizAnswers:number[]; name:string };

const STORE = "taiwan-explorer-grade6-unit1-v1";
const emptySaved:Saved = { correct:{}, quizBest:0, quizAnswers:Array(15).fill(-1), name:"" };

const warmups:Choice[] = [
  { prompt:"買東西前，哪一個問題最能幫助你分辨『需要』與『想要』？", options:["現在沒有它，生活或學習會受到影響嗎？","廣告看起來熱鬧嗎？","同學都有買嗎？"], answer:0, why:"先看實際用途與急迫性，再決定是否購買。", hint:"先想物品是否能解決真正的生活或學習問題。" },
  { prompt:"購物後保留發票、收據或訂單紀錄，主要有什麼用途？", options:["讓錢花得更多","日後核對或退換貨時作為證明","讓商品變得更便宜"], answer:1, why:"交易證明能協助核對金額、保固與退換貨。", hint:"如果商品有問題，店家需要看什麼證明？" },
  { prompt:"想在 4 個月後存到 1,200 元，平均每月要存多少？", options:["200 元","250 元","300 元"], answer:2, why:"1,200 ÷ 4＝300，每月固定存 300 元可以達標。", hint:"把目標金額平均分成 4 份。" },
];

const lessons:Lesson[] = [
  { id:1, icon:"🧭", kicker:"第一課・消費選擇與權益", title:"消費偵探所", question:"如何做出兼顧預算、權益與環境的消費選擇？", concepts:["需要與想要","價格・品質・需求","消費安全","環境責任"], cards:[
    { tag:"判斷", title:"先停一下，再比較", visual:["🎯 確認需要","⚖️ 比價格品質","🧾 守住預算"], text:"廣告、折扣與方便付款都可能讓人衝動消費。先確認用途，再比較價格、品質與預算，才不會只看便宜或流行。", bridge:"看到限時折扣時，為什麼不能只問『省了多少』？" },
    { tag:"影響", title:"你的選擇會改變生產", visual:["🛒 需求改變","🏭 調整生產","💬 回饋再改進"], text:"消費者的需求與回饋會影響廠商開發商品、改變技術與生產數量；企業也會考量成本與市場反應。", bridge:"如果更多人選擇少糖、耐用商品，廠商可能怎麼做？" },
    { tag:"守護", title:"安全、權益與環境一起看", visual:["🔍 購前查資訊","🛡️ 留交易證明","♻️ 減量再使用"], text:"網購前看賣家信用、內容與退換貨規定；遇疑似詐騙可撥 165，消費爭議可洽 1950。耐用、維修、二手與再生材料也能減少浪費。", bridge:"商品出問題時，哪些資料能保護你？買得便宜一定最環保嗎？" },
  ], challenges:[
    { prompt:"耳機仍可正常使用，新款正在限時特價。哪個做法最聰明？", options:["因為特價立刻下單","先確認是否需要、比較品質並檢查預算","只看網紅推薦就購買"], answer:1, why:"折扣不是需求；先評估用途、品質與負擔能力。", hint:"把『需要、品質、預算』三個條件一起檢查。", cards:[0] },
    { prompt:"陌生賣家要求離開購物平台、私下轉帳才有優惠，應怎麼做？", options:["先停止交易並查證，必要時撥 165","趕快轉帳以免錯過","把帳號密碼也交給賣家"], answer:0, why:"離開平台會失去保障；可先查證並利用 165 防詐諮詢。", hint:"安全比折扣重要，想想哪個做法能保留平台保障。", cards:[2] },
    { prompt:"越來越多人想買少糖、包裝可回收的飲料，廠商最合理的回應是？", options:["忽略需求，永遠不改配方","只增加廣告，不檢查產品","評估成本與技術，試做新產品並蒐集回饋"], answer:2, why:"生產者會綜合需求、成本、技術與回饋調整商品。", hint:"需求不會自動變成商品，還要經過評估、試做與改進。", cards:[1] },
  ], scenario:{ prompt:"班上要訂活動上衣，哪個方案最能兼顧預算、使用與環境？", options:["挑最便宜但只能穿一次的材質","比較耐用度、價格與需求，選可重複穿且預算能負擔的款式","只選最貴的名牌"], answer:1, why:"同時考量價格、品質、真正需求與使用時間，才是較完整的決策。", hint:"不是最便宜或最貴就最好，要看能用多久與是否真的需要。", cards:[0,2] } },
  { id:2, icon:"📊", kicker:"第二課・理財規劃與風險", title:"未來規劃室", question:"如何分配金錢，並在報酬與風險之間做合適選擇？", concepts:["收支分配","儲蓄目標","理財工具","風險評估"], cards:[
    { tag:"分配", title:"先顧需要，再安排想要", visual:["🏠 必要支出","🎈 想要支出","🌱 儲蓄目標"], text:"收入有限時要排優先順序：先處理必要支出，再分配想要與儲蓄。目標要寫出金額、期限及每期存款。", bridge:"如果每一筆都花在想要，緊急需要出現時會怎樣？" },
    { tag:"工具", title:"不同任務，用不同工具", visual:["💧 活存可隨時用","🔒 定存約定期限","🛡️ 保險分擔衝擊"], text:"活期存款方便應急；短期不用的錢可評估定期存款；保險分擔重大事故衝擊。工具沒有絕對最好，要看目的。", bridge:"緊急預備金與半年後才要用的錢，適合放在同一處嗎？" },
    { tag:"風險", title:"報酬越吸引，越要看風險", visual:["📈 可能獲利","📉 也可能損失","🧠 先懂再決定"], text:"股票價格會波動，可能獲利也可能虧損。投資前要了解內容與費用、評估承受能力，不相信保證獲利或不明消息。", bridge:"有人說『一定賺、現在不買就來不及』，你應該先查什麼？" },
  ], challenges:[
    { prompt:"家中臨時需要修理冰箱，哪筆錢最適合先使用？", options:["可隨時提領的緊急預備金","原本沒有、先借高利息貸款","全部拿去買波動大的股票"], answer:0, why:"緊急預備金重視流動性，適合處理突發必要支出。", hint:"找一項能在需要時立即使用、風險又低的安排。", cards:[0,1] },
    { prompt:"有一筆錢半年內不會使用，又希望風險較低，可以先評估哪種工具？", options:["聽陌生人買熱門股票","短期定期存款","把錢全部花完"], answer:1, why:"定存需約定期間，但通常比活存利息高，適合短期不用且重視穩定的資金。", hint:"注意『半年不用』與『風險較低』兩個條件。", cards:[1] },
    { prompt:"群組有人保證某股票下週一定大漲，最合適的反應是？", options:["立刻投入全部存款","轉傳給更多同學","不相信保證獲利，先查內容、風險與消息來源"], answer:2, why:"投資沒有保證獲利；需了解標的並評估可承受的損失。", hint:"任何高報酬承諾都要一起檢查風險與來源。", cards:[2] },
  ], scenario:{ prompt:"小海每週有 200 元零用錢，又得到 300 元獎金；他想買 500 元禮物和 2,000 元手錶。哪個計畫較合理？", options:["立刻把所有錢買手錶，不記錄支出","先列需要與想要，設定期限並固定儲蓄，再決定購買順序","向同學借錢同時買完"], answer:1, why:"把目標、期限與每期存款寫清楚，才能判斷是否負擔得起。", hint:"好的計畫要有目標金額、期限、固定儲蓄和支出順序。", cards:[0] } },
];

const quiz:(Choice&{concept:string})[] = [
  { prompt:"影響消費選擇的完整考量是？", options:["只看價格","價格、品質與個人需求","只看廣告"], answer:1, why:"聰明選擇要把價格、品質、需求與預算一起比較。", hint:"不能只看單一條件。", concept:"消費判斷" },
  { prompt:"行動支付的便利可能帶來哪項風險？", options:["商品一定變耐用","付款沒有任何紀錄","容易忽略累積金額而衝動消費"], answer:2, why:"付款太方便時，若不查看紀錄與預算，可能不知不覺超支。", hint:"方便不等於不用控制。", concept:"支付與預算" },
  { prompt:"消費需求增加時，生產者可能怎麼做？", options:["評估成本、技術與市場後調整生產","完全不理會市場","保證每項商品都成功"], answer:0, why:"生產決策會綜合市場需求、成本、技術與回饋。", hint:"需求是線索，不是唯一條件。", concept:"需求與生產" },
  { prompt:"網購前哪個做法較安全？", options:["私下提供密碼","查賣家信用、商品內容與退換貨規定","只看最低價"], answer:1, why:"先查資訊與規定可降低詐騙及消費爭議。", hint:"購買前先確認保障。", concept:"消費安全" },
  { prompt:"遇到疑似詐騙，可撥哪個電話查證？", options:["1950","119","165"], answer:2, why:"165 是防詐騙諮詢專線。", hint:"1950 是消費者服務專線。", concept:"防詐" },
  { prompt:"哪個行動較能減少消費造成的環境負擔？", options:["延長使用、維修或捐贈仍可用的物品","每季丟掉仍能穿的衣服","只買更多一次性用品"], answer:0, why:"減量、再使用與延長壽命能減少生產及廢棄污染。", hint:"先讓物品用得更久。", concept:"環境責任" },
  { prompt:"規畫家庭或個人支出時，第一步較適合做什麼？", options:["先買最想要的","分辨需要與想要並排優先順序","完全不看收入"], answer:1, why:"資源有限，要先確保必要支出，再安排想要與儲蓄。", hint:"先照顧最重要的生活需求。", concept:"收支分配" },
  { prompt:"設定儲蓄目標需要哪些資料？", options:["只寫想買的東西","只看朋友存多少","目標金額、期限與每期存款"], answer:2, why:"具體的金額與期限，才能算出每期應存多少。", hint:"目標必須能計算。", concept:"儲蓄目標" },
  { prompt:"活期存款最適合哪個用途？", options:["保留可隨時使用的生活或緊急資金","保證獲得最高報酬","用來追逐短期股價"], answer:0, why:"活存流動性高，適合日常與緊急資金。", hint:"關鍵是隨時可用。", concept:"活期存款" },
  { prompt:"短期不使用、又重視穩定的錢，可評估什麼？", options:["高風險不明投資","定期存款","全部花掉"], answer:1, why:"定存約定期間，適合暫時不用且希望穩定的資金。", hint:"找低風險且有期限的工具。", concept:"定期存款" },
  { prompt:"保險的主要功能是？", options:["保證快速致富","讓所有事故不會發生","分擔重大事故造成的財務衝擊"], answer:2, why:"保險不能阻止事故，但可依契約分擔損失。", hint:"它管理的是事故後的損失。", concept:"保險" },
  { prompt:"記帳後還需要做什麼？", options:["定期檢視收支並調整計畫","把紀錄刪掉","只記收入不記支出"], answer:0, why:"記帳的價值在於看見習慣，進一步修正預算。", hint:"紀錄是為了做決策。", concept:"記帳" },
  { prompt:"股票和存款相比，通常有什麼特性？", options:["完全沒有損失可能","價格波動較大，可能有較高獲利或虧損","一定比存款適合所有人"], answer:1, why:"報酬與風險並存，投資人需評估承受能力。", hint:"高報酬不會自動消除風險。", concept:"風險報酬" },
  { prompt:"面對『保證獲利』的投資訊息，應怎麼做？", options:["立刻投入全部資金","只因朋友轉傳就相信","先查來源、內容、費用與風險"], answer:2, why:"投資沒有保證，資訊來源與風險都必須查證。", hint:"先懂再決定。", concept:"投資查證" },
  { prompt:"最完整的理財觀念是？", options:["依目標分配金錢、記錄檢討並承擔合適風險","報酬越高越要投入全部金錢","想要的東西都要立刻買"], answer:0, why:"理財是依需要和目標規畫，並持續檢討風險與結果。", hint:"理財不是只追求賺錢。", concept:"理財規劃" },
];

const classifyItems = [
  { text:"確認是否真的需要，再比較價格與品質", answer:"聰明選擇", why:"這是購買前的需求與預算判斷。" },
  { text:"設定金額上限，避免因行動支付超支", answer:"聰明選擇", why:"先設預算能減少衝動消費。" },
  { text:"查看賣家信用、退換貨規定", answer:"安全權益", why:"購前查資訊可降低網購風險。" },
  { text:"保留收據、訂單與保固資料", answer:"安全權益", why:"交易證明可用於核對與申訴。" },
  { text:"維修、轉贈仍可使用的物品", answer:"環境責任", why:"延長使用能減少廢棄物與重複生產。" },
  { text:"選擇耐用、再生材料且符合需求的商品", answer:"環境責任", why:"兼顧使用壽命與材料可降低環境負擔。" },
];
const categories = [
  { name:"聰明選擇", clue:"需要、品質、價格與預算" },
  { name:"安全權益", clue:"查證、交易紀錄、退換貨與申訴" },
  { name:"環境責任", clue:"減量、耐用、再使用與回收" },
];

function ChoiceTask({item,taskKey,saved,setSaved,unscored=false,onHint}:{item:Choice;taskKey:string;saved:Saved;setSaved:React.Dispatch<React.SetStateAction<Saved>>;unscored?:boolean;onHint?:(cards:number[]|null)=>void}){
  const [picked,setPicked]=useState<number|null>(null); const right=picked===item.answer; const done=!!saved.correct[taskKey];
  function choose(i:number){setPicked(i);if(i===item.answer){onHint?.(null);if(!unscored)setSaved(s=>({...s,correct:{...s.correct,[taskKey]:true}}))}else onHint?.(item.cards??null)}
  return <div className={`choice-task ${done?"is-complete":""}`}><div className="task-heading">{done?"✓ 已完成":unscored?"暖身練習":"等待解鎖"}</div><h4>{item.prompt}</h4><div className="choice-grid">{item.options.map((o,i)=><button key={o} className={picked===i?(right?"right":"wrong"):""} onClick={()=>choose(i)}>{String.fromCharCode(65+i)}. {o}</button>)}</div>{picked!==null&&<div className={`feedback ${right?"good":"try"}`} role="status"><span>{right?`判斷有根據：${item.why}`:`思考提示：${item.hint}`}</span>{!right&&item.cards?.length&&<a className="hint-card-link" href={`#g6-u1-${taskKey.includes("l2")?2:1}-card-${item.cards[0]}`}>查看上方發亮的知識卡 ↑</a>}</div>}</div>
}

function ConsumerClassifier(){
  const [selected,setSelected]=useState<number|null>(null),[dragged,setDragged]=useState<number|null>(null),[groups,setGroups]=useState<Record<number,string>>({}),[checked,setChecked]=useState(false);
  const placed=Object.keys(groups).length, done=placed===classifyItems.length, correct=done&&classifyItems.every((x,i)=>groups[i]===x.answer);
  function place(i:number,category:string){setGroups(g=>({...g,[i]:category}));setSelected(null);setDragged(null);setChecked(false)}
  return <div className="inquiry classify-inquiry g6-tool"><div className="classify-intro"><p className="eyebrow dark">動手探究・消費決策分類</p><h3>先判斷目標，再採取行動</h3><p>從 word bank 拖曳卡片；也可以先點一張，再按分類欄的「放入這欄」。完成後檢查每個行動保護的是什麼。</p><p className="classify-progress">已分類 <b>{placed}／6</b></p></div><div className="word-bank"><b>WORD BANK｜待分類行動</b><div>{classifyItems.map((item,i)=>groups[i]?null:<button key={item.text} draggable onDragStart={()=>setDragged(i)} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={selected===i?"selected":""}><span aria-hidden="true">⠿</span>{item.text}</button>)}</div></div><div className="category-bins">{categories.map(category=><section className="category-bin" key={category.name} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragged!==null)place(dragged,category.name)}}><header><b>{category.name}</b><span>{category.clue}</span></header>{selected!==null&&<button className="place-button" onClick={()=>place(selected,category.name)}>放入這欄</button>}<div className="bin-items">{classifyItems.map((item,i)=>groups[i]===category.name?<article key={item.text} className={checked?(item.answer===category.name?"item-correct":"item-wrong"):""}><b>{item.text}</b><button onClick={()=>{setGroups(g=>{const n={...g};delete n[i];return n});setChecked(false)}}>移回</button>{checked&&<p className={item.answer===category.name?"item-feedback good":"item-feedback try"}>{item.answer===category.name?`✓ ${item.why}`:`換個角度：${item.why}`}</p>}</article>:null)}</div></section>)}</div><button className="tool-check" disabled={!done} onClick={()=>setChecked(true)}>檢查 6 張分類</button>{checked&&<p className={`tool-result ${correct?"correct":"retry"}`} role="status">{correct?"✓ 分類完成！你能區分消費前判斷、權益保障與環境責任。":"紅色卡片需要換欄；先讀理由，再重新分類。"}</p>}</div>
}

function BudgetLab(){
  const [need,setNeed]=useState(350),[want,setWant]=useState(350),[save,setSave]=useState(300); const total=need+want+save, left=1000-total, valid=need>=300&&save>=300&&total<=1000;
  return <div className="inquiry g6-tool budget-lab"><div className="tool-copy"><p className="eyebrow dark">動手探究・零用錢配置</p><h3>用 1,000 元完成本月計畫</h3><p>目標：先保留至少 300 元必要支出，每月儲蓄 300 元，4 個月後就能存到 1,200 元。拖動滑桿，在不超支的情況下安排想要。</p></div><div className="budget-controls">{[["必要支出",need,setNeed],["想要支出",want,setWant],["目標儲蓄",save,setSave]].map(([label,value,setter],index)=>{const inputId=`budget-range-${index}`;return <label key={label as string} htmlFor={inputId}><span><b>{label as string}</b><strong>{value as number} 元</strong></span><input id={inputId} aria-label={`${label as string}金額`} type="range" min="0" max="700" step="50" value={value as number} onChange={e=>(setter as React.Dispatch<React.SetStateAction<number>>)(Number(e.target.value))}/></label>})}<div className={`budget-total ${total>1000?"over":""}`}><span>已分配 {total} 元</span><b>{left>=0?`還有 ${left} 元可安排`:`超出 ${Math.abs(left)} 元`}</b></div><p className={`tool-result ${valid?"correct":"retry"}`} role="status">{valid?"✓ 計畫可行：先顧必要支出，也能按期達成儲蓄目標。":total>1000?"目前超支，請降低其中一項。":"再調整：必要支出與目標儲蓄都至少要保留 300 元。"}</p></div></div>
}

function certificateId(name:string){let value=0;for(const char of name)value=(value*31+char.charCodeAt(0))%100000;const d=new Date();return `G6U1-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}-${String(value).padStart(5,"0")}`}
function makeCertificate(name:string,score:number){const id=certificateId(name),canvas=document.createElement("canvas");canvas.width=1600;canvas.height=1100;const c=canvas.getContext("2d")!;c.fillStyle="#fffaf0";c.fillRect(0,0,1600,1100);c.strokeStyle="#0f766e";c.lineWidth=28;c.strokeRect(35,35,1530,1030);c.strokeStyle="#f4c95d";c.lineWidth=5;c.strokeRect(70,70,1460,960);c.textAlign="center";c.fillStyle="#0f766e";c.font="700 40px sans-serif";c.fillText("115 社會自主學習網・六年級",800,180);c.fillStyle="#083344";c.font="900 82px sans-serif";c.fillText("第一單元學習證書",800,315);c.fillStyle="#557176";c.font="34px sans-serif";c.fillText("恭喜",800,410);c.fillStyle="#083344";c.font="900 72px sans-serif";c.fillText(name,800,515);c.fillStyle="#557176";c.font="34px sans-serif";c.fillText("完成《消費選擇與理財規劃》自學任務",800,610);c.fillText("能以證據做消費判斷，並規畫金錢與風險",800,670);c.fillStyle="#ef6f51";c.font="900 48px sans-serif";c.fillText(`單元測驗最高成績 ${score} 分`,800,770);c.fillStyle="#557176";c.font="26px sans-serif";c.fillText(`證書編號：${id}`,800,860);c.fillText(`完成日期：${new Intl.DateTimeFormat("zh-TW",{dateStyle:"long"}).format(new Date())}`,800,910);const a=document.createElement("a");a.href=canvas.toDataURL("image/png");a.download=`六年級第一單元證書-${name}.png`;a.click()}

export default function Grade6Unit1(){
  const [saved,setSaved]=useState<Saved>(emptySaved),[ready,setReady]=useState(false),[answers,setAnswers]=useState<number[]>(Array(15).fill(-1)),[result,setResult]=useState<number|null>(null),[highlights,setHighlights]=useState<string[]>([]);
  useEffect(()=>{const t=setTimeout(()=>{try{const raw=localStorage.getItem(STORE);if(raw){const v={...emptySaved,...JSON.parse(raw)};setSaved(v);setAnswers(v.quizAnswers)}}catch{localStorage.removeItem(STORE)}setReady(true)},0);return()=>clearTimeout(t)},[]);
  useEffect(()=>{if(ready)localStorage.setItem(STORE,JSON.stringify(saved))},[saved,ready]);
  const lessonDone=lessons.map(l=>l.challenges.every((_,i)=>saved.correct[`g6u1l${l.id}c${i}`])&&saved.correct[`g6u1l${l.id}s`]); const completed=Object.values(saved.correct).filter(Boolean).length; const progress=Math.round(completed/8*100); const eligible=lessonDone.every(Boolean)&&saved.quizBest>=80;
  const review=useMemo(()=>quiz.filter((_,i)=>answers[i]!==-1&&answers[i]!==quiz[i].answer).map(q=>q.concept).filter((v,i,a)=>a.indexOf(v)===i),[answers]);
  function submit(){if(answers.some(a=>a<0)){setResult(-1);return}const score=Math.round(answers.filter((a,i)=>a===quiz[i].answer).length/15*100);setResult(score);setSaved(s=>({...s,quizBest:Math.max(s.quizBest,score),quizAnswers:answers}))}
  return <main className="grade6-unit1"><section className="hero hero-grade6" aria-labelledby="g6-title"><nav className="topbar"><Link className="brand" href="/courses"><span className="brand-mark">島</span><span>115 社會自主學習網</span></Link><div className="nav-links"><Link href="/courses">課程入口</Link><a href="#missions">任務</a><a href="#quiz">測驗</a><a href="#finish">證書</a></div><span className="progress-pill">學習進度 {progress}%</span></nav><div className="g6-hero-image" aria-hidden="true"><img src={`${assetBase}/grade6/unit1-consumer-finance-hero.jpg`} alt=""/></div><div className="hero-grid" id="top"><div className="g6-hero-copy"><p className="eyebrow">六年級社會・第一單元</p><h1 id="g6-title">每一筆選擇，<br/><em>都在決定未來。</em></h1><p className="lead">從一次購物到一份儲蓄計畫，學會比較、保護權益，也讓金錢服務真正重要的目標。</p><a className="primary-button" href="#base">開始任務 <span>→</span></a><p className="privacy-note">免登入即可學習・進度只保存在這個裝置</p></div></div><div className="wave"/></section>
  <section className="section base-section" id="base"><div className="section-heading"><div><p className="eyebrow dark">出發前・不計分</p><h2>生活判斷暖身</h2></div><p>先用生活經驗想一想。答錯會得到提示，不影響任務進度。</p></div><div className="warmups">{warmups.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`g6warm${i}`} saved={saved} setSaved={setSaved} unscored/>)}</div></section>
  <section className="mission-overview" id="missions"><div><p className="eyebrow">本單元任務</p><h2>兩座生活決策站</h2><p>每站閱讀 3 張圖文知識卡，操作探究工具，再完成 3 題挑戰與 1 題生活情境。</p><Link className="next-unit-link" href="/courses">← 返回課程入口</Link></div><div className="badge-row unit2-badges">{lessons.map((l,i)=><a key={l.id} href={`#g6-u1-lesson-${l.id}`} className={lessonDone[i]?"badge won":"badge"}><span>{lessonDone[i]?"✓":l.icon}</span><b>{l.title}</b><small>{lessonDone[i]?"徽章已取得":"等待探索"}</small></a>)}</div></section>
  {lessons.map((lesson,li)=><section key={lesson.id} className={`lesson ${lesson.id===1?"lesson-green":"lesson-ochre"}`} id={`g6-u1-lesson-${lesson.id}`}><div className="section lesson-inner"><header className="lesson-header"><div className="lesson-number">0{lesson.id}</div><div><p className="eyebrow dark">{lesson.kicker}</p><h2>{lesson.title}</h2><p>{lesson.question}</p></div><div className={`big-badge ${lessonDone[li]?"won":""}`}>{lessonDone[li]?"✓":lesson.icon}<small>{lessonDone[li]?"完成":"進行中"}</small></div></header><div className="concept-strip">{lesson.concepts.map(x=><span key={x}>{x}</span>)}</div><div className="cards">{lesson.cards.map((card,i)=><article key={card.title} id={`g6-u1-${lesson.id}-card-${i}`} tabIndex={-1} className={`knowledge-card ${highlights.includes(`${lesson.id}-${i}`)?"is-hint":""}`}><span className="card-count">0{i+1}</span><p className="card-tag">{card.tag}</p><h3>{card.title}</h3><div className="card-visual">{card.visual.map((x,j)=><span key={x}><b>{x}</b>{j<card.visual.length-1&&<i aria-hidden="true">→</i>}</span>)}</div><p className="card-body">{card.text}</p><p className="card-bridge"><b>思考提示｜想一想為什麼？</b>{card.bridge}</p></article>)}</div>{lesson.id===1?<ConsumerClassifier/>:<BudgetLab/>}<div className="challenge-zone"><div className="zone-heading"><p className="eyebrow dark">證據挑戰</p><h3>用知識卡完成 3 關</h3></div>{lesson.challenges.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`g6u1l${lesson.id}c${i}`} saved={saved} setSaved={setSaved} onHint={cards=>setHighlights(cards?cards.map(c=>`${lesson.id}-${c}`):[])}/>)}</div><div className="scenario"><div className="scenario-label">生活情境題</div><ChoiceTask item={lesson.scenario} taskKey={`g6u1l${lesson.id}s`} saved={saved} setSaved={setSaved} onHint={cards=>setHighlights(cards?cards.map(c=>`${lesson.id}-${c}`):[])}/></div></div></section>)}
  <section className="section quiz-section" id="quiz"><div className="section-heading"><div><p className="eyebrow dark">最後檢核・不限次重試</p><h2>15 題單元測驗</h2></div><div className="score-orb"><span>{saved.quizBest}</span><small>最高分</small></div></div><p className="quiz-note">完成全部題目再送出；每題都有解析，未達 80 分可依複習方向再挑戰。</p><div className="quiz-list">{quiz.map((q,i)=><fieldset key={q.prompt}><legend><span>{String(i+1).padStart(2,"0")}</span>{q.prompt}</legend>{q.options.map((o,j)=><label key={o} className={answers[i]===j?"selected":""}><input type="radio" name={`g6q${i}`} checked={answers[i]===j} onChange={()=>setAnswers(a=>a.map((v,k)=>k===i?j:v))}/>{o}</label>)}{result!==null&&result>=0&&<p className={answers[i]===q.answer?"explain correct":"explain incorrect"}>{answers[i]===q.answer?"✓":"→"} {q.why}</p>}</fieldset>)}</div><button className="submit-button" onClick={submit}>送出 15 題答案</button>{result===-1&&<p className="feedback try" role="alert">還有題目沒完成，請檢查每一題。</p>}{result!==null&&result>=0&&<div className={`result-panel ${result>=80?"pass":"review"}`} role="status"><span className="result-score">{result}</span><div><h3>{result>=80?"通過挑戰！":"再複習一次就更穩了"}</h3><p>{result>=80?"已達 80 分門檻。完成兩站任務後即可領取圖片證書。":`建議複習：${review.join("、")||"錯題解析"}。`}</p></div></div>}</section>
  <section className="finish" id="finish"><div className="section finish-grid"><div><p className="eyebrow">結業站</p><h2>{eligible?"生活決策力已解鎖！":"再完成一點，就能領證書。"}</h2><p className="finish-lead">{eligible?"你能比較消費選擇、守護權益，也能依目標規畫金錢與風險。輸入姓名即可下載 PNG 圖片證書。":"完成兩枚任務徽章，並讓測驗最高分達 80 分，即可解鎖第一單元證書。"}</p><div className="checklist">{lessonDone.map((done,i)=><p key={i} className={done?"done":""}><span>{done?"✓":"○"}</span>{lessons[i].title}：挑戰與生活情境</p>)}<p className={saved.quizBest>=80?"done":""}><span>{saved.quizBest>=80?"✓":"○"}</span>單元測驗最高分達 80 分</p></div></div><div className="certificate-card"><div className="cert-mark">決策家</div><p>學習回饋</p><h3>{saved.name||"你的名字"}</h3><p>{completed===8?"你已完成 8 項任務，能用證據做消費與理財決定。":`已完成 ${completed}／8 項任務，下一步前往尚未取得的徽章。`}</p><label>證書姓名<input value={saved.name} maxLength={20} placeholder="請輸入姓名" onChange={e=>setSaved(s=>({...s,name:e.target.value}))}/></label><button disabled={!eligible||!saved.name.trim()} onClick={()=>makeCertificate(saved.name.trim(),saved.quizBest)}>下載 PNG 圖片證書</button><small>姓名與進度只留在本機，不會上傳。證書編號本身不會連結個人紀錄。</small></div></div></section>
  <footer><Link className="brand" href="/courses"><span className="brand-mark">島</span><span>115 社會自主學習網</span></Link><p>依據六年級第一單元教材概念重新設計，未重製課本頁面與插圖。</p><button onClick={()=>{if(confirm("確定清除六年級第一單元的本機進度嗎？")){localStorage.removeItem(STORE);location.reload()}}}>清除本單元進度</button></footer></main>
}
