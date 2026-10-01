import type { FaqItem } from "../lib/premium-faqs";

export function FaqAnswer({ item }: { item: FaqItem }) {
  const link = item.link;
  if (!link) return <>{item.a}</>;

  const start = item.a.indexOf(link.text);
  if (start < 0) return <>{item.a}</>;

  return (
    <>
      {item.a.slice(0, start)}
      <a href={link.href} style={{ color: "#2E5F9E", textDecoration: "underline" }}>
        {link.text}
      </a>
      {item.a.slice(start + link.text.length)}
    </>
  );
}
