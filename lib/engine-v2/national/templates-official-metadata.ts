/**
 * 12 公式 docx テンプレートの変数メタデータ (UI 表示用)。
 *
 * 各 pack の `{{var}}` プレースホルダに対し:
 *   - label: 日本語ラベル
 *   - type: input 種別 (text / multiline / date / phone / number)
 *   - required: 必須かどうか
 *   - placeholder: 入力 placeholder
 *   - section: フォームグルーピング (画面表示時の見出し)
 *
 * Phase 4 (UI <-> docx 統合) で本ファイルから動的フォームを生成し、
 * docxtemplater に flat key-value で渡す。
 *
 * 全 var は docxtemplater テンプレートの `{{key}}` と一致する必要がある。
 * 変更時は対応する templates-official/*.docx と整合性を確認すること。
 */

export type FieldType =
  | "text"
  | "multiline"
  | "date"
  | "phone"
  | "number"
  | "checkbox";  // boolean → ☑/□ (renderer converts at substitution time)

export interface OfficialFieldMeta {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface OfficialSectionMeta {
  id: string;
  heading: string;
  description?: string;
  fields: OfficialFieldMeta[];
}

export interface OfficialPackMeta {
  packName: string;
  sections: OfficialSectionMeta[];
}

// ============================================================================
// 共通フィールド定義 (再利用)
// ============================================================================
const submitDate: OfficialFieldMeta = { key: "submitDate", label: "提出日", type: "date", required: true };
const municipality: OfficialFieldMeta = { key: "municipality", label: "市町村", type: "text", required: true, placeholder: "例: 京都市" };
const recipientTitle: OfficialFieldMeta = { key: "recipientTitle", label: "提出先肩書", type: "text", required: true, placeholder: "例: 消防署長" };

const submitterAddress: OfficialFieldMeta = { key: "submitterAddress", label: "申請者・届出者 住所", type: "text", required: true };
const submitterName: OfficialFieldMeta = { key: "submitterName", label: "申請者・届出者 氏名", type: "text", required: true, placeholder: "法人の場合は名称及び代表者氏名" };
const submitterPhone: OfficialFieldMeta = { key: "submitterPhone", label: "申請者・届出者 電話番号", type: "phone", required: true };

const ownerAddress: OfficialFieldMeta = { key: "ownerAddress", label: "設置者 住所", type: "text", required: true };
const ownerName: OfficialFieldMeta = { key: "ownerName", label: "設置者 氏名", type: "text", required: true };
const ownerPhone: OfficialFieldMeta = { key: "ownerPhone", label: "設置者 電話番号", type: "phone", required: false };
const ownerNameField: OfficialFieldMeta = { key: "ownerNameField", label: "設置者氏名 (補助欄)", type: "text", required: false, helpText: "氏名欄の右側に表示される追加情報。空欄可。" };

const facilityLocation: OfficialFieldMeta = { key: "facilityLocation", label: "設置場所", type: "text", required: true };
const facilityKind: OfficialFieldMeta = { key: "facilityKind", label: "製造所等の別", type: "text", required: true, placeholder: "例: 屋内貯蔵所" };
const facilityCategory: OfficialFieldMeta = { key: "facilityCategory", label: "貯蔵所又は取扱所の区分", type: "text", required: false, placeholder: "例: 一般取扱所" };
const hazmatClassAndName: OfficialFieldMeta = { key: "hazmatClassAndName", label: "危険物の類、品名（指定数量）、最大数量", type: "multiline", required: true, placeholder: "例: 第4類 第1石油類（200L） 最大1,000L" };
const designatedQuantityMultiple: OfficialFieldMeta = { key: "designatedQuantityMultiple", label: "指定数量の倍数", type: "text", required: true, placeholder: "例: 5倍", helpText: "単位「倍」も含めて入力してください (例: 5倍)" };
const fireZone: OfficialFieldMeta = { key: "fireZone", label: "防火地域別", type: "text", required: false, placeholder: "例: 準防火地域" };
const useZone: OfficialFieldMeta = { key: "useZone", label: "用途地域別", type: "text", required: false, placeholder: "例: 工業地域" };

const permitInfo: OfficialFieldMeta = { key: "permitInfo", label: "設置の許可年月日及び許可番号", type: "text", required: false, placeholder: "例: 令和7年1月1日 第1号" };
const inspectionInfo: OfficialFieldMeta = { key: "inspectionInfo", label: "設置の完成検査年月日及び検査番号", type: "text", required: false, placeholder: "例: 令和7年3月1日 第2号" };

const officialUseReceipt: OfficialFieldMeta = { key: "officialUseReceipt", label: "※受付欄 (行政記入)", type: "text", required: false, helpText: "行政側で記入されます。通常は空欄のままで提出。" };
const officialUseProgress: OfficialFieldMeta = { key: "officialUseProgress", label: "※経過欄 (行政記入)", type: "text", required: false, helpText: "行政側で記入されます。" };
const officialUseFee: OfficialFieldMeta = { key: "officialUseFee", label: "※手数料欄 (行政記入)", type: "text", required: false };
const officialUseRemarks: OfficialFieldMeta = { key: "officialUseRemarks", label: "※備考欄 (行政記入)", type: "text", required: false };
const officialPermitDateAndNumber: OfficialFieldMeta = { key: "officialPermitDateAndNumber", label: "※許可年月日・許可番号 (行政記入)", type: "text", required: false };
const officialApprovalDateAndNumber: OfficialFieldMeta = { key: "officialApprovalDateAndNumber", label: "※承認年月日・承認番号 (行政記入)", type: "text", required: false };

const otherMatters: OfficialFieldMeta = { key: "otherMatters", label: "その他必要な事項", type: "multiline", required: false };
const extraNote1: OfficialFieldMeta = { key: "extraNote1", label: "注釈欄", type: "text", required: false, helpText: "テンプレート余白行。通常は空欄。" };

// ============================================================================
// 共通セクション定義
// ============================================================================
const SUBMITTER_SECTION: OfficialSectionMeta = {
  id: "submitter",
  heading: "申請者・届出者",
  fields: [submitterAddress, submitterName, submitterPhone],
};

const HEADER_SECTION: OfficialSectionMeta = {
  id: "header",
  heading: "提出情報",
  fields: [submitDate, municipality, recipientTitle],
};

const OWNER_SECTION: OfficialSectionMeta = {
  id: "owner",
  heading: "設置者 (危険物の所有者)",
  fields: [ownerAddress, ownerName, ownerPhone],
};

const OFFICIAL_USE_SECTION: OfficialSectionMeta = {
  id: "official-use",
  heading: "※ 行政記入欄 (通常は空欄)",
  description: "行政側が記入する欄です。提出時は空欄のまま出力されます。",
  fields: [officialUseReceipt, officialUseProgress, officialUseFee],
};

// ============================================================================
// Pack 別メタデータ
// ============================================================================
const META: Record<string, OfficialPackMeta> = {
  "building-use-start": {
    packName: "building-use-start",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "building",
        heading: "建築物の情報",
        fields: [
          { key: "buildingAddress", label: "所在地", type: "text", required: true },
          { key: "buildingPhone", label: "建物電話番号", type: "phone", required: false },
          { key: "buildingName", label: "建物名称", type: "text", required: true },
          { key: "mainUse", label: "主要用途", type: "text", required: true, placeholder: "例: 事務所" },
        ],
      },
      {
        id: "construction",
        heading: "確認・同意・工期",
        fields: [
          { key: "buildingConfirmationDate", label: "建築確認年月日", type: "date", required: false },
          { key: "buildingConfirmationNumber", label: "建築確認番号", type: "text", required: false },
          { key: "fireConsentDate", label: "消防同意年月日", type: "date", required: false },
          { key: "fireConsentNumber", label: "消防同意番号", type: "text", required: false },
          { key: "constructionStartDate", label: "工事着手年月日", type: "date", required: false },
          { key: "constructionCompleteDate", label: "工事完了 (予定) 年月日", type: "date", required: false },
          { key: "constructionEndDate", label: "使用開始 (予定) 年月日", type: "date", required: true },
          { key: "otherPermits", label: "他の法令による許認可", type: "multiline", required: false, placeholder: "例: なし" },
        ],
      },
      {
        id: "scale",
        heading: "規模・人員",
        fields: [
          { key: "siteArea", label: "敷地面積 (㎡)", type: "number", required: false },
          { key: "buildingArea", label: "建築面積 (㎡)", type: "number", required: false },
          { key: "totalArea", label: "延面積 (㎡)", type: "number", required: false },
          { key: "employeeCount", label: "従業員数 (人)", type: "number", required: false },
          { key: "businessHours", label: "公開時間又は従業時間", type: "text", required: false, placeholder: "例: 9:00〜18:00" },
          { key: "fireEquipment", label: "屋外消火栓・動力消防ポンプ・消防用水の概要", type: "multiline", required: false },
          { key: "remarks", label: "その他必要事項", type: "multiline", required: false },
        ],
      },
      {
        id: "official-use",
        heading: "※ 行政記入欄 (通常は空欄)",
        description: "行政側が記入する欄です。",
        fields: [officialUseReceipt, officialUseProgress],
      },
    ],
  },

  "hazmat-facility-permit": {
    packName: "hazmat-facility-permit",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "owner",
        heading: "設置者",
        fields: [ownerAddress, ownerName, ownerPhone, ownerNameField],
      },
      {
        id: "facility",
        heading: "設置場所・施設区分",
        fields: [
          facilityLocation, fireZone, useZone, facilityKind, facilityCategory,
        ],
      },
      {
        id: "hazmat",
        heading: "危険物・基準",
        fields: [
          hazmatClassAndName, designatedQuantityMultiple,
          { key: "regulationCategory", label: "位置、構造及び設備の基準に係る区分", type: "text", required: false, placeholder: "例: 令第10条第1項" },
          { key: "structureSummary", label: "位置、構造、設備の概要", type: "multiline", required: false },
          { key: "operationSummary", label: "危険物の貯蔵又は取扱方法の概要", type: "multiline", required: false },
        ],
      },
      {
        id: "schedule",
        heading: "工期",
        fields: [
          { key: "constructionStartDate", label: "着工予定期日", type: "date", required: false },
          { key: "completionDate", label: "完成予定期日", type: "date", required: false },
          otherMatters,
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        description: "通常は空欄のまま提出します。",
        fields: [officialUseReceipt, officialPermitDateAndNumber, officialUseFee, extraNote1],
      },
    ],
  },

  "hazmat-facility-change-permit": {
    packName: "hazmat-facility-change-permit",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "owner",
        heading: "設置者",
        fields: [ownerAddress, ownerName, ownerPhone, ownerNameField],
      },
      {
        id: "facility",
        heading: "設置場所・施設区分",
        fields: [
          facilityLocation, fireZone, useZone,
          { key: "zoneExtraInfo", label: "地域別補足情報", type: "text", required: false },
          permitInfo, facilityKind, facilityCategory,
        ],
      },
      {
        id: "hazmat",
        heading: "危険物・変更内容",
        fields: [
          hazmatClassAndName, designatedQuantityMultiple,
          { key: "regulationCategory", label: "位置、構造及び設備の基準に係る区分", type: "text", required: false },
          { key: "changeContent", label: "変更の内容", type: "multiline", required: true },
          { key: "changeReason", label: "変更の理由", type: "multiline", required: true },
        ],
      },
      {
        id: "schedule",
        heading: "工期",
        fields: [
          { key: "constructionStartDate", label: "着工予定期日", type: "date", required: false },
          { key: "completionDate", label: "完成予定期日", type: "date", required: false },
          otherMatters,
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialPermitDateAndNumber, officialUseFee, extraNote1],
      },
    ],
  },

  "hazmat-temporary-use": {
    packName: "hazmat-temporary-use",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "facility",
        heading: "対象施設",
        fields: [facilityLocation, facilityKind, facilityCategory],
      },
      {
        id: "change",
        heading: "変更許可情報",
        fields: [
          { key: "changePermitApplicationDate", label: "変更許可申請年月日", type: "date", required: true },
          { key: "changePermitInfo", label: "変更の許可年月日及び許可番号", type: "text", required: false },
          { key: "temporaryUseScope", label: "仮使用の承認を申請する部分", type: "multiline", required: true, placeholder: "例: 別添図面のとおり" },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialApprovalDateAndNumber, officialUseFee],
      },
    ],
  },

  "hazmat-temporary-storage": {
    packName: "hazmat-temporary-storage",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "owner",
        heading: "危険物の所有者・管理者・占有者",
        fields: [ownerAddress, ownerName, ownerPhone, { key: "ownerExtraInfo", label: "補助情報", type: "text", required: false }],
      },
      {
        id: "temporary",
        heading: "仮貯蔵・仮取扱い情報",
        fields: [
          { key: "temporaryLocation", label: "仮貯蔵・仮取扱いの場所 (所在地・名称)", type: "text", required: true },
          hazmatClassAndName, designatedQuantityMultiple,
          { key: "temporaryMethod", label: "仮貯蔵・仮取扱いの方法", type: "multiline", required: true },
          { key: "temporaryPeriod", label: "仮貯蔵・仮取扱いの期間", type: "text", required: true, placeholder: "例: 令和8年6月1日から令和8年6月10日まで 10日間" },
          { key: "managementStatus", label: "管理の状況 (消火設備の設置状況を含む)", type: "multiline", required: true },
        ],
      },
      {
        id: "manager",
        heading: "現場管理責任者",
        fields: [
          { key: "siteManagerAddress", label: "現場管理責任者 住所", type: "text", required: true },
          { key: "siteManagerName", label: "現場管理責任者 氏名", type: "text", required: true },
          { key: "siteManagerEmergencyContact", label: "緊急連絡先", type: "phone", required: true },
          { key: "siteManagerLicense", label: "危険物取扱者免状の種類", type: "text", required: false, placeholder: "例: 甲種、または 無" },
        ],
      },
      {
        id: "other",
        heading: "理由・その他",
        fields: [
          { key: "temporaryReason", label: "仮貯蔵・仮取扱いの理由及び期間経過後の処理", type: "multiline", required: true },
          otherMatters,
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialApprovalDateAndNumber, officialUseFee],
      },
    ],
  },

  "hazmat-transfer": {
    packName: "hazmat-transfer",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "receiver",
        heading: "譲渡又は引渡を受けた者",
        fields: [ownerAddress, ownerName, ownerPhone],
      },
      {
        id: "transferor",
        heading: "譲渡又は引渡をした者",
        fields: [
          { key: "transferorAddress", label: "前所有者 住所", type: "text", required: true },
          { key: "transferorName", label: "前所有者 氏名", type: "text", required: true },
          { key: "transferorPhone", label: "前所有者 電話番号", type: "phone", required: false },
        ],
      },
      {
        id: "facility",
        heading: "対象施設",
        fields: [
          { key: "transferFacilitySection", label: "施設セクション見出し", type: "text", required: false, helpText: "通常は「対象施設」など。空欄可。" },
          facilityLocation, facilityKind, facilityCategory,
          permitInfo, inspectionInfo,
          hazmatClassAndName, designatedQuantityMultiple,
        ],
      },
      {
        id: "reason",
        heading: "理由",
        fields: [
          { key: "transferReason", label: "譲渡又は引渡のあった理由", type: "multiline", required: true, placeholder: "例: 売買、相続、合併" },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseProgress],
      },
    ],
  },

  "hazmat-name-quantity-change": {
    packName: "hazmat-name-quantity-change",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      OWNER_SECTION,
      {
        id: "facility",
        heading: "対象施設",
        fields: [facilityLocation, permitInfo, facilityKind, facilityCategory],
      },
      {
        id: "change",
        heading: "品名・数量変更",
        fields: [
          { key: "hazmatClassAndNameBefore", label: "変更前 危険物の類、品名、最大数量", type: "multiline", required: true },
          { key: "designatedQuantityMultipleBefore", label: "変更前 指定数量の倍数", type: "text", required: true },
          { key: "hazmatClassAndNameAfter", label: "変更後 危険物の類、品名、最大数量", type: "multiline", required: true },
          { key: "designatedQuantityMultipleAfter", label: "変更後 指定数量の倍数", type: "text", required: true },
          { key: "afterColumn4", label: "変更後 追加情報", type: "text", required: false, helpText: "通常は空欄。" },
          { key: "changeDate", label: "変更予定期日", type: "date", required: true },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseProgress],
      },
    ],
  },

  "hazmat-facility-abolition": {
    packName: "hazmat-facility-abolition",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      OWNER_SECTION,
      {
        id: "facility",
        heading: "対象施設",
        fields: [facilityLocation, permitInfo, inspectionInfo, facilityKind, facilityCategory, hazmatClassAndName, designatedQuantityMultiple],
      },
      {
        id: "abolition",
        heading: "廃止情報",
        fields: [
          { key: "abolitionDate", label: "廃止年月日", type: "date", required: true },
          { key: "abolitionReason", label: "廃止の理由", type: "multiline", required: true },
          { key: "residualDisposal", label: "残存危険物の処理", type: "multiline", required: true },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseProgress],
      },
    ],
  },

  "hazmat-comprehensive-safety-supervisor": {
    packName: "hazmat-comprehensive-safety-supervisor",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      {
        id: "facility",
        heading: "対象事業所",
        fields: [
          { key: "facilityLocationAndName", label: "事業所の設置場所及び名称", type: "text", required: true },
        ],
      },
      {
        id: "appointment",
        heading: "統括管理者 選任・解任",
        description: "複数名の場合は各欄に改行区切りで入力してください (例: 山田 太郎\\n佐藤 次郎)。",
        fields: [
          { key: "appointedName", label: "選任 氏名 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切ってください" },
          { key: "appointedPosition", label: "選任 職務上の地位 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切り、氏名と同じ順序で入力" },
          { key: "appointmentDate", label: "選任年月日 (複数可)", type: "multiline", required: false, helpText: "例: 令和8年4月1日 / 複数の場合は改行区切り" },
          { key: "dismissedName", label: "解任 氏名 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切ってください" },
          { key: "dismissedPosition", label: "解任 職務上の地位 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切り、氏名と同じ順序で入力" },
          { key: "dismissalDate", label: "解任年月日 (複数可)", type: "multiline", required: false, helpText: "例: 令和8年3月31日 / 複数の場合は改行区切り" },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseRemarks],
      },
    ],
  },

  "hazmat-safety-supervisor": {
    packName: "hazmat-safety-supervisor",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      OWNER_SECTION,
      {
        id: "facility",
        heading: "対象施設",
        fields: [facilityKind, facilityCategory, permitInfo, facilityLocation],
      },
      {
        id: "appointment",
        heading: "保安監督者 選任・解任",
        description: "複数名の場合は各欄に改行区切りで入力してください。",
        fields: [
          { key: "appointedName", label: "選任 氏名 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切ってください" },
          { key: "appointedLicense", label: "選任 免状の種類 (複数可)", type: "multiline", required: false, helpText: "例: 甲種危険物取扱者 / 複数の場合は改行区切り、氏名と同じ順序で入力" },
          { key: "appointmentDate", label: "選任年月日 (複数可)", type: "multiline", required: false, helpText: "例: 令和8年4月1日 / 複数の場合は改行区切り" },
          { key: "dismissedName", label: "解任 氏名 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切ってください" },
          { key: "dismissedLicense", label: "解任 免状の種類 (複数可)", type: "multiline", required: false, helpText: "複数名の場合は改行で区切り、氏名と同じ順序で入力" },
          { key: "dismissalDate", label: "解任年月日 (複数可)", type: "multiline", required: false, helpText: "例: 令和8年3月31日 / 複数の場合は改行区切り" },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseRemarks],
      },
    ],
  },

  "hazmat-prevention-rules-approval": {
    packName: "hazmat-prevention-rules-approval",
    sections: [
      HEADER_SECTION,
      SUBMITTER_SECTION,
      OWNER_SECTION,
      {
        id: "facility",
        heading: "対象施設",
        fields: [facilityLocation, facilityKind, facilityCategory, permitInfo, hazmatClassAndName, designatedQuantityMultiple],
      },
      {
        id: "rules",
        heading: "予防規程",
        fields: [
          { key: "preventionRulesDate", label: "予防規程 作成・変更年月日", type: "date", required: true },
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseRemarks],
      },
    ],
  },

  "minor-hazmat-notification": {
    packName: "minor-hazmat-notification",
    sections: [
      {
        id: "header",
        heading: "提出情報",
        description: "提出先は「消防長 (消防署長) (市町村長)」殿 固定です。",
        fields: [submitDate],
      },
      SUBMITTER_SECTION,
      {
        id: "facility",
        heading: "貯蔵又は取扱いの場所",
        fields: [
          facilityLocation,
          { key: "facilityName", label: "名称", type: "text", required: true },
        ],
      },
      {
        id: "hazmat",
        heading: "危険物の類・品名・数量",
        fields: [
          { key: "hazmatClass", label: "類", type: "text", required: true, placeholder: "例: 第4類" },
          { key: "hazmatName", label: "品名", type: "text", required: true, placeholder: "例: ガソリン" },
          { key: "maxStorageAmount", label: "最大貯蔵数量", type: "text", required: true, placeholder: "例: 200L" },
          { key: "maxDailyHandlingAmount", label: "1日最大取扱数量", type: "text", required: true, placeholder: "例: 50L" },
          { key: "extraColumn5", label: "追加項目", type: "text", required: false, helpText: "テンプレ余裕列。通常は空欄。" },
        ],
      },
      {
        id: "ops",
        heading: "貯蔵・取扱い方法・設備",
        fields: [
          { key: "operationSummary", label: "貯蔵又は取扱方法の概要", type: "multiline", required: true },
          { key: "structureSummary", label: "貯蔵又は取扱場所の位置、構造及び設備の概要", type: "multiline", required: true },
          { key: "fireEquipment", label: "消防用設備等の概要", type: "multiline", required: true },
          { key: "startPeriod", label: "貯蔵又は取扱いの開始予定期日又は期間", type: "text", required: true },
          otherMatters,
        ],
      },
      {
        id: "official",
        heading: "※ 行政記入欄",
        fields: [officialUseReceipt, officialUseProgress],
      },
    ],
  },
};

export function getOfficialPackMeta(packName: string): OfficialPackMeta | undefined {
  return META[packName];
}

export function hasOfficialPackMeta(packName: string): boolean {
  return packName in META;
}

export const OFFICIAL_PACK_NAMES = Object.keys(META) as readonly string[];
