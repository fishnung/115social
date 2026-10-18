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
  { prompt:"小杰有蔬菜想換作業簿，但文具店不需要蔬菜。使用貨幣為什麼能讓交換更方便？", options:["商品的價值從此都不會改變","不必找到剛好需要彼此物品的人","每個人都會換到相同數量的商品"], answer:1, why:"貨幣可作為交換媒介，不必等待雙方剛好都需要對方的物品。", hint:"回想物物交換的困難：只有蔬菜和作業簿時，雙方需求必須剛好配對。" },
  { prompt:"班級只有 1,000 元，只能選一項公共用品。哪種決定方式最合理？", options:["比較共同需要與各方案效益再決定","交給最早提出想法的同學直接決定","平均切成小額而不管方案能否完成"], answer:0, why:"資源有限時，要比較共同需要、可行性與選擇後的影響。", hint:"三種方法都能做出決定，但哪一種有使用共同需求和方案效果作為根據？" },
  { prompt:"麵包店向農場買麵粉，再把做好的麵包賣給學生。麵包店先後扮演什麼角色？", options:["買麵粉時是生產者，賣麵包時是消費者","買進和賣出時都只是商品的消費者","買麵粉時是消費者，賣麵包時是生產者"], answer:2, why:"同一個人或店家會因經濟活動不同而改變角色：購買原料時是消費者，製作並銷售商品時是生產者。", hint:"不要只看『麵包店』的名稱，要分別判斷它在買什麼、又提供什麼。" },
];

const lessons:Lesson[] = [
  { id:1, icon:"🧭", kicker:"第一課・消費選擇與權益", title:"消費偵探所", question:"如何做出兼顧預算、權益與環境的消費選擇？", concepts:["需要與想要","價格・品質・需求","消費安全","環境責任"], cards:[
    { tag:"判斷", title:"先停一下，再比較", visual:["🎯 確認需要","⚖️ 比價格品質","🧾 守住預算"], text:"廣告、折扣與方便付款都可能讓人衝動消費。先確認用途，再比較價格、品質與預算，才不會只看便宜或流行。", bridge:"看到限時折扣時，為什麼不能只問『省了多少』？" },
    { tag:"影響", title:"你的選擇會改變生產", visual:["🛒 需求改變","🏭 調整生產","💬 回饋再改進"], text:"消費者的需求與回饋會影響廠商開發商品、改變技術與生產數量；企業也會考量成本與市場反應。", bridge:"如果更多人選擇少糖、耐用商品，廠商可能怎麼做？" },
    { tag:"守護", title:"安全、權益與環境一起看", visual:["🔍 購前查資訊","🛡️ 留交易證明","♻️ 減量再使用"], text:"網購前看賣家信用、內容與退換貨規定；遇疑似詐騙可撥 165，消費爭議可洽 1950。耐用、維修、二手與再生材料也能減少浪費。", bridge:"商品出問題時，哪些資料能保護你？買得便宜一定最環保嗎？" },
  ], challenges:[
    { prompt:"耳機仍可正常使用，新款正在限時特價。哪個做法最聰明？", options:["趁優惠結束以前先購買新款","先確認需求並比較品質與預算","依照網紅推薦直接更換新款"], answer:1, why:"折扣不是需求；先評估用途、品質與負擔能力。", hint:"三個選項都回應了促銷，但哪一個同時檢查需求與負擔能力？", cards:[0] },
    { prompt:"陌生賣家要求離開購物平台、私下轉帳才有優惠，應怎麼做？", options:["停止交易並透過官方管道查證","先轉小額款項測試賣家信用","請朋友一起購買來分攤風險"], answer:0, why:"離開平台會失去保障；可先查證並利用 165 防詐諮詢。", hint:"小額轉帳和多人購買仍可能受騙；找能保留保障並先查證的做法。", cards:[2] },
    { prompt:"越來越多人想買少糖、包裝可回收的飲料，廠商最合理的回應是？", options:["維持原商品並增加促銷廣告","先大量生產再觀察是否熱賣","評估成本技術後試做並收回饋"], answer:2, why:"生產者會綜合需求、成本、技術與回饋調整商品。", hint:"消費需求是起點，但還要評估能否生產並透過試做降低風險。", cards:[1] },
  ], scenario:{ prompt:"班上要訂活動上衣，哪個方案最能兼顧預算、使用與環境？", options:["選價格最低但布料較薄的款式","選價格適中且耐穿合用的款式","選價格較高但圖案流行的款式"], answer:1, why:"同時考量價格、品質、真正需求與使用時間，才是較完整的決策。", hint:"三件都能穿，但要同時比較價格、耐用程度與實際用途。", cards:[0,2] } },
  { id:2, icon:"📊", kicker:"第二課・理財規劃與風險", title:"未來規劃室", question:"如何分配金錢，並在報酬與風險之間做合適選擇？", concepts:["收支分配","儲蓄目標","理財工具","風險評估"], cards:[
    { tag:"分配", title:"先顧需要，再安排想要", visual:["🏠 必要支出","🎈 想要支出","🌱 儲蓄目標"], text:"收入有限時要排優先順序：先處理必要支出，再分配想要與儲蓄。目標要寫出金額、期限及每期存款。", bridge:"如果每一筆都花在想要，緊急需要出現時會怎樣？" },
    { tag:"工具", title:"不同任務，用不同工具", visual:["💧 活存可隨時用","🔒 定存約定期限","🛡️ 保險分擔衝擊"], text:"活期存款方便應急；短期不用的錢可評估定期存款；保險分擔重大事故衝擊。工具沒有絕對最好，要看目的。", bridge:"緊急預備金與半年後才要用的錢，適合放在同一處嗎？" },
    { tag:"風險", title:"報酬越吸引，越要看風險", visual:["📈 可能獲利","📉 也可能損失","🧠 先懂再決定"], text:"股票價格會波動，可能獲利也可能虧損。投資前要了解內容與費用、評估承受能力，不相信保證獲利或不明消息。", bridge:"有人說『一定賺、現在不買就來不及』，你應該先查什麼？" },
  ], challenges:[
    { prompt:"家中臨時需要修理冰箱，哪筆錢最適合先使用？", options:["隨時可領用的緊急預備金","半年後到期的定期存款資金","準備承擔波動的股票資金"], answer:0, why:"緊急預備金重視流動性，適合處理突發必要支出。", hint:"三筆錢都可能取得，但哪一筆原本就是為突發需要準備？", cards:[0,1] },
    { prompt:"有一筆錢半年內不會使用，希望比活存利息高且風險較低，可以先評估哪種工具？", options:["熱門股票，期待短期價格上漲","半年定存，接受約定期間限制","活期存款，保留隨時領用彈性"], answer:1, why:"定存需約定期間，但通常比活存利息高，適合短期不用且重視穩定的資金。", hint:"三種工具各有優點；請同時對照『半年不用、利息較高、風險較低』。", cards:[1] },
    { prompt:"群組有人保證某股票下週一定大漲，最合適的反應是？", options:["先買少量，等上漲後再增加投入","詢問更多群友，再依多數意見決定","查消息來源、投資內容費用與風險"], answer:2, why:"投資沒有保證獲利；需了解標的並評估可承受的損失。", hint:"買得少或問更多群友都不能證明消息可靠；要回到可查證的資料。", cards:[2] },
  ], scenario:{ prompt:"小海每週有 200 元零用錢，又得到 300 元獎金；他想買 500 元禮物和 2,000 元手錶。哪個計畫較合理？", options:["先買手錶，再看零用錢是否足夠","排定順序，算出每週固定儲蓄金額","先向同學借錢，同時完成兩個目標"], answer:1, why:"把目標、期限與每期存款寫清楚，才能判斷是否負擔得起。", hint:"三個方法都能讓購買開始，但哪一個不增加負債且能檢查是否可行？", cards:[0] } },
];

const quiz:(Choice&{concept:string})[] = [
  { prompt:"影響消費選擇的完整考量是？", options:["商品價格、廣告次數與包裝","商品品牌、流行程度與顏色","商品價格、品質與個人需求"], answer:2, why:"聰明選擇要把價格、品質、需求與預算一起比較。", hint:"三組條件都可能影響心情，但哪一組能檢查商品是否合用又負擔得起？", concept:"消費判斷" },
  { prompt:"行動支付的便利可能帶來哪項風險？", options:["忽略累積金額而超出原定預算","付款太快而錯過商品折扣期限","交易紀錄分散而完全無法查詢"], answer:0, why:"付款太方便時，若不查看紀錄與預算，可能不知不覺超支。", hint:"行動支付仍有紀錄；真正的風險來自使用者容易忽略什麼？", concept:"支付與預算" },
  { prompt:"消費需求增加時，生產者可能怎麼做？", options:["增加促銷廣告但不改變商品","評估成本技術後再調整生產","先大量生產再觀察市場反應"], answer:1, why:"生產決策會綜合市場需求、成本、技術與回饋。", hint:"只做廣告或先大量生產都忽略部分風險；哪一項先做完整評估？", concept:"需求與生產" },
  { prompt:"網購前哪個做法較安全？", options:["私下聯絡以取得額外優惠","查信用、內容與退換貨規定","只比較價格與預計到貨速度"], answer:1, why:"先查資訊與規定可降低詐騙及消費爭議。", hint:"價格和速度很重要，但哪一項同時保留交易保障？", concept:"消費安全" },
  { prompt:"遇到疑似詐騙，可撥哪個電話查證？", options:["1950","119","165"], answer:2, why:"165 是防詐騙諮詢專線。", hint:"1950 是消費者服務專線。", concept:"防詐" },
  { prompt:"哪個行動較能減少消費造成的環境負擔？", options:["維修、轉贈仍然可以使用的物品","更換、丟棄仍然可以使用的物品","囤積、購買更多功能相似的物品"], answer:0, why:"減量、再使用與延長壽命能減少生產及廢棄污染。", hint:"三個選項都在處理已有物品，哪一項能延長使用時間？", concept:"環境責任" },
  { prompt:"規畫家庭或個人支出時，第一步較適合做什麼？", options:["先買想要商品再補足必要支出","先依朋友支出安排相同的預算","先分需要想要並排出優先順序"], answer:2, why:"資源有限，要先確保必要支出，再安排想要與儲蓄。", hint:"每個人的收入和需要不同；先找出不能延後的項目。", concept:"收支分配" },
  { prompt:"設定儲蓄目標需要哪些資料？", options:["商品名稱、折扣與朋友的意見","目標金額、期限與每期的存款","品牌評價、顏色與購買的通路"], answer:1, why:"具體的金額與期限，才能算出每期應存多少。", hint:"哪一組資料可以直接算出每週或每月該存多少？", concept:"儲蓄目標" },
  { prompt:"活期存款最適合哪個用途？", options:["保留可隨時使用的緊急資金","累積約定期間不用的閒置資金","承擔價格波動追求較高的報酬"], answer:0, why:"活存流動性高，適合日常與緊急資金。", hint:"比較三個用途最在意的是流動性、利息還是報酬。", concept:"活期存款" },
  { prompt:"短期不使用、又重視穩定的錢，可評估什麼？", options:["活期存款，方便隨時提領","股票投資，承擔價格波動","定期存款，接受約定期間"], answer:2, why:"定存約定期間，適合暫時不用且希望穩定的資金。", hint:"題目已說短期不使用，所以可以用期限換取較穩定的利息。", concept:"定期存款" },
  { prompt:"保險的主要功能是？", options:["分擔事故造成的財務衝擊","避免所有意外事故發生","保證每年獲得固定收益"], answer:0, why:"保險不能阻止事故，但可依契約分擔損失。", hint:"保險不能控制事故，也不是保證獲利；它處理的是事故後的什麼？", concept:"保險" },
  { prompt:"記帳後還需要做什麼？", options:["只保留收入並刪除支出紀錄","定期檢視收支並調整計畫","維持原本計畫不再進行改變"], answer:1, why:"記帳的價值在於看見習慣，進一步修正預算。", hint:"如果紀錄顯示常常超支，下一步應該如何運用這項發現？", concept:"記帳" },
  { prompt:"股票和存款相比，通常有什麼特性？", options:["價格波動且可能獲利也可能虧損","價格固定而且沒有損失可能","報酬穩定而且適合每一個人"], answer:0, why:"報酬與風險並存，投資人需評估承受能力。", hint:"股票價格會隨市場變動，因此結果不只一種。", concept:"風險報酬" },
  { prompt:"面對『保證獲利』的投資訊息，應怎麼做？", options:["先投入少量，獲利之後再增加","先詢問朋友，依照多數意見決定","先查消息來源、相關費用與風險"], answer:2, why:"投資沒有保證，資訊來源與風險都必須查證。", hint:"投入少量和多人認同都不等於消息真實；找可驗證的做法。", concept:"投資查證" },
  { prompt:"最完整的理財觀念是？", options:["依廣告推薦、追求較高的報酬","依目標分配、記錄並評估風險","依當下想要、再處理必要支出"], answer:1, why:"理財是依需要和目標規畫，並持續檢討風險與結果。", hint:"理財不只是消費或投資，而是一個持續規畫與檢討的過程。", concept:"理財規劃" },
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

const adCases = [
  {
    id:"sale",
    label:"廣告 A｜限時耳機",
    image:"/grade6/ad-limited-headphones.png",
    alt:"無線耳機促銷情境，畫面以倒數、醒目色塊和快速付款符號營造急迫感",
    promos:["限時價 999 元","原價 1,800 元","倒數 10 分鐘"],
    facts:["目前耳機：仍可正常使用","本月可用預算：1,000 元","本月已花：850 元","商品保固：廣告未說明"],
    question:"看完廣告與個人資訊，哪個判斷最有根據？",
    options:["折扣超過八百元，現在買一定最省","先查保固與品質，也確認是否需要","只剩十分鐘，先付款再慢慢比較"],
    answer:1,
    why:"這個月只剩 150 元，現有耳機也能用，而且保固未知。折扣很醒目，卻不能代替需求、品質與預算判斷。",
    hint:"不要只看『省下多少』；把剩餘預算、現有物品狀況和缺少的商品資訊一起核對。",
  },
  {
    id:"risk",
    label:"資訊 B｜私訊匯款",
    image:"/grade6/ad-risky-marketplace.png",
    alt:"網路賣場情境，畫面出現低評價、私訊、離開交易保障與匯款等風險線索",
    promos:["平台價 680 元","私訊轉帳 499 元","今日最後優惠"],
    facts:["賣家評價：只有 2 則","退換貨規則：沒有提供","交易方式：要求離開平台","付款方式：個人帳戶轉帳"],
    question:"面對這些資訊，哪個做法能保留最多保障？",
    options:["先轉一百元，測試賣家是否回覆","找同學一起買，分散可能的損失","留在平台查證，不因低價私下匯款"],
    answer:2,
    why:"私下匯款會失去平台保障，評價與退換貨資訊又不足。應先停下、留在官方平台查證。",
    hint:"小額轉帳或一起購買都沒有消除風險；找出能保留交易紀錄與平台保障的做法。",
  },
];

function ChoiceTask({item,taskKey,saved,setSaved,unscored=false,onHint}:{item:Choice;taskKey:string;saved:Saved;setSaved:React.Dispatch<React.SetStateAction<Saved>>;unscored?:boolean;onHint?:(cards:number[]|null)=>void}){
  const [picked,setPicked]=useState<number|null>(null); const right=picked===item.answer; const done=!!saved.correct[taskKey];
  function choose(i:number){setPicked(i);if(i===item.answer){onHint?.(null);if(!unscored)setSaved(s=>({...s,correct:{...s.correct,[taskKey]:true}}))}else onHint?.(item.cards??null)}
  return <div className={`choice-task ${done?"is-complete":""}`}><div className="task-heading">{done?"✓ 已完成":unscored?"暖身練習":"等待解鎖"}</div><h4>{item.prompt}</h4><div className="choice-grid">{item.options.map((o,i)=><button key={o} className={picked===i?(right?"right":"wrong"):""} onClick={()=>choose(i)}>{String.fromCharCode(65+i)}. {o}</button>)}</div>{picked!==null&&<div className={`feedback ${right?"good":"try"}`} role="status"><span>{right?`判斷有根據：${item.why}`:`思考提示：${item.hint}`}</span>{!right&&item.cards?.length&&<a className="hint-card-link" href={`#g6-u1-${taskKey.includes("l2")?2:1}-card-${item.cards[0]}`}>查看上方發亮的知識卡 ↑</a>}</div>}</div>
}

function AdReadingLab(){
  const [answers,setAnswers]=useState<Record<string,number>>({});
  return <section className="ad-reading-lab" aria-labelledby="ad-reading-title"><header className="ad-lab-header"><div><p className="eyebrow dark">圖像探究・廣告與資訊判讀站</p><h3 id="ad-reading-title">廣告先吸引你，資訊才幫你決定</h3></div><p>先觀察畫面想讓你注意什麼，再核對價格、預算、評價與保障。每題只有一個最有根據的答案。</p></header><div className="ad-reading-steps" aria-label="判讀步驟"><span>① 看廣告手法</span><i aria-hidden="true">→</i><span>② 查可驗證資訊</span><i aria-hidden="true">→</i><span>③ 用證據判斷</span></div><div className="ad-case-grid">{adCases.map(item=>{const picked=answers[item.id];const answered=picked!==undefined;const right=picked===item.answer;return <article className="ad-case" key={item.id}><div className="ad-visual"><img src={`${assetBase}${item.image}`} alt={item.alt}/><div className="promo-stickers" aria-label="廣告主打資訊">{item.promos.map((promo,i)=><span key={promo} className={`promo-sticker promo-${i+1}`}>{promo}</span>)}</div></div><div className="ad-case-body"><p className="ad-case-label">{item.label}</p><h4>廣告沒說完的資訊</h4><ul className="ad-facts">{item.facts.map(fact=><li key={fact}>{fact}</li>)}</ul><p className="ad-question">{item.question}</p><div className="choice-grid ad-options">{item.options.map((option,i)=><button key={option} className={picked===i?(right?"right":"wrong"):""} onClick={()=>setAnswers(current=>({...current,[item.id]:i}))}>{String.fromCharCode(65+i)}. {option}</button>)}</div>{answered&&<p className={`feedback ${right?"good":"try"}`} role="status"><b>{right?"判斷有根據：":"思考提示："}</b>{right?item.why:item.hint}</p>}</div></article>})}</div></section>
}

function ConsumerClassifier(){
  const [selected,setSelected]=useState<number|null>(null),[dragged,setDragged]=useState<number|null>(null),[groups,setGroups]=useState<Record<number,string>>({}),[checked,setChecked]=useState(false);
  const placed=Object.keys(groups).length, done=placed===classifyItems.length, correct=done&&classifyItems.every((x,i)=>groups[i]===x.answer);
  function place(i:number,category:string){setGroups(g=>({...g,[i]:category}));setSelected(null);setDragged(null);setChecked(false)}
  return <div className="inquiry classify-inquiry g6-tool"><div className="classify-intro"><p className="eyebrow dark">動手探究・消費決策分類</p><h3>先判斷目標，再採取行動</h3><p>從 word bank 拖曳卡片；也可以先點一張，再按分類欄的「放入這欄」。完成後檢查每個行動保護的是什麼。</p><p className="classify-progress">已分類 <b>{placed}／6</b></p></div><div className="word-bank"><b>WORD BANK｜待分類行動</b><div>{classifyItems.map((item,i)=>groups[i]?null:<button key={item.text} draggable onDragStart={()=>setDragged(i)} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={selected===i?"selected":""}><span aria-hidden="true">⠿</span>{item.text}</button>)}</div></div><div className="category-bins">{categories.map(category=><section className="category-bin" key={category.name} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragged!==null)place(dragged,category.name)}}><header><b>{category.name}</b><span>{category.clue}</span></header>{selected!==null&&<button className="place-button" onClick={()=>place(selected,category.name)}>放入這欄</button>}<div className="bin-items">{classifyItems.map((item,i)=>groups[i]===category.name?<article key={item.text} className={checked?(item.answer===category.name?"item-correct":"item-wrong"):""}><b>{item.text}</b><button onClick={()=>{setGroups(g=>{const n={...g};delete n[i];return n});setChecked(false)}}>移回</button>{checked&&<p className={item.answer===category.name?"item-feedback good":"item-feedback try"}>{item.answer===category.name?`✓ ${item.why}`:`換個角度：${item.why}`}</p>}</article>:null)}</div></section>)}</div><button className="tool-check" disabled={!done} onClick={()=>setChecked(true)}>檢查 6 張分類</button>{checked&&<p className={`tool-result ${correct?"correct":"retry"}`} role="status">{correct?"✓ 分類完成！你能區分消費前判斷、權益保障與環境責任。":"紅色卡片需要換欄；先讀理由，再重新分類。"}</p>}</div>
}

function BudgetLab(){
  const fixed=450,[merch,setMerch]=useState(350),[snacks,setSnacks]=useState(100),[save,setSave]=useState(300); const total=fixed+merch+snacks+save, left=1000-total, valid=save>=300&&total<=1000;
  return <div className="inquiry g6-tool budget-lab"><div className="tool-copy"><p className="eyebrow dark">動手探究・一週零用錢配置</p><h3>小晴的 1,000 元怎麼分？</h3><p>小晴這週有 1,000 元。四週後校外教學要用 1,200 元，所以這週至少要存 300 元。她還想買 350 元的偶像周邊；請幫她在不超支的情況下做取捨。</p><div className="budget-receipt" aria-label="本週固定必要支出"><b>先保留的必要支出</b><p><span>🥪 五天早餐</span><strong>60 × 5＝300 元</strong></p><p><span>🚌 交通卡加值</span><strong>150 元</strong></p><p className="receipt-total"><span>必要支出小計</span><strong>{fixed} 元</strong></p></div></div><div className="budget-controls"><label className="budget-item" htmlFor="budget-merch"><span><b>🎤 偶像周邊</b><strong>{merch} 元</strong></span><small>商品售價 350 元；調成 0 代表這週先不買。</small><input id="budget-merch" aria-label="本週偶像周邊支出" type="range" min="0" max="350" step="350" value={merch} onChange={e=>setMerch(Number(e.target.value))}/></label><label className="budget-item" htmlFor="budget-snacks"><span><b>🧋 點心飲料</b><strong>{snacks} 元</strong></span><small>每份約 50 元，可以減少次數但不必全部取消。</small><input id="budget-snacks" aria-label="本週點心飲料支出" type="range" min="0" max="200" step="50" value={snacks} onChange={e=>setSnacks(Number(e.target.value))}/></label><label className="budget-item" htmlFor="budget-saving"><span><b>🌱 校外教學儲蓄</b><strong>{save} 元</strong></span><small>四週存到 1,200 元，本週至少要存 300 元。</small><input id="budget-saving" aria-label="本週校外教學儲蓄" type="range" min="0" max="500" step="50" value={save} onChange={e=>setSave(Number(e.target.value))}/></label><div className={`budget-total ${total>1000?"over":""}`}><span>本週已安排 {total} 元</span><b>{left>=0?`還剩 ${left} 元可保留`:`超出 ${Math.abs(left)} 元`}</b></div><p className={`tool-result ${valid?"correct":"retry"}`} role="status">{valid?`✓ 計畫可行：早餐和交通有著落，也存下 ${save} 元。${merch===0?"偶像周邊延後購買，沒有動用目標儲蓄。":"仍買了周邊，但其他想要支出已做取捨。"}`:total>1000?"目前超支。早餐與交通不能少，請從偶像周邊、點心飲料中取捨，也別讓儲蓄低於 300 元。":"雖然沒有超支，但本週儲蓄不足 300 元，四週後會無法達成校外教學目標。"}</p></div></div>
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
  <section className="section base-section" id="base"><div className="section-heading"><div><p className="eyebrow dark">出發前・先備知識不計分</p><h2>核心概念暖身</h2></div><p>回想過去學過的貨幣交換、有限資源與經濟角色。答錯會得到提示，不影響任務進度。</p></div><div className="warmups">{warmups.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`g6warm${i}`} saved={saved} setSaved={setSaved} unscored/>)}</div></section>
  <section className="mission-overview" id="missions"><div><p className="eyebrow">本單元任務</p><h2>兩座生活決策站</h2><p>每站閱讀 3 張圖文知識卡，操作探究工具，再完成 3 題挑戰與 1 題生活情境。</p><Link className="next-unit-link" href="/courses">← 返回課程入口</Link></div><div className="badge-row unit2-badges">{lessons.map((l,i)=><a key={l.id} href={`#g6-u1-lesson-${l.id}`} className={lessonDone[i]?"badge won":"badge"}><span>{lessonDone[i]?"✓":l.icon}</span><b>{l.title}</b><small>{lessonDone[i]?"徽章已取得":"等待探索"}</small></a>)}</div></section>
  {lessons.map((lesson,li)=><section key={lesson.id} className={`lesson ${lesson.id===1?"lesson-green":"lesson-ochre"}`} id={`g6-u1-lesson-${lesson.id}`}><div className="section lesson-inner"><header className="lesson-header"><div className="lesson-number">0{lesson.id}</div><div><p className="eyebrow dark">{lesson.kicker}</p><h2>{lesson.title}</h2><p>{lesson.question}</p></div><div className={`big-badge ${lessonDone[li]?"won":""}`}>{lessonDone[li]?"✓":lesson.icon}<small>{lessonDone[li]?"完成":"進行中"}</small></div></header><div className="concept-strip">{lesson.concepts.map(x=><span key={x}>{x}</span>)}</div><div className="cards">{lesson.cards.map((card,i)=><article key={card.title} id={`g6-u1-${lesson.id}-card-${i}`} tabIndex={-1} className={`knowledge-card ${highlights.includes(`${lesson.id}-${i}`)?"is-hint":""}`}><span className="card-count">0{i+1}</span><p className="card-tag">{card.tag}</p><h3>{card.title}</h3><div className="card-visual">{card.visual.map((x,j)=><span key={x}><b>{x}</b>{j<card.visual.length-1&&<i aria-hidden="true">→</i>}</span>)}</div><p className="card-body">{card.text}</p><p className="card-bridge"><b>思考提示｜想一想為什麼？</b>{card.bridge}</p></article>)}</div>{lesson.id===1&&<AdReadingLab/>}{lesson.id===1?<ConsumerClassifier/>:<BudgetLab/>}<div className="challenge-zone"><div className="zone-heading"><p className="eyebrow dark">證據挑戰</p><h3>用知識卡完成 3 關</h3></div>{lesson.challenges.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`g6u1l${lesson.id}c${i}`} saved={saved} setSaved={setSaved} onHint={cards=>setHighlights(cards?cards.map(c=>`${lesson.id}-${c}`):[])}/>)}</div><div className="scenario"><div className="scenario-label">生活情境題</div><ChoiceTask item={lesson.scenario} taskKey={`g6u1l${lesson.id}s`} saved={saved} setSaved={setSaved} onHint={cards=>setHighlights(cards?cards.map(c=>`${lesson.id}-${c}`):[])}/></div></div></section>)}
  <section className="section quiz-section" id="quiz"><div className="section-heading"><div><p className="eyebrow dark">最後檢核・不限次重試</p><h2>15 題單元測驗</h2></div><div className="score-orb"><span>{saved.quizBest}</span><small>最高分</small></div></div><p className="quiz-note">完成全部題目再送出；每題都有解析，未達 80 分可依複習方向再挑戰。</p><div className="quiz-list">{quiz.map((q,i)=><fieldset key={q.prompt}><legend><span>{String(i+1).padStart(2,"0")}</span>{q.prompt}</legend>{q.options.map((o,j)=><label key={o} className={answers[i]===j?"selected":""}><input type="radio" name={`g6q${i}`} checked={answers[i]===j} onChange={()=>setAnswers(a=>a.map((v,k)=>k===i?j:v))}/>{o}</label>)}{result!==null&&result>=0&&<p className={answers[i]===q.answer?"explain correct":"explain incorrect"}>{answers[i]===q.answer?"✓":"→"} {q.why}</p>}</fieldset>)}</div><button className="submit-button" onClick={submit}>送出 15 題答案</button>{result===-1&&<p className="feedback try" role="alert">還有題目沒完成，請檢查每一題。</p>}{result!==null&&result>=0&&<div className={`result-panel ${result>=80?"pass":"review"}`} role="status"><span className="result-score">{result}</span><div><h3>{result>=80?"通過挑戰！":"再複習一次就更穩了"}</h3><p>{result>=80?"已達 80 分門檻。完成兩站任務後即可領取圖片證書。":`建議複習：${review.join("、")||"錯題解析"}。`}</p></div></div>}</section>
  <section className="finish" id="finish"><div className="section finish-grid"><div><p className="eyebrow">結業站</p><h2>{eligible?"生活決策力已解鎖！":"再完成一點，就能領證書。"}</h2><p className="finish-lead">{eligible?"你能比較消費選擇、守護權益，也能依目標規畫金錢與風險。輸入姓名即可下載 PNG 圖片證書。":"完成兩枚任務徽章，並讓測驗最高分達 80 分，即可解鎖第一單元證書。"}</p><div className="checklist">{lessonDone.map((done,i)=><p key={i} className={done?"done":""}><span>{done?"✓":"○"}</span>{lessons[i].title}：挑戰與生活情境</p>)}<p className={saved.quizBest>=80?"done":""}><span>{saved.quizBest>=80?"✓":"○"}</span>單元測驗最高分達 80 分</p></div></div><div className="certificate-card"><div className="cert-mark">決策家</div><p>學習回饋</p><h3>{saved.name||"你的名字"}</h3><p>{completed===8?"你已完成 8 項任務，能用證據做消費與理財決定。":`已完成 ${completed}／8 項任務，下一步前往尚未取得的徽章。`}</p><label>證書姓名<input value={saved.name} maxLength={20} placeholder="請輸入姓名" onChange={e=>setSaved(s=>({...s,name:e.target.value}))}/></label><button disabled={!eligible||!saved.name.trim()} onClick={()=>makeCertificate(saved.name.trim(),saved.quizBest)}>下載 PNG 圖片證書</button><small>姓名與進度只留在本機，不會上傳。證書編號本身不會連結個人紀錄。</small></div></div></section>
  <footer><Link className="brand" href="/courses"><span className="brand-mark">島</span><span>115 社會自主學習網</span></Link><p>依據六年級第一單元教材概念重新設計，未重製課本頁面與插圖。</p><button onClick={()=>{if(confirm("確定清除六年級第一單元的本機進度嗎？")){localStorage.removeItem(STORE);location.reload()}}}>清除本單元進度</button></footer></main>
}
