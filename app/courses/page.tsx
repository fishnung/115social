import Image from "next/image";
import Link from "next/link";

const units = [
  { href: "/", number: "01", title: "臺灣的位置與先民足跡", subtitle: "位置 × 證據 × 共生智慧", image: "/og.png", alt: "臺灣時空探險隊第一單元主視覺", lessons: "3 課・12 項任務・15 題測驗" },
  { href: "/unit2", number: "02", title: "臺灣登上國際舞臺", subtitle: "航路 × 政權 × 文化足跡", image: "/unit2/east-asia-route-evidence.png", alt: "臺灣與東亞航路交會圖", lessons: "2 課・8 項任務・15 題測驗" },
];

export default function Courses(){return <main className="course-gateway"><section className="gateway-hero"><div className="gateway-brand"><span className="brand-mark">島</span><span>臺灣時空探險隊</span></div><p className="eyebrow">五年級社會・自主學習入口</p><h1>選一條時空航線，<br/>開始今天的探索。</h1><p>每個單元都有知識卡、互動探究、證據挑戰、單元測驗與圖片證書。進度會分別保存在這個裝置。</p></section><section className="gateway-units" aria-label="課程單元">{units.map(unit=><article className="gateway-card" key={unit.href}><Image src={unit.image} alt={unit.alt} width={1600} height={900}/><div><span className="unit-number">UNIT {unit.number}</span><h2>{unit.title}</h2><p>{unit.subtitle}</p><small>{unit.lessons}</small><Link href={unit.href}>進入單元 <span aria-hidden="true">→</span></Link></div></article>)}</section></main>}
