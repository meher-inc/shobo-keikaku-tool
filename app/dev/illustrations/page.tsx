import { notFound } from "next/navigation";
import IsoHero from "../../../components/illustrations/IsoHero";
import IsoInput from "../../../components/illustrations/IsoInput";
import IsoPlans from "../../../components/illustrations/IsoPlans";
import IsoDownload from "../../../components/illustrations/IsoDownload";
import IsoStationPin from "../../../components/illustrations/IsoStationPin";
import IsoBookSteps from "../../../components/illustrations/IsoBookSteps";
import IsoClock from "../../../components/illustrations/IsoClock";
import IsoReceiptCoins from "../../../components/illustrations/IsoReceiptCoins";
import IsoFireStation from "../../../components/illustrations/IsoFireStation";

export default function IllustrationsPage() {
  if(process.env.NODE_ENV!=="development") notFound();
  const illustrations=[IsoHero,IsoInput,IsoPlans,IsoDownload,IsoStationPin,IsoBookSteps,IsoClock,IsoReceiptCoins,IsoFireStation];
  return <div className="lp-renewal lp-section lp-white lp-illustration-gallery"><div className="lp-container"><h1>イラスト確認</h1><div className="lp-gallery-grid">{illustrations.map((Illustration,i)=><figure className="lp-card" key={i}><figcaption>I-{String(i+1).padStart(2,"0")}</figcaption><Illustration /></figure>)}</div></div></div>;
}
