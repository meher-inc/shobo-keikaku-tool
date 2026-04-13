import {
  AlignmentType,
  Document,
  Footer,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TextRun,
} from "docx";
import { loadPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import type { TemplatePack, Chapter, Section } from "../types/template-pack";
import { buildChildrenFromPack, type SectionOverride } from "../builders/document";
import { buildCoverPage } from "../builders/shared/cover-page";
import { toRenderData } from "./to-render-data";
import kyotoCityFull from "../templates/kyoto-city.full.json";

// Kyoto dept logic — pure string selectors.
import {
  applicableLabel,
  drillRequirement,
  legalBasis,
  reportFrequency,
  reportFrequencyPhrase,
} from "../builders/kyoto/logic";

// TS-built table overrides (each returns (Paragraph | Table)[]).
import { buildCh3ReportsTable } from "../builders/kyoto/tables/ch3-reports";
import { buildCh7EmergencyTable } from "../builders/kyoto/tables/ch7-emergency";
import { buildCh9EducationTable } from "../builders/kyoto/tables/ch9-education";
import { buildCh10DrillsTable } from "../builders/kyoto/tables/ch10-drills";

// Appendix builders.
import {
  buildKyotoAppendices,
  buildKyotoAppendixList,
} from "../builders/kyoto/appendices";

/**
 * Build the full Kyoto-city medium-scale 消防計画 (chapters 1-10,
 * 附則, 別表等一覧, 別表 1-9) from the kyoto-city.full.json pack +
 * TS-built tables and appendices.
 *
 * This is the Step 4b production path, called by runV2Adapter when
 * pack=full. It deliberately does NOT call renderPack() — the
 * sample-pack path uses renderPack, and the two paths stay fully
 * isolated per the "never break past work" principle.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildKyotoFull(form: any): Promise<Buffer> {
  const loaded = loadPack(kyotoCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  // ── dept logic injection ──────────────────────────────────
  // Derive Kyoto-specific word-swap strings and put them into
  // RenderData so they're accessible as plain placeholders /
  // computed args inside JSON and TS builders.
  const isUnified = data.isUnifiedManagement === "true";
  const isSpecific = data.isSpecificUse === "true";

  data.legalBasis = legalBasis(isUnified);
  data.unifiedLabel = applicableLabel(isUnified);
  data.outsourcedLabel = applicableLabel(data.hasOutsourcedManagement === "true");
  data.reportFrequency = reportFrequency(isSpecific);
  data.reportFrequencyPhrase = reportFrequencyPhrase(isSpecific);
  data.drillRequirement = drillRequirement(isSpecific);

  // 附則 eraDate — default to "now" if caller didn't supply one.
  if (!data.creationDateIso) {
    data.creationDateIso = new Date().toISOString();
  }
  // Cover page needs a formatted date string. If the form only
  // supplied creation_date_iso (not the pre-formatted creation_date),
  // derive it here — same logic as v1 route.ts L69-71.
  if (!data.creationDate && data.creationDateIso) {
    const d = new Date(data.creationDateIso);
    if (!Number.isNaN(d.getTime())) {
      data.creationDate = d.toLocaleDateString("ja-JP-u-ca-japanese", {
        era: "long", year: "numeric", month: "long", day: "numeric",
      });
    }
  }

  // ── section filtering ─────────────────────────────────────
  // Some JSON sections are conditional: the adapter decides
  // which to include, then hands a filtered pack to
  // buildChildrenFromPack. This keeps condition logic in TS
  // and JSON free of conditional nodes.
  const filteredPack = filterPack(loaded, data);

  // ── section overrides (TS table builders + styled text) ────
  const overrides: Record<string, SectionOverride> = {
    "ch3-reports": (d) => buildCh3ReportsTable(d),
    "ch7-emergency-contacts": (d) => buildCh7EmergencyTable(d),
    "ch9-education-schedule": (d) => buildCh9EducationTable(d),
    "ch10-schedule": (d) => buildCh10DrillsTable(d),
    // ch8 tsunami footer — italic + gray to match v1 L431.
    "ch8-tsunami-note": () => [
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "※京都市は津波による被害が想定されていないため、南海トラフ地震に関する計画の記載義務はありません。",
            italics: true,
            color: "666666",
            size: 18,
            font: "游明朝",
          }),
        ],
      }),
    ],
  };

  // ── cover page ─────────────────────────────────────────────
  const isUnifiedLabel = applicableLabel(isUnified);
  const coverChildren = buildCoverPage(data, {
    subtitle: `統括防火管理〔${isUnifiedLabel}〕`,
  });

  // ── assemble ──────────────────────────────────────────────
  const packChildren = buildChildrenFromPack(filteredPack, data, overrides);
  const appendixListChildren = buildKyotoAppendixList(data);
  const appendixChildren = buildKyotoAppendices(data);

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...appendixListChildren,
    ...appendixChildren,
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          titlePage: true, // cover page gets no header/footer
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "游ゴシック" }),
                  new TextRun({ text: " / ", size: 18, font: "游ゴシック" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "游ゴシック" }),
                ],
              }),
            ],
          }),
        },
        children: allChildren,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// ── pack filtering helpers ────────────────────────────────────

/**
 * Which JSON section IDs to DROP based on current RenderData.
 * Returns a Set of section.id values to exclude.
 */
function sectionsToSkip(data: RenderData): Set<string> {
  const skip = new Set<string>();
  const outsourced = data.hasOutsourcedManagement === "true";

  // ch1 scope + outsource: keep ONE variant of each pair.
  // v1 L241-253: section 2 has ⑶ only when outsourced;
  // section 3 heading suffix and body differ by outsourced flag.
  if (outsourced) {
    skip.add("ch1-scope");                     // use outsource variant with ⑶
    skip.add("ch1-outsource-not-applicable");   // use 〔該当〕 variant
  } else {
    skip.add("ch1-scope-outsource");            // use default variant without ⑶
    skip.add("ch1-outsource-applicable");       // use 〔非該当〕 variant
  }

  // ch7-security: only include when a security company is set.
  if (!data.securityCompany) {
    skip.add("ch7-security");
  }

  // ch8 earthquake activities: keep ONE of the two variants.
  if (data.temporaryAssemblyPoint) {
    skip.add("ch8-earthquake-activities-no-assembly");
  } else {
    skip.add("ch8-earthquake-activities-with-assembly");
  }

  return skip;
}

function filterPack(pack: TemplatePack, data: RenderData): TemplatePack {
  const skip = sectionsToSkip(data);
  if (skip.size === 0) return pack;

  return {
    ...pack,
    chapters: pack.chapters.map((chapter: Chapter) => ({
      ...chapter,
      sections: chapter.sections.filter(
        (section: Section) => !skip.has(section.id)
      ),
    })),
  };
}
