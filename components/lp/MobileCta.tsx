"use client";

import { useEffect, useState } from "react";

export default function MobileCta() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const form=document.getElementById("form");
    if(!form) return;
    const observer=new IntersectionObserver(([entry])=>setVisible(!entry.isIntersecting));
    observer.observe(form);
    return ()=>observer.disconnect();
  },[]);
  return <div className="lp-mobile-cta" hidden={!visible}><a className="lp-button lp-button-primary" href="#form">作成をはじめる</a></div>;
}
