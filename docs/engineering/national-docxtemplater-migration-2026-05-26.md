# 全国統一様式 docxtemplater 移行 — 作業ログ 2026-05-26

## サマリ

- ブランチ: `feat/national-docxtemplater`
- 目的: 12 公式 Word テンプレ (FDMA 様式) に `{{var}}` プレースホルダを挿入し、docxtemplater 経由でレンダリングできる状態にする
- 並行運用: 既存の独自 JSON テンプレ (`render-docx.ts`) は保持しつつ、`templates-official/<pack>.docx` が存在する pack のみ docxtemplater 経路へ自動分岐

## 確定 file → pack マッピング (PR #16 pilot 準拠)

| File | Pack |
|------|------|
| post-17-youshiki1.docx | building-use-start |
| post-8-shouryou.docx | minor-hazmat-notification |
| post-8-youshiki1-2.docx | hazmat-temporary-storage (仮貯蔵・仮取扱) |
| post-8-youshiki2.docx | hazmat-facility-permit (設置許可) |
| post-8-youshiki5.docx | hazmat-facility-change-permit (変更許可) |
| post-8-youshiki7.docx | hazmat-temporary-use (仮使用) |
| post-8-youshiki15.docx | hazmat-transfer (譲渡引渡) |
| post-8-youshiki16.docx | hazmat-name-quantity-change (品名・数量変更) |
| post-8-youshiki17.docx | hazmat-facility-abolition (廃止) |
| post-8-youshiki19.docx | hazmat-comprehensive-safety-supervisor (統括管理者選任・解任) |
| post-8-youshiki20.docx | hazmat-safety-supervisor (保安監督者選任・解任) |
| post-8-youshiki26.docx | hazmat-prevention-rules-approval (予防規程認可) |

## 挿入された変数 (各書類)

各書類のレンダリング後ファイルサイズと placeholder 数:

| Pack | Rendered Size | 挿入 placeholder 数 |
|------|---------------|---------------------|
| building-use-start | 140 KB | 24 (recipientTitle 含む) |
| hazmat-facility-permit | 128 KB | 22 |
| hazmat-facility-change-permit | 127 KB | 22 |
| hazmat-facility-abolition | 109 KB | 18 |
| hazmat-transfer | 119 KB | 17 |
| hazmat-temporary-storage | 121 KB | 16 |
| hazmat-name-quantity-change | 102 KB | 16 |
| hazmat-safety-supervisor | 105 KB | 16 |
| minor-hazmat-notification | 110 KB | 15 |
| hazmat-prevention-rules-approval | 101 KB | 14 |
| hazmat-comprehensive-safety-supervisor | 92 KB | 11 |
| hazmat-temporary-use | 94 KB | 10 |

## 判定根拠の方針 (Rule 2 対応)

各書類のセルへの変数挿入は、**行ラベル (Japanese テキスト) → 標準変数名** の対応で決定。標準変数名は `lib/engine-v2/national/__tests__/render-docxtemplater.test.ts` の sample データを 1 次根拠とした。

主要な対応:

| 行ラベル (Japanese) | 変数名 |
|---------------------|--------|
| 設置者 住所 | ownerAddress |
| 設置者 氏名 | ownerName |
| 設置者 電話 | ownerPhone |
| 申請者/届出者 住所 | submitterAddress |
| 申請者/届出者 氏名 | submitterName |
| 申請者/届出者 電話 | submitterPhone |
| 設置場所 | facilityLocation |
| 製造所等の別 | facilityKind |
| 貯蔵所又は取扱所の区分 | facilityCategory |
| 危険物の類、品名（指定数量）、最大数量 | hazmatClassAndName |
| 指定数量の倍数 | designatedQuantityMultiple |
| 防火地域別 | fireZone |
| 用途地域別 | useZone |
| 位置、構造及び設備の基準に係る区分 | regulationCategory |
| 位置、構造、設備の概要 | structureSummary |
| 危険物の貯蔵又は取扱方法の概要 | operationSummary |
| 着工予定期日 | constructionStartDate |
| 完成予定期日 | completionDate |
| その他必要な事項 | otherMatters |
| 設置の許可年月日及び許可番号 | permitInfo |
| 設置の完成検査年月日及び検査番号 | inspectionInfo |

書類固有の追加変数 (譲渡引渡、廃止、統括管理者 等) は各書類の意味論に応じ命名:
- 譲渡引渡: transferorAddress / transferorName / transferorPhone / transferReason
- 廃止: abolitionDate / abolitionReason / residualDisposal
- 統括管理者/保安監督者: appointedName / dismissedName / appointmentDate / dismissalDate / appointedPosition / dismissedPosition / appointedLicense / dismissedLicense
- 仮貯蔵: temporaryLocation / temporaryMethod / temporaryPeriod / temporaryReason / managementStatus / siteManagerAddress / siteManagerName / siteManagerEmergencyContact
- 仮使用: changePermitApplicationDate / changePermitInfo / temporaryUseScope
- 品名・数量変更: hazmatClassAndNameBefore / hazmatClassAndNameAfter / designatedQuantityMultipleBefore / designatedQuantityMultipleAfter / changeDate
- 変更許可: changeContent / changeReason
- 予防規程: preventionRulesDate
- 少量危険物: hazmatClass / hazmatName / maxStorageAmount / maxDailyHandlingAmount / startPeriod / facilityName / fireEquipment

## 実装内容

### 1. テンプレ挿入

- `tmp/inject-all-books.mjs` で 12 書類を一括処理
- `tmp/repair-split-v2.mjs` で spell-check 分割された `{{name}}` を統合
- `tmp/fix-doc1-phones.mjs`, `tmp/fix-doc1-row1-v2.mjs` で書類 1 (hazmat-facility-permit) の電話セル重複を修正
- `tmp/fix-dup-buildinguse.mjs` で書類 12 (building-use-start) の `{{submitterName}}` 重複を解消

### 2. アダプタ統合

`lib/engine-v2/adapters/generate-national.ts` に経路自動分岐ロジック追加:

```ts
if (hasOfficialTemplate(packName)) {
  return renderWithOfficialTemplate(packName, form);
}
return renderNationalDocx(pack, form);
```

12 公式テンプレが存在する pack は docxtemplater、それ以外は既存の独自 JSON 経路へフォールバック。

### 3. テスト追加

`lib/engine-v2/national/__tests__/adapter-routing.test.ts`:
- 12 pack 全てで `hasOfficialTemplate` が true を返すこと
- `generateNationalDocument` が公式テンプレ経路を選び有効な .docx Buffer を返すこと
- レガシー pack も従来通り動くこと

### 4. 検証

- `npm run typecheck` → 0 errors
- `npm test` → 143 passed (19 files)
- `npm run build` → success
- `npm run lint` → 既存 tmp/ 系の警告 72 件 (本 PR で新規追加分は 0)

## 迷った箇所リスト (Rule 3 対応)

| Pack | Row/Cell | 迷った内容 | 暫定判断 |
|------|----------|------------|----------|
| building-use-start | Row 01 末尾 | 「氏　名」セル単独パターン: 末尾に submitterName を挿入すべきか、既存の split されていた {{submitterName}} を残すか | **解消** → 重複削除して既存 {{submitterName}} を残した |
| hazmat-temporary-storage | Row 03.c3 | 「電話　{{submitterPhone}}　（　）　」既存値あり、設置者電話は別途必要か | 既存の {{submitterPhone}} を再利用 (危険物の所有者 = 申請者) |
| hazmat-temporary-storage | Row 11.c3 | 「【危険物取扱者免状：有(種類：　)・無】」のチェックボックス様式 → 変数化すべきか | 未変数化 (チェックボックス UI 化が必要なため別 PR) |
| hazmat-temporary-use | Row 04.c2 | 「変更許可申請年月日」に既存 {{submitDate}} (common script の誤挿入の可能性) | changePermitApplicationDate に置換 (届出日と変更許可申請日は別概念) |
| hazmat-name-quantity-change | Row 08.c4 | 「変更後」セルの 4 列目の意味不明 | afterColumn4 という仮名で挿入 (要確認) |
| minor-hazmat-notification | Row 05.c5 | 「1日最大取扱数量」の右に存在する 5 列目の意味不明 | extraColumn5 で挿入 (要確認) |
| hazmat-transfer | Row 02 (受けた者) | submitterPhone を transferee の電話として再利用すべきか、ownerPhone として別変数化すべきか | submitterPhone を再利用 (受けた者 = 届出者 = submitter) |

## 要確認リスト (Rule 4 対応)

### A. JSON スキーマと template 変数名のミスマッチ

`lib/engine-v2/national/templates/<pack>.json` の field key と、`lib/engine-v2/national/templates-official/<pack>.docx` の `{{var}}` 名が一致していない pack がある。

例: hazmat-transfer
- JSON: `receiverAddress`, `giverAddress`, `permitDate`, `permitNumber`, `completionInspectionDate`
- Template: `ownerAddress`, `transferorAddress`, `permitInfo`, `inspectionInfo`

**影響**: UI から送信されるデータ key が template の `{{var}}` と一致しないと、docxtemplater で空欄になる。

**対応案**:
1. JSON field key を template var に揃える (UI 変更不要、JSON のみ修正)
2. アダプタ層で key mapping
3. テンプレ側を JSON 名に統一

→ SHUN 判断待ち。Phase 4 で対応する想定。

### B. 書類 1 (hazmat-facility-permit) の Row 02.c3 重複問題

PR #16 pilot の common script により `{{submitterPhone}}` が誤って Row 02.c3 (設置者電話) に挿入されていた。本 PR で削除 + Row 01.c1 (申請者電話) に再挿入済。

**確認事項**: Row 01.c1 に追加した `{{submitterName}}` の位置 (氏　名 ラベル末尾) が原本のレイアウト通りか SHUN 目視確認。

### C. 統括管理者・保安監督者書類の選任・解任 1 レコード制約

post-8-youshiki19.docx / post-8-youshiki20.docx は「選任」「解任」各 1 名分のセルしか存在しない (1 列ずつ)。複数名を同時に選任・解任する場合、別途行を追加するか別書類化するか不明。

→ 暫定実装は 1 名のみ。

### D. 譲渡引渡 (hazmat-transfer) の Row 04.c3 「電話」

「電話　」というラベル付きで空セル。`transferorPhone` を `insert-after-text` で追加したが、レイアウト的に「電話　{{transferorPhone}}」と表示される。SHUN 目視確認。

### E. building-use-start の {{recipientTitle}} 分割問題

XML 上で `{{municipality}}　{{` ・ `recipientTitle` ・ `}}　殿` の 3 ノードに split されており、`repair-split-v2.mjs` で merge できなかった (`{{` を 2 つ含むため judge 失敗)。

→ docxtemplater 内部正規化で render 時にはマージされる (テスト OK)、書類自体に視覚的問題なし。だが repair ロジック改善余地あり。

### F. 仮貯蔵 (hazmat-temporary-storage) の Row 06.c4 「倍」

c4 セルが「倍」のみの既存テキストを持つ。`designatedQuantityMultiple` を「倍」の前に insert-before-text で挿入 (= "{{designatedQuantityMultiple}}倍")。意図通りか SHUN 目視確認。

### G. 統括管理者 (post-8-youshiki19) の Row 04.c1 「統括管理者危険物保安」

「統括管理者」「危険物保安」の 2 つのキーワードが c1 に並置されている。これは行ヘッダ (label) と思われるが、構造的に Row 04 全体が「危険物保安統括管理者の選任・解任情報」を示すブロックなのか確認。

### H. 各書類の「※受付欄」「※経過欄」「※手数料欄」「許可年月日許可番号」

これらは行政側が記入する欄なので変数化していない。意図通り (= 提出時は空白) で問題ないか確認。

### I. minor-hazmat-notification の municipality / recipientTitle 不在

Row 01 が「{{submitDate}}消防長（消防署長）（市町村長）殿届出者...」と固定テキスト。`{{municipality}}` や `{{recipientTitle}}` を変数化していない (原文がチェックボックス様式)。意図通りか確認。

## 残作業 (このブランチ外)

- JSON field key と template var の整合化 (上記 A)
- UI フォームから新規追加変数 (transferor*, abolition*, appoint*, dismiss* 等) を送信できるよう拡張
- チェックボックス系 (免状の有無等) の変数化方針確定
- 統括管理者/保安監督者の複数名対応

## ファイル一覧 (本 PR で変更)

### 編集
- `lib/engine-v2/adapters/generate-national.ts` (docxtemplater 経路追加)
- `lib/engine-v2/national/templates-official/*.docx` (12 書類)

### 新規
- `lib/engine-v2/national/__tests__/adapter-routing.test.ts`
- `docs/engineering/national-docxtemplater-migration-2026-05-26.md` (本ファイル)
- `tmp/inject-all-books.mjs`, `tmp/fix-doc1-phones.mjs` 等のユーティリティ
