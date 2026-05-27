# 全国統一様式 docxtemplater 移行 — 作業ログ 2026-05-26 / 27

## サマリ

- ブランチ: `feat/national-docxtemplater`
- 目的: 12 公式 Word テンプレ (FDMA 様式) に `{{var}}` プレースホルダを挿入し、docxtemplater 経由でレンダリングできる状態にする
- 並行運用: 既存の独自 JSON テンプレ (`render-docx.ts`) は保持しつつ、`templates-official/<pack>.docx` が存在する pack のみ docxtemplater 経路へ自動分岐
- **方針 (2026-05-27 更新)**: 「変数化できる可能性がある部分は全て変数にする」。記入欄は全て変数化、※受付欄等の行政記入欄も `officialUse*` 系で変数化。完了条件は「12 書類全て空欄ゼロでレンダリング完了」
- **検証**: `lib/engine-v2/national/__tests__/zero-blanks.test.ts` で 12 書類すべてが空欄ゼロでレンダリングされることを CI で担保

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

## 「空欄ゼロ」検証ロジック

`zero-blanks.test.ts` および `tmp/verify-no-blanks.mjs` で以下を検出:

1. **空セル**: `<w:tc>` 内テキストが全 trim 後空で、かつ vMerge=continue でない、かつ同行に他の意味あるセルが存在する場合 (= 値が入るはずの空欄)
2. **未差し込み変数**: レンダリング後も `{{var}}` が残る場合 (sample データ不足)
3. **空電話括弧**: `（電話[\s 　]{2,}）`
4. **空番号**: `第[\s 　]{3,}号`
5. **空日付**: `年[\s 　]{3,}月[\s 　]{3,}日`

検証: `node tmp/verify-no-blanks.mjs` で 12 書類すべて `0 blank(s)` を確認。

## 変数命名規約

### 共通フィールド (申請者/届出者)
- 申請日: `submitDate`
- 提出先市町村: `municipality`
- 提出先肩書: `recipientTitle`
- 申請者/届出者 住所/氏名/電話: `submitterAddress` / `submitterName` / `submitterPhone`

### 共通フィールド (設置者/危険物所有者/譲渡を受けた者)
- 住所/氏名/電話: `ownerAddress` / `ownerName` / `ownerPhone`
- 補助フィールド: `ownerNameField`, `ownerExtraInfo`

### 共通フィールド (施設)
- 設置場所: `facilityLocation`
- 製造所等の別: `facilityKind`
- 貯蔵所又は取扱所の区分: `facilityCategory`
- 危険物の類、品名（指定数量）、最大数量: `hazmatClassAndName`
- 指定数量の倍数: `designatedQuantityMultiple`
- 防火地域別/用途地域別: `fireZone` / `useZone`
- 設置の許可年月日及び許可番号: `permitInfo` (1 セル統合)
- 設置の完成検査年月日及び検査番号: `inspectionInfo`
- 位置、構造及び設備の基準に係る区分: `regulationCategory`
- 位置、構造、設備の概要: `structureSummary`
- 危険物の貯蔵又は取扱方法の概要: `operationSummary`
- 着工/完成予定期日: `constructionStartDate` / `completionDate`
- その他必要な事項: `otherMatters`

### 行政記入欄 (★方針変更で全変数化)
- ※受付欄: `officialUseReceipt`
- ※経過欄: `officialUseProgress`
- ※手数料欄: `officialUseFee`
- ※備考欄: `officialUseRemarks`
- 許可年月日許可番号 (Row 末尾): `officialPermitDateAndNumber`
- 承認年月日承認番号 (Row 末尾): `officialApprovalDateAndNumber`
- 注釈用余白行: `extraNote1`

### 書類固有
- 譲渡引渡: `transferorAddress` / `transferorName` / `transferorPhone` / `transferReason` / `transferFacilitySection`
- 廃止: `abolitionDate` / `abolitionReason` / `residualDisposal`
- 統括管理者/保安監督者: `appointedName` / `dismissedName` / `appointmentDate` / `dismissalDate` / `appointedPosition` / `dismissedPosition` / `appointedLicense` / `dismissedLicense`
- 仮貯蔵: `temporaryLocation` / `temporaryMethod` / `temporaryPeriod` / `temporaryReason` / `managementStatus` / `siteManagerAddress` / `siteManagerName` / `siteManagerEmergencyContact` / `siteManagerLicense`
- 仮使用: `changePermitApplicationDate` / `changePermitInfo` / `temporaryUseScope`
- 品名・数量変更: `hazmatClassAndNameBefore` / `hazmatClassAndNameAfter` / `designatedQuantityMultipleBefore` / `designatedQuantityMultipleAfter` / `afterColumn4` / `changeDate`
- 変更許可: `changeContent` / `changeReason` / `zoneExtraInfo`
- 予防規程: `preventionRulesDate`
- 少量危険物: `hazmatClass` / `hazmatName` / `maxStorageAmount` / `maxDailyHandlingAmount` / `startPeriod` / `facilityName` / `fireEquipment` / `extraColumn5`

## 各書類の最終 placeholder 数

| Pack | placeholder 数 | Rendered Size |
|------|----------------|---------------|
| building-use-start | 26 | 140 KB |
| hazmat-facility-change-permit | 27 | 127 KB |
| hazmat-facility-permit | 26 | 128 KB |
| hazmat-temporary-storage | 21 | 121 KB |
| hazmat-facility-abolition | 20 | 109 KB |
| hazmat-transfer | 19 | 119 KB |
| hazmat-name-quantity-change | 18 | 102 KB |
| hazmat-safety-supervisor | 18 | 105 KB |
| minor-hazmat-notification | 17 | 110 KB |
| hazmat-prevention-rules-approval | 16 | 101 KB |
| hazmat-comprehensive-safety-supervisor | 13 | 92 KB |
| hazmat-temporary-use | 13 | 94 KB |

## 実装内容

### スクリプト (tmp/)
1. `inject-all-books.mjs`: 12 書類の主要セル (住所/氏名/電話/施設情報等) に変数挿入
2. `inject-all-remaining.mjs`: 行政記入欄等の残余セルに `officialUse*` 等を挿入
3. `fix-row-multinode-patterns.mjs`: Row 01 で `<w:t>` に分割された「年 月 日」「(電話 )」を multi-node aware に統合して変数化
4. `fix-final-4-blanks.mjs`: 残 4 件の空欄を最終解消
5. `fix-submitterphone-duplicates.mjs`: Row 01 申請者と Row 02-03 設置者で重複した `{{submitterPhone}}` を後者は `{{ownerPhone}}` に renname
6. `verify-no-blanks.mjs`: レンダリング後 docx を解析し空欄を全検出
7. `render-all-samples.mjs`: SHUN 目視確認用サンプルを `~/Desktop/fdma-rendered/` に出力

### アダプタ
`lib/engine-v2/adapters/generate-national.ts` に `hasOfficialTemplate(packName)` 判定で経路自動分岐。

### テスト (新規)
- `adapter-routing.test.ts`: 経路分岐検証 (12 pack docxtemplater + レガシー fallback)
- `zero-blanks.test.ts`: 12 書類全てが空欄ゼロでレンダリングされることを保証

## 検証結果

- ✅ `npm run typecheck` (0 errors)
- ✅ `npm test` (155 passed = 12 zero-blanks + 2 adapter-routing + 14 docxtemplater + 既存 127)
- ✅ `npm run build` (success)
- ✅ `node tmp/verify-no-blanks.mjs` (12 書類すべて 0 blank)
- ✅ `node tmp/check-duplicates.mjs` (重複変数 0 件)

## 残作業 (このブランチ外)

- **JSON field key と template var の整合化** (Phase 4): `templates/<pack>.json` の field key (例: `receiverAddress`) と template var (例: `ownerAddress`) が不整合。UI 統合時にデータが空欄になるため要対応
- UI フォームから新規追加変数 (transferor*, abolition*, appoint*, dismiss*, officialUse* 等) を送信できるよう拡張
- チェックボックス系 (免状の有無等) の変数化方針確定
- 統括管理者/保安監督者の複数名対応
- `hazmat-name-quantity-change` の `afterColumn4` / `minor-hazmat-notification` の `extraColumn5` 等、構造不明な追加列の意味確認 (現状は generic 名で挿入済)
