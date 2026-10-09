import Link from "next/link";
import { SPOT_PLANS } from "../../lib/spot-plans";
import { NEWLY_ADDED_DEPTS } from "../../lib/updates";
import { concerns, features, steps, reasons, comparison, testimonials, supportedDepts } from "./content";
import IsoInput from "../illustrations/IsoInput";
import IsoPlans from "../illustrations/IsoPlans";
import IsoDownload from "../illustrations/IsoDownload";
import IsoStationPin from "../illustrations/IsoStationPin";
import IsoBookSteps from "../illustrations/IsoBookSteps";
import IsoClock from "../illustrations/IsoClock";
import IsoReceiptCoins from "../illustrations/IsoReceiptCoins";
import IsoFireStation from "../illustrations/IsoFireStation";

export function EvidenceBand() {
  return <section className="lp-stats lp-section" data-lp-section="実績帯"><div className="lp-container lp-stats-grid">
    <div><strong>累計100件</strong><p>消防書類の作成実績</p><span>（代行実績を含む）</span></div>
    <div><strong>20本部</strong><p>対応消防本部</p></div>
    <div><strong>約15分</strong><p>作成時間</p></div>
  </div></section>;
}

export function Concerns() {
  return <section className="lp-section lp-white" data-lp-section="課題提起"><div className="lp-reading">
    <h2>こんなことで、止まっていませんか？</h2>
    <ul className="lp-concerns">{concerns.map(text => <li key={text}><span aria-hidden="true">✓</span><p>{text}</p></li>)}</ul>
    <p className="lp-section-note">その「分からない」を、入力ガイドと所轄様式の自動判定で解消します。</p>
  </div></section>;
}

export function Benefits() {
  const illustrations = [IsoStationPin, IsoBookSteps, IsoClock, IsoReceiptCoins];
  return <section className="lp-section lp-muted" data-lp-section="トドケデなら、こう変わります"><div className="lp-container">
    <h2>トドケデなら、こう変わります</h2>
    <div className="lp-benefit-grid">{features.map((feature, i) => { const Illustration=illustrations[i]; return <article className="lp-card lp-benefit" key={feature.title}>
      <div className="lp-benefit-art"><Illustration /></div><h3>{feature.title}</h3><p>{feature.body}</p>
    </article>; })}</div>
  </div></section>;
}

export function Reasons() {
  return <section className="lp-section lp-white" data-lp-section="選ばれる理由"><div className="lp-container">
    <h2>はじめてでも、安心して提出できる理由</h2><div className="lp-reason-grid">
      {reasons.map(reason => <article className="lp-reason" key={reason.title}><span className="lp-check" aria-hidden="true">✓</span><div><h3>{reason.title}</h3><p>{reason.body}</p></div></article>)}
    </div><p className="lp-section-note"><Link href="/shobo-keikaku-no-kakikata">はじめての方へ：消防計画の書き方をわかりやすく解説 →</Link></p>
  </div></section>;
}

export function Flow() {
  const illustrations=[IsoInput,IsoPlans,IsoDownload];
  return <section id="how-it-works" className="lp-section lp-muted" data-lp-section="ご利用の流れ"><div className="lp-container">
    <h2>ご利用の流れ</h2><ol className="lp-flow">{steps.map((step,i) => {const Illustration=illustrations[i];return <li className="lp-card" key={step.n}>
      <span className="lp-step-number">{step.n}</span><div className="lp-flow-art"><Illustration /></div><h3>{step.title}</h3><p>{step.body}</p>
    </li>;})}</ol>
  </div></section>;
}

export function Departments() {
  return <section id="departments" className="lp-section lp-white" data-lp-section="対応している消防本部"><div className="lp-container lp-departments">
    <div className="lp-department-intro"><h2>対応している消防本部</h2><p className="lp-section-note">2026年6月、政令指定都市の対応を拡大し、計{supportedDepts.length}本部に対応しました。対応エリア外は標準様式で出力されます。</p><IsoFireStation /></div>
    <ul className="lp-department-list">{supportedDepts.map(dept => <li key={dept}><span>{dept}</span>{NEWLY_ADDED_DEPTS.has(dept) && <span className="lp-new">NEW</span>}</li>)}</ul>
  </div></section>;
}

export function Comparison() {
  return <section className="lp-section lp-muted" data-lp-section="他の作り方との比較"><div className="lp-container">
    <h2>他の作り方と、比べてみてください</h2><div className="lp-table-scroll"><table className="lp-comparison">
      <caption className="lp-sr-only">他の作り方と、比べてみてください</caption><thead><tr><th scope="col"> </th>{comparison.map(column => <th scope="col" className={column.highlight ? "lp-highlight-column" : undefined} key={column.name}>{column.highlight ? <><span className="lp-comparison-label">いちばん手軽</span>トドケデ 消防計画</> : column.name}</th>)}</tr></thead>
      <tbody>{comparison[0].rows.map(([label],i) => <tr key={label}><th scope="row">{label}</th>{comparison.map(column => <td className={column.highlight ? "lp-highlight-column" : undefined} key={column.name}>{column.rows[i][1]}</td>)}</tr>)}</tbody>
    </table></div><p className="lp-fine-print">※金額・時間は一般的な目安です。行政書士へ依頼した場合の費用は依頼先により異なります。</p>
  </div></section>;
}

export function Testimonials() {
  return <section className="lp-section lp-white" data-lp-section="お客様の声"><div className="lp-container">
    <h2>お客様の声</h2><div className="lp-three-grid">{testimonials.map(item => <figure className="lp-card lp-testimonial" key={item.author}><blockquote><p>「{item.quote}」</p></blockquote><figcaption>- {item.author}</figcaption></figure>)}</div>
  </div></section>;
}

export function Pricing() {
  return <section id="pricing" className="lp-section lp-muted" data-lp-section="料金"><div className="lp-container">
    <h2>料金</h2><p className="lp-section-note">1件ごとの都度払い（買い切り）。月額料金・更新料はかかりません。</p>
    <div className="lp-three-grid lp-price-grid">{SPOT_PLANS.map(plan => <article className={`lp-card lp-price-card${plan.recommended ? " lp-recommended" : ""}`} key={plan.id}>
      {plan.recommended && <span className="lp-recommended-label">おすすめ</span>}<h3>{plan.name}</h3><p>{plan.description}</p>
      <p className="lp-price"><strong>{plan.priceLabel}</strong><span> /件（税込）</span></p>
      <ul>{plan.features.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
      <a className={`lp-button ${plan.recommended ? "lp-button-primary" : "lp-button-secondary"}`} data-plan={plan.id} href={`/?plan=${plan.id}#form`}>{plan.name}で作成する</a>
    </article>)}</div>
    <p className="lp-section-note">書類の作成や修正まで任せたい方は、<a href="https://daikou.todokede.jp/">行政書士連携の代行サービス</a>をご利用ください。</p>
    <div className="lp-plan-comparison"><h3>プランをじっくり比較したい方へ</h3><p>ライト・スタンダード・プレミアムの違いを一覧でご確認いただけます。料金は1件ごとの都度払い（買い切り）です。</p><Link href="/pricing">プランを比較する</Link><p><Link href="/pricing">プランの詳しい比較を見る</Link></p></div>
  </div></section>;
}

export function FinalCta() {
  return <section className="lp-section lp-final-cta" data-lp-section="最終CTA"><div className="lp-reading"><h2>準備ができたら、作成をはじめる</h2><a className="lp-button lp-button-primary" href="#form">作成をはじめる</a></div></section>;
}
