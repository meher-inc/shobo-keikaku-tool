// CSVヘッダ実体: 区分,お名前,メールアドレス,ドメイン,検討サービス/目的,内容,
// 内容文字数,セグメント,文面パターン,理由,宛名_最終,概要要約

export type Segment = '一斉送信' | '個別対応' | '送信しない' | '除外' | '';

export type FacePattern =
  | 'DL一斉'
  | 'X_福祉医療系'
  | 'Y_飲食店舗系'
  | 'Z_建築ビル他'
  | '-'
  | '';

export interface Lead {
  category: string;        // 区分（資料DL / 問い合わせ など）
  name: string;            // お名前（生）
  email: string;           // メールアドレス
  domain: string;          // ドメイン
  serviceTarget: string;   // 検討サービス/目的
  content: string;         // 内容（生の問い合わせ本文）
  contentLen: string;      // 内容文字数
  segment: Segment;        // セグメント
  facePattern: FacePattern;
  reason: string;          // 理由
  finalSalutation: string; // 宛名_最終（SHUN手動整形「○○ 様」）
  summaryOneLiner: string; // 概要要約（SHUN手動整形の1行要約 / 個別送信ではClaudeで再生成）
}

export interface SendResult {
  email: string;
  name: string;
  segment: Segment;
  facePattern: FacePattern;
  status: 'sent' | 'skipped' | 'error';
  messageId?: string;
  error?: string;
  timestamp: string;
}
