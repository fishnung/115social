"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Choice = { prompt:string; options:string[]; answer:number; why:string; hint:string; cards?:number[] };
type Card = { tag:string; title:string; visual:string[]; text:string; bridge:string };
type Lesson = { id:number; icon:string; kicker:string; title:string; question:string; concepts:string[]; cards:Card[]; challenges:Choice[]; scenario:Choice };
type Saved = { correct:Record<string,boolean>; quizBest:number; quizAnswers:number[]; name:string };

const STORE = "taiwan-explorer-grade6-unit2-v1";
const emptySaved:Saved = { correct:{}, quizBest:0, quizAnswers:Array(15).fill(-1), name:"" };

const warmups:Choice[] = [
  { prompt:"一條新道路通車後，附近商店與住宅逐漸增加。哪個推論最合理？", options:["交通便利可能改變土地利用與人口分布","道路通車後所有農田都必須立刻消失","商店增加代表當地不再需要公共服務"], answer:0, why:"交通改善會提高可達性，吸引產業、住宅與人口，但變化並非立即或只有一種結果。", hint:"先分辨『可能影響』與『一定發生』，再找有因果關係的敘述。" },
  { prompt:"政府興建水庫，除了供水，也可能發電、防洪。這說明公共建設有什麼特性？", options:["只會服務建設所在地的居民","可能同時回應多種社會需求","完成後不需要維護或管理"], answer:1, why:"同一項公共建設可能有多種功能，也需要持續維護與權衡影響。", hint:"題目列出了供水、發電、防洪三種用途，它們共同說明什麼？" },
  { prompt:"工廠提供工作機會，也可能增加用水與汙染。判斷是否設廠時應怎麼做？", options:["只看新增多少工作機會","只看是否有人提出反對","同時比較效益、代價與配套"], answer:2, why:"公共決策需要看不同角色及長短期影響，不能只取單一面向。", hint:"工作與環境都是重要證據，哪個做法能把兩邊一起納入？" },
];

const lessons:Lesson[] = [
  { id:1, icon:"🌾", kicker:"第一課・戰後穩定與工業起步", title:"重建臺灣行動室", question:"戰後政府的改革、援助與工業政策，如何讓社會逐步穩定？", concepts:["土地改革","美國援助","民生工業","加工出口區"], cards:[
    { tag:"改革", title:"土地與生活重新安排", visual:["降低租金負擔","農民取得土地","社會漸趨穩定"], text:"政府推動三七五減租與耕者有其田，減輕農民負擔並讓實際耕作者取得土地。部分地主獲得補償後轉投工商業。", bridge:"同一項土地改革，為什麼會讓農民與地主面對不同改變？" },
    { tag:"援助", title:"物資先救急，建設再打底", visual:["麵粉奶粉補生活","貸款技術做建設","生產流通更穩定"], text:"美援提供物資、貸款與技術，改善短缺，也協助水庫與橋梁等建設。麵食、乳製品與美式文化逐漸進入日常生活。", bridge:"一袋麵粉與一座橋，分別解決眼前和長期的什麼問題？" },
    { tag:"轉型", title:"從民生工業走向出口", visual:["滿足日常用品","港口旁設加工區","就業與人口移動"], text:"政府先發展紡織、塑膠與食品，再於高雄港附近設加工出口區，利用進口原料、組裝與海運外銷，吸引農村青年與女性進入工廠。", bridge:"加工出口區為什麼靠近港口？它又如何改變家庭與都市？" },
  ], challenges:[
    { prompt:"土地改革後，哪組影響最符合教材中的因果關係？", options:["農民負擔降低；部分地主轉投工商業","農民停止耕作；地主全部離開臺灣","農業立即消失；工業取代所有工作"], answer:0, why:"土地改革讓農民生活較穩定，地主補償資金也間接投入工商業。", hint:"教材談的是不同群體的調整，不是農業突然消失。", cards:[0] },
    { prompt:"美援對戰後臺灣的影響，哪個說法最完整？", options:["只改變學校午餐，沒有影響產業","只興建觀光景點，沒有處理生活需求","同時補充物資，也支援技術與基礎建設"], answer:2, why:"美援兼顧短期物資短缺與長期建設、技術需求。", hint:"把麵粉奶粉與水庫橋梁兩類證據放在一起判斷。", cards:[1] },
    { prompt:"高雄適合設立加工出口區的關鍵條件是？", options:["遠離港口，避免外國商品進入","鄰近港口，方便原料進口與產品外銷","人口較少，工廠不需要大量勞動力"], answer:1, why:"加工出口需要進口原料、出口成品，港口能降低運輸時間與成本。", hint:"想一想原料怎麼進來、完成的家電又怎麼送到世界各地。", cards:[2] },
  ], scenario:{ prompt:"如果你是當時農村家庭的青年，考慮到加工出口區工作，哪個判斷最周全？", options:["只要工資較高，就不必考慮居住與家人","比較收入、住宿、交通與家庭分工再決定","因為大家都去，所以自己也一定要離鄉"], answer:1, why:"人口移動會同時影響收入、居住與家庭生活，應以多項證據評估。", hint:"工作機會是一項證據，但生活決定還會受到哪些條件影響？", cards:[2] } },
  { id:2, icon:"🏗️", kicker:"第二課・公共建設與區域轉型", title:"建設影響觀測站", question:"公共建設如何改變交通、土地、產業與生活品質？", concepts:["十大建設","土地利用","重工業聚落","城市轉型"], cards:[
    { tag:"回應", title:"危機中推動十大建設", visual:["能源危機與需求上升","交通能源重工業建設","提升產業能力"], text:"民國60年代面對能源危機、道路運量與工業原料問題，政府推動交通、能源與重工業建設；建設集中也埋下城鄉差距的隱憂。", bridge:"為什麼經濟不景氣時，政府仍投入大量公共工程？" },
    { tag:"空間", title:"道路不只縮短時間", visual:["交通可達性提高","工廠住宅商店聚集","繁榮與壅塞並存"], text:"高速公路與後續路網縮短南北運輸時間，也使交流道周邊農田轉為工業區或住宅區，帶來工作，同時增加車流、噪音與空氣汙染。", bridge:"交通方便之後，土地為什麼會跟著改變用途？" },
    { tag:"轉型", title:"高雄從重工業走向多元城市", visual:["港口與既有工業","鋼鐵石化造船聚集","環保科技觀光轉型"], text:"高雄憑港口與工業基礎成為重工業中心，人口與商業成長，也承受汙染。政府管制排放、增加綠地，產業逐步往科技、海洋觀光與藝文轉型。", bridge:"城市轉型是放棄工業，還是改變工業與生活的關係？" },
  ], challenges:[
    { prompt:"十大建設同時包含交通、能源與重工業，主要是為了什麼？", options:["回應運輸、供電與原料不足等發展需求","讓所有產業集中在同一座城市方便管理","以觀光景點取代原有農業與地方生活"], answer:0, why:"建設針對當時擴大的生產、交通、能源與原料需求。", hint:"把民國60年代遇到的三種問題，對照三類建設。", cards:[0] },
    { prompt:"高速公路附近由農田變成工業區，最直接的原因是？", options:["農田無法再種植任何作物","企業看重運輸與人員往來便利","居民依法必須搬到交流道旁"], answer:1, why:"可達性提升會吸引工廠、住宅與商業，但也帶來新的土地壓力。", hint:"企業選擇地點時，會在意貨物與人員能否快速移動。", cards:[1] },
    { prompt:"高雄推動公園綠地、排放管制與觀光活動，反映哪種轉型？", options:["停止所有港口與製造活動","只增加住宅而不處理汙染","兼顧產業、環境與城市生活"], answer:2, why:"轉型不是完全停止工業，而是改善環境並發展更多元產業。", hint:"教材同時保留造船、改善污染，也加入觀光與藝文。", cards:[2] },
  ], scenario:{ prompt:"社區旁將新設交流道與工業區，哪個方案最能兼顧發展與生活？", options:["只追求招商數量，不設定交通與排放條件","先拒絕所有建設，維持土地完全不變","規畫大眾運輸、汙染管制並持續聽取居民意見"], answer:2, why:"公共建設應搭配交通、環境與居民參與，降低發展帶來的代價。", hint:"找出同時回應工作機會、交通壓力與生活品質的方案。", cards:[1,2] } },
  { id:3, icon:"🔬", kicker:"第三課・科技島與永續選擇", title:"科技島決策中心", question:"臺灣如何形成科技聚落，又該如何面對資源與生活挑戰？", concepts:["科學園區","產學合作","晶圓產業","永續轉型"], cards:[
    { tag:"聚落", title:"人才、研究與企業連成網", visual:["大學培育人才","研究機構轉化技術","企業形成產業聚落"], text:"新竹科學園區鄰近大學與研究機構，政府引進技術、鼓勵產學合作並吸引企業進駐，使人才、研究與生產彼此支援。", bridge:"科學園區為什麼不是只有把許多工廠放在一起？" },
    { tag:"成就", title:"專業分工站上全球供應鏈", visual:["研發與晶片設計","專業晶圓製造","全球科技產品應用"], text:"臺灣建立完整分工與合作，在高階晶圓製造占重要地位。專業代工讓設計公司專心研發，臺灣則以製造技術與可信賴供應成為關鍵節點。", bridge:"專心替別人製造，為什麼也能形成難以取代的競爭力？" },
    { tag:"平衡", title:"科技成長也需要資源答案", visual:["就業與公共服務增加","土地水電需求上升","回收減排與區域平衡"], text:"園區帶來工作、醫療與商業，也可能造成房價、交通、土地、水電與工時壓力。再生水、節能減排與完整配套，是科技成長能否永續的關鍵。", bridge:"一座園區對企業、居民、農民與環境，可能帶來哪些不同影響？" },
  ], challenges:[
    { prompt:"新竹形成高科技產業聚落，哪組條件最關鍵？", options:["港口、漁業與低價土地","人才、研究機構與企業合作","觀光、夜市與大型商場"], answer:1, why:"大學人才、研究能量、政府政策與企業合作共同形成聚落。", hint:"找出能讓知識變技術、技術再變成產品的條件。", cards:[0] },
    { prompt:"專業晶圓製造模式的優勢是什麼？", options:["每家公司都重複興建相同工廠","只生產國內使用、不參與全球分工","讓設計與製造各自專精並互相合作"], answer:2, why:"專業分工能累積製造技術，也讓設計公司集中研發。", hint:"比較『全部自己做』和『各自專精再合作』的差別。", cards:[1] },
    { prompt:"科學園區快速擴張時，哪個資料最不能被忽略？", options:["用水用電、交通、住房與環境影響","園區建築外觀是否整齊一致","企業廣告是否使用流行配色"], answer:0, why:"科技發展需要同時評估資源、生活與環境承載能力。", hint:"找出會直接影響居民、農業與產業能否長久發展的資料。", cards:[2] },
  ], scenario:{ prompt:"地方要擴建科學園區，哪個提案最符合永續發展？", options:["先擴廠，缺水或塞車時再處理","設定再生水、節能交通與居民溝通方案","只計算產值，不公布資源需求與排放"], answer:1, why:"事前規畫資源效率、交通與參與機制，才能兼顧競爭力和生活品質。", hint:"永續不是事後補救，而是把資源與居民影響放進一開始的設計。", cards:[2] } },
];

const quiz:(Choice&{concept:string})[] = [
  { prompt:"三七五減租首先減輕誰的負擔？", options:["實際耕作的農民","加工出口的企業","科學園區的工程師"], answer:0, why:"三七五減租降低佃農租金負擔。", hint:"想一想誰需要向地主繳租。", concept:"土地改革" },
  { prompt:"耕者有其田後，部分地主獲得補償並轉往哪個領域？", options:["漁業與觀光業","工商業活動","公共工程管理"], answer:1, why:"補償資金間接促進部分地主投入工商業。", hint:"這是農業資源轉向哪種經濟活動？", concept:"土地改革" },
  { prompt:"美援同時提供物資、貸款與技術，最完整的作用是？", options:["只改變飲食口味","只完成一座橋梁","救急並為長期發展打底"], answer:2, why:"物資回應短缺，貸款技術支援建設與產業。", hint:"同時思考眼前生活和日後生產。", concept:"美援" },
  { prompt:"加工出口區選在高雄港附近，主要考量是？", options:["原料與產品方便海運進出","避免勞工前往都市工作","讓工廠遠離所有交通路線"], answer:0, why:"港口有利進口原料及出口製品。", hint:"加工出口的兩個方向都要經過什麼設施？", concept:"加工出口" },
  { prompt:"加工出口區擴大後，哪項社會變化最合理？", options:["農村人口完全停止移動","女性與農村青年進入工廠","所有家庭都回到農業生產"], answer:1, why:"大量工作吸引農村人口，女性也成為重要勞動力。", hint:"工廠需要勞動力，誰可能移動？", concept:"人口變遷" },
  { prompt:"民國60年代推動十大建設的背景不包括哪一項？", options:["能源危機衝擊","運輸與供電需求增加","高科技晶圓已占全球第一"], answer:2, why:"高階晶圓領先是後來的科技產業成果。", hint:"分辨十大建設與科技島發展的先後。", concept:"十大建設" },
  { prompt:"高速公路興建後，交流道附近農田可能轉為什麼？", options:["工業區或住宅區","永久保護區","海上養殖區"], answer:0, why:"交通可達性吸引工廠、住宅與商店。", hint:"哪種用途最依賴道路運輸？", concept:"土地利用" },
  { prompt:"交通建設帶來便利，也可能出現什麼代價？", options:["所有人口平均分布","城鄉差距立即消失","壅塞、噪音與空氣汙染"], answer:2, why:"車流與土地開發會增加環境及生活壓力。", hint:"便利帶來更多車輛與人口後會發生什麼？", concept:"交通影響" },
  { prompt:"高雄成為重工業中心的重要基礎是？", options:["高山與森林資源","港口交通與既有工業","大學與晶圓研究中心"], answer:1, why:"港口及既有煉鐵、造船基礎有利鋼鐵、石化與造船聚集。", hint:"大型原料與船隻最需要哪種條件？", concept:"高雄重工業" },
  { prompt:"高雄推動環境管制與海洋觀光代表什麼？", options:["重工業城市走向多元轉型","所有工廠同時停止生產","城市不再需要任何港口"], answer:0, why:"城市改善環境並發展科技、觀光與藝文。", hint:"轉型不等於全部停止。", concept:"城市轉型" },
  { prompt:"科學園區形成競爭力的關鍵組合是？", options:["低價商品與大量廣告","單一工廠與封閉技術","人才、研究、政策與企業"], answer:2, why:"產學研與企業聚集形成合作網絡。", hint:"高科技需要知識如何流動？", concept:"科學園區" },
  { prompt:"科學園區設立後，周邊可能同時出現什麼？", options:["人口減少與服務業消失","就業增加與交通住房壓力","用水下降與房價全面降低"], answer:1, why:"產業帶來機會，也吸引人口並增加生活壓力。", hint:"題目問的是機會和挑戰同時存在。", concept:"園區影響" },
  { prompt:"臺灣在全球科技供應鏈的重要角色是？", options:["只出口農產品","高階晶圓製造與產業分工","完全不依賴國際合作"], answer:1, why:"臺灣以晶圓製造、設計及分工合作成為重要節點。", hint:"晶片如何從設計變成實體？", concept:"科技成就" },
  { prompt:"專業晶圓製造為何有競爭力？", options:["不需要技術與人才","每家企業都做相同工作","長期專精製造並與設計端合作"], answer:2, why:"專業分工累積難以取代的技術和信任。", hint:"專精和合作各帶來什麼？", concept:"產業分工" },
  { prompt:"科技產業永續轉型最重要的方向是？", options:["增加用水但不公布資料","回收水、節能減排並兼顧居民","只追求產值並延長工時"], answer:1, why:"資源效率、減排及生活品質需一同考量。", hint:"找出能同時回應產業、環境與人的方案。", concept:"永續科技" },
];

const policyItems = [
  { text:"降低佃農租金，讓實際耕作者取得土地", answer:"土地改革", why:"減輕農民負擔並穩定農村生活。" },
  { text:"部分地主取得補償後轉投工商業", answer:"土地改革", why:"土地資源調整也間接促進工商活動。" },
  { text:"提供麵粉奶粉，改善物資短缺", answer:"美國援助", why:"援助先回應戰後民生急需。" },
  { text:"以貸款技術支援水庫與橋梁", answer:"美國援助", why:"基礎建設為生產和流通打底。" },
  { text:"靠近港口進口原料、組裝後外銷", answer:"加工出口", why:"海運連結原料輸入與產品出口。" },
  { text:"吸引農村青年與女性進入工廠", answer:"加工出口", why:"工作機會帶動人口與家庭角色改變。" },
];

const parkItems = [
  { text:"創造高科技工作與研發機會", answer:"發展機會", why:"產業聚落帶來就業、技術與投資。" },
  { text:"帶動醫療、商業與教育服務", answer:"發展機會", why:"人口與企業聚集會增加公共服務需求。" },
  { text:"促進大學、研究機構與企業合作", answer:"發展機會", why:"知識與技術交流提升創新能力。" },
  { text:"增加土地、水資源與電力需求", answer:"需要配套", why:"資源使用必須評估承載能力。" },
  { text:"房價租金上升、居民負擔增加", answer:"需要配套", why:"人口快速移入可能推高居住成本。" },
  { text:"車流增加，使通勤時間變長", answer:"需要配套", why:"園區成長需要同步規畫大眾運輸。" },
];

const chainData = [
  { title:"交通建設影響鏈", cards:["貨物與人員往來需求增加，興建高速公路","工廠、住宅與商店向交通便利處聚集","地方繁榮，也出現壅塞、噪音與汙染"] },
  { title:"高雄重工業轉型鏈", cards:["港口與既有工業吸引鋼鐵、石化、造船聚集","工作增加，人口、住宅與商業跟著成長","改善排放與綠地，並發展觀光、藝文與科技"] },
];

function ChoiceTask({item,taskKey,saved,setSaved,unscored=false,onHint}:{item:Choice;taskKey:string;saved:Saved;setSaved:React.Dispatch<React.SetStateAction<Saved>>;unscored?:boolean;onHint?:(cards:number[]|null)=>void}){
  const [picked,setPicked]=useState<number|null>(null); const right=picked===item.answer; const done=!!saved.correct[taskKey];
  function choose(i:number){setPicked(i);if(i===item.answer){onHint?.(null);if(!unscored)setSaved(s=>({...s,correct:{...s.correct,[taskKey]:true}}))}else onHint?.(item.cards??null)}
  return <div className={`choice-task ${done?"is-complete":""}`}><div className="task-heading">{done?"✓ 已完成":unscored?"暖身練習":"等待解鎖"}</div><h4>{item.prompt}</h4><div className="choice-grid">{item.options.map((o,i)=><button key={o} className={picked===i?(right?"right":"wrong"):""} onClick={()=>choose(i)}>{String.fromCharCode(65+i)}. {o}</button>)}</div>{picked!==null&&<div className={`feedback ${right?"good":"try"}`} role="status"><span>{right?`判斷有根據：${item.why}`:`思考提示：${item.hint}`}</span>{!right&&item.cards?.length&&<a className="hint-card-link" href={`#g6-u2-${taskKey.includes("l2")?2:taskKey.includes("l3")?3:1}-card-${item.cards[0]}`}>查看上方發亮的知識卡 ↑</a>}</div>}</div>
}

function Sorter({title,intro,items,categories,onHint}:{title:string;intro:string;items:typeof policyItems;categories:{name:string;clue:string}[];onHint:(cards:number[]|null)=>void}){
  const [selected,setSelected]=useState<number|null>(null),[dragged,setDragged]=useState<number|null>(null),[groups,setGroups]=useState<Record<number,string>>({}),[checked,setChecked]=useState(false);
  const placed=Object.keys(groups).length,done=placed===items.length,correct=done&&items.every((item,i)=>groups[i]===item.answer);
  function place(i:number,group:string){setGroups(current=>({...current,[i]:group}));setSelected(null);setDragged(null);setChecked(false)}
  return <div className="inquiry classify-inquiry g6-tool"><div className="classify-intro"><p className="eyebrow dark">動手探究・證據分類</p><h3>{title}</h3><p>{intro} 可拖曳，也能先點卡片再按「放入這欄」。</p><p className="classify-progress">已分類 <b>{placed}／{items.length}</b></p></div><div className="word-bank"><b>WORD BANK｜待分類線索</b><div>{items.map((item,i)=>groups[i]?null:<button key={item.text} draggable onDragStart={()=>setDragged(i)} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={selected===i?"selected":""}><span aria-hidden="true">⠿</span>{item.text}</button>)}</div></div><div className={`category-bins ${categories.length===2?"category-bins-two":""}`}>{categories.map(category=><section className="category-bin" key={category.name} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragged!==null)place(dragged,category.name)}}><header><b>{category.name}</b><span>{category.clue}</span></header>{selected!==null&&<button className="place-button" onClick={()=>place(selected,category.name)}>放入這欄</button>}<div className="bin-items">{items.map((item,i)=>groups[i]===category.name?<article key={item.text} className={checked?(item.answer===category.name?"item-correct":"item-wrong"):""}><b>{item.text}</b><button onClick={()=>{setGroups(current=>{const next={...current};delete next[i];return next});setChecked(false)}}>移回</button>{checked&&<p className={item.answer===category.name?"item-feedback good":"item-feedback try"}>{item.answer===category.name?`✓ ${item.why}`:`再想想：${item.why}`}</p>}</article>:null)}</div></section>)}</div><button className="tool-check" disabled={!done} onClick={()=>{setChecked(true);onHint(correct?null:[0,1,2])}}>檢查分類</button>{checked&&<p className={`tool-result ${correct?"correct":"retry"}`} role="status">{correct?"✓ 分類完成！你已把政策做法和影響連起來。":"紅色卡片需要換欄；先讀理由，再重新分類。"}</p>}</div>
}

function ChainPuzzle({onHint}:{onHint:(cards:number[]|null)=>void}){
  const [orders,setOrders]=useState([[2,0,1],[1,2,0]]),[selected,setSelected]=useState<{chain:number;index:number}|null>(null),[dragged,setDragged]=useState<{chain:number;index:number}|null>(null),[checked,setChecked]=useState(false);
  const correct=orders.every(order=>order.every((value,index)=>value===index));
  function swap(chain:number,index:number){const source=dragged?.chain===chain?dragged:selected?.chain===chain?selected:null;if(!source){setSelected({chain,index});return}setOrders(current=>current.map((order,c)=>{if(c!==chain)return order;const next=[...order];[next[source.index],next[index]]=[next[index],next[source.index]];return next}));setSelected(null);setDragged(null);setChecked(false)}
  return <div className="inquiry location-inquiry g6-tool"><div className="location-intro"><p className="eyebrow dark">動手探究・影響鏈排序</p><h3>從建設找到改變與代價</h3><p>每條都依「需求／條件 → 直接改變 → 長期影響」排列。可拖曳，或依序點兩張卡交換位置。</p></div><div className="impact-chains">{chainData.map((chain,c)=><section className="impact-chain" key={chain.title}><h4>{chain.title}</h4><div className="chain-role-labels" aria-hidden="true"><span>需求／條件</span><span>直接改變</span><span>長期影響</span></div><ol>{orders[c].map((itemIndex,index)=><li key={itemIndex} draggable onDragStart={()=>setDragged({chain:c,index})} onDragOver={e=>e.preventDefault()} onDrop={()=>swap(c,index)} className={selected?.chain===c&&selected.index===index?"selected":""}><button type="button" onClick={()=>swap(c,index)}><span className="drag-grip" aria-hidden="true">⠿</span><b>{chain.cards[itemIndex]}</b>{index<2&&<i aria-hidden="true">→</i>}</button></li>)}</ol></section>)}</div><button className="tool-check" onClick={()=>{setChecked(true);onHint(correct?null:[0,1,2])}}>檢查兩條影響鏈</button>{checked&&<p className={`tool-result ${correct?"correct":"retry"}`} role="status">{correct?"✓ 順序正確！公共建設先改變可達性與產業位置，再形成生活上的效益與代價。":"順序還要調整：先找為何要做，再找土地或人口的直接改變，最後才是長期結果。"}</p>}</div>
}

function certificateId(name:string){let value=0;for(const char of name)value=(value*31+char.charCodeAt(0))%100000;const d=new Date();return `G6U2-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}-${String(value).padStart(5,"0")}`}
function makeCertificate(name:string,score:number){const id=certificateId(name),canvas=document.createElement("canvas");canvas.width=1600;canvas.height=1100;const c=canvas.getContext("2d")!;c.fillStyle="#fffaf0";c.fillRect(0,0,1600,1100);c.strokeStyle="#0f766e";c.lineWidth=28;c.strokeRect(35,35,1530,1030);c.strokeStyle="#f4c95d";c.lineWidth=5;c.strokeRect(70,70,1460,960);c.textAlign="center";c.fillStyle="#0f766e";c.font="700 40px sans-serif";c.fillText("115 社會自主學習網・六年級",800,180);c.fillStyle="#083344";c.font="900 82px sans-serif";c.fillText("第二單元學習證書",800,315);c.fillStyle="#557176";c.font="34px sans-serif";c.fillText("恭喜",800,410);c.fillStyle="#083344";c.font="900 72px sans-serif";c.fillText(name,800,515);c.fillStyle="#557176";c.font="34px sans-serif";c.fillText("完成《戰後經濟轉型與生活轉變》自學任務",800,610);c.fillText("能分析政策、建設、產業與永續之間的影響",800,670);c.fillStyle="#ef6f51";c.font="900 48px sans-serif";c.fillText(`單元測驗最高成績 ${score} 分`,800,770);c.fillStyle="#557176";c.font="26px sans-serif";c.fillText(`證書編號：${id}`,800,860);c.fillText(`完成日期：${new Intl.DateTimeFormat("zh-TW",{dateStyle:"long"}).format(new Date())}`,800,910);const a=document.createElement("a");a.href=canvas.toDataURL("image/png");a.download=`六年級第二單元證書-${name}.png`;a.click()}

export default function Grade6Unit2(){
  const [saved,setSaved]=useState<Saved>(emptySaved),[ready,setReady]=useState(false),[answers,setAnswers]=useState<number[]>(Array(15).fill(-1)),[result,setResult]=useState<number|null>(null),[highlights,setHighlights]=useState<string[]>([]);
  useEffect(()=>{const t=setTimeout(()=>{try{const raw=localStorage.getItem(STORE);if(raw){const value={...emptySaved,...JSON.parse(raw)};setSaved(value);setAnswers(value.quizAnswers)}}catch{localStorage.removeItem(STORE)}setReady(true)},0);return()=>clearTimeout(t)},[]);
  useEffect(()=>{if(ready)localStorage.setItem(STORE,JSON.stringify(saved))},[saved,ready]);
  const lessonDone=lessons.map(lesson=>lesson.challenges.every((_,i)=>saved.correct[`g6u2l${lesson.id}c${i}`])&&saved.correct[`g6u2l${lesson.id}s`]);
  const completed=Object.values(saved.correct).filter(Boolean).length,progress=Math.round(completed/12*100),eligible=lessonDone.every(Boolean)&&saved.quizBest>=80;
  const review=useMemo(()=>quiz.filter((_,i)=>answers[i]!==-1&&answers[i]!==quiz[i].answer).map(q=>q.concept).filter((v,i,a)=>a.indexOf(v)===i),[answers]);
  function submit(){if(answers.some(a=>a<0)){setResult(-1);return}const score=Math.round(answers.filter((answer,i)=>answer===quiz[i].answer).length/15*100);setResult(score);setSaved(current=>({...current,quizBest:Math.max(current.quizBest,score),quizAnswers:answers}))}
  function hint(lesson:number,cards:number[]|null){setHighlights(cards?cards.map(card=>`${lesson}-${card}`):[])}
  return <main className="grade6-unit1 grade6-unit2"><section className="hero hero-grade6 hero-g6u2" aria-labelledby="g6u2-title"><nav className="topbar"><Link className="brand" href="/courses"><span className="brand-mark">島</span><span>115 社會自主學習網</span></Link><div className="nav-links"><Link href="/courses">課程入口</Link><a href="#missions">任務</a><a href="#quiz">測驗</a><a href="#finish">證書</a></div><span className="progress-pill">學習進度 {progress}%</span></nav><div className="g6-hero-image" aria-hidden="true"><img src={`${assetBase}/grade6/unit2-economic-transformation-hero.png`} alt=""/></div><div className="hero-grid" id="top"><div className="g6-hero-copy"><p className="eyebrow">六年級社會・第二單元</p><h1 id="g6u2-title">一座島，<br/><em>如何改變工作與生活？</em></h1><p className="lead">從土地改革、公共建設到晶圓產業，用證據追蹤臺灣戰後經濟轉型的機會、代價與永續選擇。</p><a className="primary-button" href="#base">開始追蹤影響 <span>→</span></a><p className="privacy-note">免登入即可學習・進度只保存在這個裝置</p></div></div><div className="wave"/></section>
  <section className="section base-section" id="base"><div className="section-heading"><div><p className="eyebrow dark">出發前・先備知識不計分</p><h2>公共選擇暖身</h2></div><p>先回想交通、公共建設與產業發展的基本因果。答錯會得到提示，不影響任務進度。</p></div><div className="warmups">{warmups.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`g6u2warm${i}`} saved={saved} setSaved={setSaved} unscored/>)}</div></section>
  <section className="mission-overview" id="missions"><div><p className="eyebrow">本單元任務</p><h2>三座轉型觀測站</h2><p>每站閱讀 3 張圖文知識卡，操作探究工具，再完成 3 題挑戰與 1 題生活情境。</p><Link className="next-unit-link" href="/courses">← 返回課程入口</Link></div><div className="badge-row">{lessons.map((lesson,i)=><a key={lesson.id} href={`#g6-u2-lesson-${lesson.id}`} className={lessonDone[i]?"badge won":"badge"}><span>{lessonDone[i]?"✓":lesson.icon}</span><b>{lesson.title}</b><small>{lessonDone[i]?"徽章已取得":"等待探索"}</small></a>)}</div></section>
  {lessons.map((lesson,li)=><section key={lesson.id} className={`lesson ${lesson.id===2?"lesson-ochre":"lesson-green"}`} id={`g6-u2-lesson-${lesson.id}`}><div className="section lesson-inner"><header className="lesson-header"><div className="lesson-number">0{lesson.id}</div><div><p className="eyebrow dark">{lesson.kicker}</p><h2>{lesson.title}</h2><p>{lesson.question}</p></div><div className={`big-badge ${lessonDone[li]?"won":""}`}>{lessonDone[li]?"✓":lesson.icon}<small>{lessonDone[li]?"完成":"進行中"}</small></div></header><div className="concept-strip">{lesson.concepts.map(x=><span key={x}>{x}</span>)}</div><div className="cards">{lesson.cards.map((card,i)=><article key={card.title} id={`g6-u2-${lesson.id}-card-${i}`} tabIndex={-1} className={`knowledge-card ${highlights.includes(`${lesson.id}-${i}`)?"is-hint":""}`}><span className="card-count">0{i+1}</span><p className="card-tag">{card.tag}</p><h3>{card.title}</h3><div className="card-visual">{card.visual.map((x,j)=><span key={x}><b>{x}</b>{j<card.visual.length-1&&<i aria-hidden="true">→</i>}</span>)}</div><p className="card-body">{card.text}</p><p className="card-bridge"><b>思考提示｜想一想為什麼？</b>{card.bridge}</p></article>)}</div>{lesson.id===1?<Sorter title="哪項證據屬於哪個轉型力量？" intro="把做法與影響放回土地改革、美援或加工出口。" items={policyItems} categories={[{name:"土地改革",clue:"農民、地主與土地關係"},{name:"美國援助",clue:"物資、貸款、技術與建設"},{name:"加工出口",clue:"港口、工廠、外銷與勞動力"}]} onHint={cards=>hint(1,cards)}/>:lesson.id===2?<ChainPuzzle onHint={cards=>hint(2,cards)}/>:<Sorter title="科學園區帶來機會，還是需要配套？" intro="同一座園區會同時創造機會與壓力，請把證據分成兩欄。" items={parkItems} categories={[{name:"發展機會",clue:"就業、服務、研究與創新"},{name:"需要配套",clue:"資源、居住、交通與環境"}]} onHint={cards=>hint(3,cards)}/>}<div className="challenge-zone"><div className="zone-heading"><p className="eyebrow dark">證據挑戰</p><h3>用知識卡完成 3 關</h3></div>{lesson.challenges.map((q,i)=><ChoiceTask key={q.prompt} item={q} taskKey={`g6u2l${lesson.id}c${i}`} saved={saved} setSaved={setSaved} onHint={cards=>hint(lesson.id,cards)}/>)}</div><div className="scenario"><div className="scenario-label">生活情境題</div><ChoiceTask item={lesson.scenario} taskKey={`g6u2l${lesson.id}s`} saved={saved} setSaved={setSaved} onHint={cards=>hint(lesson.id,cards)}/></div></div></section>)}
  <section className="section quiz-section" id="quiz"><div className="section-heading"><div><p className="eyebrow dark">最後檢核・不限次重試</p><h2>15 題單元測驗</h2></div><div className="score-orb"><span>{saved.quizBest}</span><small>最高分</small></div></div><p className="quiz-note">完成全部題目再送出；每題都有解析，未達 80 分可依複習方向再挑戰。</p><div className="quiz-list">{quiz.map((q,i)=><fieldset key={q.prompt}><legend><span>{String(i+1).padStart(2,"0")}</span>{q.prompt}</legend>{q.options.map((o,j)=><label key={o} className={answers[i]===j?"selected":""}><input type="radio" name={`g6u2q${i}`} checked={answers[i]===j} onChange={()=>setAnswers(current=>current.map((value,k)=>k===i?j:value))}/>{o}</label>)}{result!==null&&result>=0&&<p className={answers[i]===q.answer?"explain correct":"explain incorrect"}>{answers[i]===q.answer?"✓":"→"} {q.why}</p>}</fieldset>)}</div><button className="submit-button" onClick={submit}>送出 15 題答案</button>{result===-1&&<p className="feedback try" role="alert">還有題目沒完成，請檢查每一題。</p>}{result!==null&&result>=0&&<div className={`result-panel ${result>=80?"pass":"review"}`} role="status"><span className="result-score">{result}</span><div><h3>{result>=80?"通過挑戰！":"再複習一次就更穩了"}</h3><p>{result>=80?"已達 80 分門檻。完成三站任務後即可領取圖片證書。":`建議複習：${review.join("、")||"錯題解析"}。`}</p></div></div>}</section>
  <section className="finish" id="finish"><div className="section finish-grid"><div><p className="eyebrow">結業站</p><h2>{eligible?"轉型觀察力已解鎖！":"再完成一點，就能領證書。"}</h2><p className="finish-lead">{eligible?"你能從政策、建設與產業證據分析生活改變，也能評估發展與永續的取捨。輸入姓名即可下載 PNG 圖片證書。":"完成三枚任務徽章，並讓測驗最高分達 80 分，即可解鎖第二單元證書。"}</p><div className="checklist">{lessonDone.map((done,i)=><p key={i} className={done?"done":""}><span>{done?"✓":"○"}</span>{lessons[i].title}：挑戰與生活情境</p>)}<p className={saved.quizBest>=80?"done":""}><span>{saved.quizBest>=80?"✓":"○"}</span>單元測驗最高分達 80 分</p></div></div><div className="certificate-card"><div className="cert-mark">觀察家</div><p>學習回饋</p><h3>{saved.name||"你的名字"}</h3><p>{completed===12?"你已完成 12 項任務，能用證據解釋臺灣經濟與生活的轉型。":`已完成 ${completed}／12 項任務，下一步前往尚未取得的徽章。`}</p><label>證書姓名<input value={saved.name} maxLength={20} placeholder="請輸入姓名" onChange={e=>setSaved(current=>({...current,name:e.target.value}))}/></label><button disabled={!eligible||!saved.name.trim()} onClick={()=>makeCertificate(saved.name.trim(),saved.quizBest)}>下載 PNG 圖片證書</button><small>姓名與進度只留在本機，不會上傳。證書編號本身不會連結個人紀錄。</small></div></div></section>
  <footer><Link className="brand" href="/courses"><span className="brand-mark">島</span><span>115 社會自主學習網</span></Link><p>依據六年級第二單元教材概念重新設計，未重製課本頁面與插圖。</p><button onClick={()=>{if(confirm("確定清除六年級第二單元的本機進度嗎？")){localStorage.removeItem(STORE);location.reload()}}}>清除本單元進度</button></footer></main>
}
