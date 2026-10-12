import Image from "next/image";
import Link from "next/link";

const units = [
  { href: "/", number: "01", title: "臺灣的位置與先民足跡", subtitle: "位置 × 證據 × 共生智慧", image: "/og.png", alt: "臺灣時空探險隊第一單元主視覺", lessons: "3 課・12 項任務・15 題測驗" },
  { href: "/unit2", number: "02", title: "臺灣登上國際舞臺", subtitle: "航路 × 政權 × 文化足跡", image: "/unit2/east-asia-route-evidence.png", alt: "臺灣與東亞航路交會圖", lessons: "2 課・8 項任務・15 題測驗" },
];

export default function Courses(){return <main className="course-gateway"><section className="gateway-hero"><div className="gateway-brand"><span className="brand-mark">島</span><span>115 社會自主學習網</span></div><p className="eyebrow">國小社會・自主學習入口</p><h1>選擇年級，<br/>開始今天的探索。</h1><p>每個單元都有知識卡、互動探究、證據挑戰、單元測驗與圖片證書。進度會分別保存在這個裝置。</p><div className="grade-entrances" aria-label="選擇年級"><a href="#grade5"><b>五年級</b><span>已有 2 個單元</span></a><div aria-disabled="true"><b>六年級</b><span>課程準備中</span></div></div></section><section className="grade-section" id="grade5"><div className="grade-heading"><p className="eyebrow">GRADE 5</p><h2>五年級社會</h2><p>從臺灣的位置與先民足跡，走進大航海時代的世界交流。</p></div><div className="gateway-units" aria-label="五年級課程單元">{units.map(unit=><article className="gateway-card" key={unit.href}><Image src={unit.image} alt={unit.alt} width={1600} height={900}/><div><span className="unit-number">UNIT {unit.number}</span><h2>{unit.title}</h2><p>{unit.subtitle}</p><small>{unit.lessons}</small><Link href={unit.href}>進入單元 <span aria-hidden="true">→</span></Link></div></article>)}</div></section><section className="grade-section grade-coming" aria-label="六年級課程"><div className="grade-heading"><p className="eyebrow">GRADE 6</p><h2>六年級社會</h2><p>課程尚未開始製作，完成後會從這裡進入。</p></div><div className="coming-card"><span>六</span><div><b>六年級課程準備中</b><p>新的學習路線將在這裡上線。</p></div></div></section></main>}
