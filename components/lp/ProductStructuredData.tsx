import { SPOT_PLANS } from "../../lib/spot-plans";

export default function ProductStructuredData() {
  const data={
    "@context":"https://schema.org",
    "@type":"Product",
    "@id":"https://plan.todokede.jp/#product",
    name:"トドケデ 消防計画",
    description:"所在地と建物情報を入力するだけで、所轄消防本部の様式に沿った消防計画をWord形式で自動作成するクラウド型サービス。全国20の消防本部の様式に対応。",
    brand:{"@type":"Brand",name:"トドケデ"},
    manufacturer:{"@id":"https://plan.todokede.jp/#org"},
    offers:SPOT_PLANS.map(plan=>({"@type":"Offer",name:plan.name,price:plan.price,priceCurrency:"JPY",url:`https://plan.todokede.jp/?plan=${plan.id}#form`,description:plan.description})),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\u003c")}} />;
}
