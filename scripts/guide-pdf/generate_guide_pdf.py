"""public/guide.pdf（消防計画 記入ガイド）を生成する。

使い方:
    scripts/guide-pdf/fetch_fonts.sh          # 初回のみ。IPAフォントを fonts/ に取得
    python3 scripts/guide-pdf/generate_guide_pdf.py [出力先]   # 既定: public/guide.pdf

必要なもの: Python 3.9 以上、reportlab（requirements.txt）、
fonts/ipag.ttf・fonts/ipagp.ttf（IPAゴシック／IPA Pゴシック）。
フォントの場所は環境変数 GUIDE_PDF_FONT_DIR で変えられる。

文面を変えるときは CONTENT（下の各ページの定義）だけを直す。
レイアウト（余白・色・文字サイズ・行送り）は既存の guide.pdf に合わせてあるので、
変える場合は生成後に PDF を見比べて確認すること。
"""

import os
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
FONT_DIR = Path(os.environ.get("GUIDE_PDF_FONT_DIR", HERE / "fonts"))

# ── フォント ─────────────────────────────────────────────
# 見出し・表の見出し・ラベルは IPAゴシック、本文は IPA Pゴシック。
BOLD = "IPAGothic"
BODY = "IPAPGothic"


def register_fonts():
    for name, file in ((BOLD, "ipag.ttf"), (BODY, "ipagp.ttf")):
        path = FONT_DIR / file
        if not path.exists():
            sys.exit(f"フォントがありません: {path}（scripts/guide-pdf/fetch_fonts.sh を実行してください）")
        pdfmetrics.registerFont(TTFont(name, str(path)))


# ── 色 ───────────────────────────────────────────────────
NAVY = colors.HexColor("#1a2744")      # 本文
BLUE = colors.HexColor("#2b4c7e")      # 章の帯・小見出し・表の見出し
RED = colors.HexColor("#d4462a")       # 表紙の「記入ガイド」・不備の枠
GRAY = colors.HexColor("#666666")
LIGHT_BLUE = colors.HexColor("#e8eff8")
COVER_BG = colors.HexColor("#f5f6f8")
RULE = colors.HexColor("#dddddd")
POINT_BG = colors.HexColor("#fff8e1")  # 元消防士のポイント
POINT_LINE = colors.HexColor("#ffa000")
POINT_TEXT = colors.HexColor("#5d4037")
WARN_BG = colors.HexColor("#fff3f0")   # よくある不備
WARN_TEXT = colors.HexColor("#b71c1c")

# ── 文字スタイル ─────────────────────────────────────────
S = {}


def build_styles():
    def ps(name, **kw):
        S[name] = ParagraphStyle(name, **kw)

    ps("cover_title", fontName=BOLD, fontSize=24, leading=32, alignment=TA_CENTER, textColor=NAVY)
    ps("cover_main", fontName=BOLD, fontSize=28, leading=36, alignment=TA_CENTER, textColor=RED, spaceBefore=0.6 * cm)
    ps("cover_tag", fontName=BOLD, fontSize=11, leading=16, alignment=TA_CENTER, textColor=GRAY, spaceBefore=0.8 * cm, spaceAfter=1.2 * cm)
    ps("cover_box", fontName=BODY, fontSize=10, leading=18, textColor=NAVY)
    ps("cover_footer", fontName=BOLD, fontSize=10, leading=12, alignment=TA_CENTER, textColor=GRAY)
    ps("toc_title", fontName=BOLD, fontSize=16, leading=24, textColor=NAVY, spaceAfter=0.4 * cm)
    ps("toc", fontName=BOLD, fontSize=11, leading=22, textColor=NAVY, leftIndent=10)
    ps("chapter", fontName=BOLD, fontSize=13, leading=20, textColor=colors.white)
    ps("h2", fontName=BOLD, fontSize=13, leading=20, textColor=BLUE, spaceBefore=0.6 * cm, spaceAfter=0.3 * cm)
    ps("h3", fontName=BOLD, fontSize=11, leading=17, textColor=NAVY, spaceBefore=0.4 * cm, spaceAfter=0.2 * cm)
    ps("body", fontName=BODY, fontSize=10, leading=18, textColor=NAVY, spaceAfter=0.2 * cm)
    ps("bullet", fontName=BODY, fontSize=10, leading=17, textColor=NAVY, leftIndent=12, spaceAfter=0.1 * cm)
    ps("point", fontName=BODY, fontSize=9.5, leading=16, textColor=POINT_TEXT)
    ps("warn", fontName=BODY, fontSize=9.5, leading=16, textColor=WARN_TEXT)
    ps("contact", fontName=BODY, fontSize=10, leading=18, textColor=NAVY, alignment=TA_CENTER)


# ── 部品 ─────────────────────────────────────────────────
def chapter(title):
    """章の帯（紺地・白文字）。各章はページの先頭から始める。"""
    t = Table([[Paragraph(title, S["chapter"])]], colWidths=[17 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return [PageBreak(), t, Spacer(1, 0.4 * cm)]


def boxed(text, style, width, bg, line_color, line_width, pad_x, pad_y):
    t = Table([[Paragraph(text, S[style])]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), line_width, line_color),
        ("LEFTPADDING", (0, 0), (-1, -1), pad_x),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad_x),
        ("TOPPADDING", (0, 0), (-1, -1), pad_y),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad_y),
    ]))
    return t


# 枠の見出しの記号（IPAフォントに字形がないため、既存のPDFでも空白として表示される）。
POINT_MARK = "\U0001F4A1"   # 電球
WARN_MARK = "⚠️"  # 警告


def point(text):
    """元消防士のポイント（黄色の枠）。"""
    return boxed(f"{POINT_MARK} 元消防士のポイント<br/>{text}", "point", 16 * cm, POINT_BG, POINT_LINE, 1, 10, 8)


def warn(text):
    """よくある不備（赤の枠）。"""
    return boxed(f"{WARN_MARK} よくある不備<br/>{text}", "warn", 16 * cm, WARN_BG, RED, 1, 10, 8)


def grid_table(rows, col_widths, font_size, leading, pad_y, label_col=False):
    """紺の見出し行つきの表。label_col=True なら1列目を薄い青・ゴシックにする。"""
    t = Table(rows, colWidths=col_widths)
    style = [
        ("TOPPADDING", (0, 0), (-1, -1), pad_y),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad_y),
        ("FONT", (0, 0), (-1, 0), BOLD, font_size, leading),
        ("FONT", (0, 1), (-1, -1), BODY, font_size, leading),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("TEXTCOLOR", (0, 1), (-1, -1), NAVY),
        ("BACKGROUND", (0, 0), (-1, 0), BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    if label_col:
        style += [
            ("FONT", (0, 1), (0, -1), BOLD, font_size, leading),
            ("BACKGROUND", (0, 1), (0, -1), LIGHT_BLUE),
        ]
    t.setStyle(TableStyle(style))
    return t


def checklist(rows):
    """提出前の全体チェックリスト（□・項目・確認内容）。"""
    t = Table([["□", label, text] for label, text in rows], colWidths=[1.2 * cm, 3 * cm, 12.8 * cm], rowHeights=22.4)
    t.setStyle(TableStyle([
        ("FONT", (0, 0), (0, -1), BOLD, 12, 14.4),
        ("FONT", (1, 0), (1, -1), BOLD, 10, 12),
        ("FONT", (2, 0), (2, -1), BODY, 10, 12),
        ("TEXTCOLOR", (0, 0), (-1, -1), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, RULE),
        ("LINEBELOW", (0, -1), (-1, -1), 0.5, GRAY),
    ]))
    return t


def P(text, style="body"):
    return Paragraph(text, S[style])


# ── 本文 ─────────────────────────────────────────────────
# 経歴の表記は「元京都市消防局職員（実務13年）」（2026-10 に 10年 から訂正）。
CAREER = "元京都市消防局職員（実務13年）"


def content():
    story = []

    # 表紙
    story += [
        Spacer(1, 3 * cm),
        P("消防計画", "cover_title"),
        P("記入ガイド", "cover_main"),
        P("〜 元消防士が教える、一発で通る書き方 〜", "cover_tag"),
        boxed(
            f"このガイドは、{CAREER}の経験をもとに、消防署の審査で指摘されやすいポイントを解説しています。"
            "<br/><br/>消防計画自動作成ツール（plan.todokede.jp）で生成した計画書と併せてお使いください。",
            "cover_box", 14 * cm, COVER_BG, GRAY, 0.5, 16, 14,
        ),
        Spacer(1, 2 * cm),
        P("トドケデ ／ MeHer株式会社", "cover_footer"),
    ]

    # 目次
    story += [PageBreak(), P("目次", "toc_title")]
    for item in [
        "1. 提出前の全体チェックリスト",
        "2. 第1章：目的及び適用範囲（管理権原の範囲）",
        "3. 第2章：管理権原者・防火管理者",
        "4. 第3章：消防機関との連絡",
        "5. 第4章：火災予防上の点検・検査",
        "6. 第5章：厳守事項",
        "7. 第6章：自衛消防隊の編成",
        "8. 第7章：休日・夜間の体制",
        "9. 第8章：地震対策",
        "10. 第9章：防災教育",
        "11. 第10章：訓練",
        "12. 別表の書き方",
        "13. 提出後の流れ",
    ]:
        story.append(P(item, "toc"))

    # 1 提出前の全体チェックリスト
    story += chapter("1 提出前の全体チェックリスト")
    story += [
        P("消防署に提出する前に、以下の項目をすべて確認してください。"),
        checklist([
            ("建物名称", "登記簿や賃貸契約書と一致しているか"),
            ("所在地", "住居表示を正確に記載しているか"),
            ("用途区分", "令別表第一の号と実際の使用状況が一致しているか"),
            ("管理権原者", "法人の場合は代表者名を記載しているか"),
            ("防火管理者", "有効な資格証の写しを添付しているか"),
            ("消防用設備等", "直近の点検報告書と一致しているか"),
            ("訓練計画", "年間の実施予定月が具体的に記載されているか"),
            ("別表", "すべての別表が揃っているか"),
            ("日付", "作成日が記載されているか"),
            ("届出書", "消防計画作成（変更）届出書を添付しているか"),
        ]),
        Spacer(1, 0.4 * cm),
        point("消防署の窓口では、まず「届出書」と「計画書」が揃っているかを確認します。計画書の中身が完璧でも、届出書がないと受理してもらえません。届出書は消防署の窓口でもらうか、各消防本部のHPからダウンロードできます。"),
    ]

    # 2 第1章
    story += chapter("2 第1章：目的及び適用範囲")
    story += [
        P("管理権原の範囲", "h2"),
        P("「管理権原の及ぶ範囲」とは、その消防計画が適用されるエリアのことです。ビルの1テナントであれば「○○ビル3階」、ビル全体を管理しているなら「建物全体」と記載します。"),
        warn("テナントなのに「建物全体」と書いてしまうケースが非常に多いです。消防署はここを最初にチェックします。賃貸契約書の対象範囲と一致させてください。"),
        Spacer(1, 0.3 * cm),
        P("統括防火管理について", "h2"),
        P("複数のテナントが入る建物（雑居ビル等）で、建物全体の防火管理を統括する必要がある場合に「該当」となります。単独テナントや自社ビルの場合は「非該当」です。"),
        point("統括防火管理が必要かどうか不明な場合は、所轄消防署の予防課に電話で確認するのが確実です。「○○ビルの△階でテナント入居予定ですが、統括防火管理は必要ですか？」と聞けば教えてもらえます。"),
        Spacer(1, 0.3 * cm),
        P("防火管理業務の委託", "h2"),
        P("ビル管理会社やセキュリティ会社に防火管理業務の一部を委託している場合は「該当」を選択し、委託先の会社名を記入します。委託していない場合は「非該当」です。"),
    ]

    # 3 第2章
    story += chapter("3 第2章：管理権原者・防火管理者")
    story += [
        P("管理権原者の記載", "h2"),
        P("管理権原者とは、防火管理について最終的な責任を持つ人です。法人の場合は代表取締役、個人事業の場合は事業主本人の氏名を記載します。"),
        warn("法人なのに「店長」や「支配人」の名前を書いてしまうケースが多いです。管理権原者は必ず「代表権を持つ人」です。代表取締役や理事長などが該当します。"),
        Spacer(1, 0.3 * cm),
        P("防火管理者の要件", "h2"),
        P("防火管理者は、防火管理講習の修了証を持っている人でなければなりません。甲種と乙種があり、建物の規模・用途によって必要な資格が異なります。"),
        grid_table(
            [
                ["", "甲種が必要", "乙種でも可"],
                ["特定防火対象物\n（飲食店・ホテル等）", "収容人員30人以上\nかつ延べ面積300㎡以上", "収容人員30人以上\nかつ延べ面積300㎡未満"],
                ["非特定防火対象物\n（事務所・倉庫等）", "収容人員50人以上\nかつ延べ面積500㎡以上", "収容人員50人以上\nかつ延べ面積500㎡未満"],
            ],
            [4.5 * cm, 6.2 * cm, 6.2 * cm], 9, 10.8, 6, label_col=True,
        ),
        Spacer(1, 0.3 * cm),
        point("防火管理者の「選任年月日」は資格取得日ではなく、その建物の防火管理者として選任された日です。入社日や着任日を記載する方が多いですが、正式に選任した日付を記入してください。"),
    ]

    # 4 第3章
    story += chapter("4 第3章：消防機関との連絡")
    story += [
        P("この章は届出や報告のスケジュールに関する内容です。自動生成ツールが建物の用途に応じて正しい報告頻度を自動設定しますので、特に変更の必要はありません。"),
        Spacer(1, 0.2 * cm),
        P("確認すべきポイント", "h2"),
        P("• 消防用設備等の点検報告の頻度（特定用途：年1回 ／ 非特定用途：3年に1回）", "bullet"),
        P("• 防火対象物定期点検の対象かどうか（特定用途で収容人員300人以上 → 対象）", "bullet"),
        point("消防計画を新規作成する場合は、計画書と同時に「防火管理者選任届出書」も提出します。防火管理者が既に届出済みの場合は不要です。消防署の窓口で「選任届は出ていますか？」と確認しておくとスムーズです。"),
    ]

    # 5 第4章
    story += chapter("5 第4章：火災予防上の点検・検査")
    story += [
        P("この章では、日常的な火災予防の取り組みと、法定点検について定めます。実態に合わせてカスタマイズが必要な箇所です。"),
        P("日常点検の担当者", "h2"),
        P("「誰が」「いつ」点検するかを明確にしてください。防火管理者本人が毎日チェックするのが理想ですが、難しい場合は「火元責任者」や「店長」など実際に点検できる人を指定してください。"),
        warn("「防火管理者が毎朝点検」と書いているのに、実際の防火管理者は別のフロアや別の拠点にいるケースがあります。消防署の立入検査で「実際にやっていますか？」と確認されます。実態と乖離しない内容にしてください。"),
        Spacer(1, 0.3 * cm),
        P("法定点検の委託先", "h2"),
        P("消防用設備等の法定点検は、消防設備士または消防設備点検資格者が行います。通常は専門の防災設備会社に委託します。委託先が未定の場合は「未定」と記載し、決まり次第、消防計画の変更届を提出してください。"),
    ]

    # 6 第5章
    story += chapter("6 第5章：厳守事項")
    story += [
        P("この章は基本的に定型文で、ほとんどの建物で同じ内容になります。自動生成ツールが標準的な内容を出力しますので、そのまま使用できます。"),
        Spacer(1, 0.2 * cm),
        point("消防署は「喫煙場所の指定」をよく確認します。全面禁煙の場合はその旨を明記しておくと好印象です。喫煙所がある場合は、具体的な場所を記載してください。"),
    ]

    # 7 第6章
    story += chapter("7 第6章：自衛消防隊の編成")
    story += [
        P("火災が発生した際に、従業員が「誰が何をするか」を定めるのがこの章です。別表8（自衛消防隊編成表）と連動しています。"),
        P("編成の基本", "h2"),
        P("自衛消防隊は最低でも以下の役割を決める必要があります。"),
        grid_table(
            [
                ["役割", "担当する業務", "適任者の例"],
                ["隊長", "全体指揮・状況判断", "防火管理者・店長"],
                ["通報連絡", "119番通報・館内放送", "事務員・受付"],
                ["初期消火", "消火器・消火栓で消火", "現場スタッフ"],
                ["避難誘導", "お客様・従業員の誘導", "フロアスタッフ"],
                ["応急救護", "けが人の応急手当", "救命講習受講者"],
            ],
            [2.8 * cm, 6 * cm, 6 * cm], 9.5, 11.4, 5,
        ),
        Spacer(1, 0.3 * cm),
        warn("少人数の事業所で「5人の隊員」を編成しているのに、実際の従業員が3人しかいないケースがあります。消防署は人数の実態を確認しますので、兼務も含めて実際の人数で編成してください。1人が複数の役割を兼ねることは認められています。"),
    ]

    # 8 第7章
    story += chapter("8 第7章：休日・夜間の体制")
    story += [
        P("営業時間外に誰が対応するかを定めます。緊急連絡先は必ず「つながる番号」を記載してください。"),
        point("夜間無人になる建物の場合、機械警備（セコム・ALSOKなど）の有無を記載してください。機械警備が入っている場合は、異常時に警備会社から防火管理者に連絡が来る旨を書いておくと、消防署から高く評価されます。"),
    ]

    # 9 第8章
    story += chapter("9 第8章：地震対策")
    story += [
        P("地震発生時の行動を定めます。広域避難場所と一時集合場所は正確に記載してください。"),
        P("広域避難場所の調べ方", "h2"),
        P("広域避難場所は、各自治体のハザードマップや防災マップで確認できます。「○○市 広域避難場所」で検索すると、一覧が見つかります。建物から最も近い避難場所を記載してください。"),
        warn("「近くの公園」のように曖昧な記載は不可です。「○○区○○町 ○○公園」のように正式名称と所在地を記載してください。"),
    ]

    # 10 第9章
    story += chapter("10 第9章：防災教育")
    story += [
        P("従業員への防災教育の実施時期と内容を定めます。"),
        point("消防署の立入検査では「防災教育の記録」を求められることがあります。教育を実施した際は、日付・参加者・内容を簡単にメモしておいてください。書式は自由ですが、「いつ・誰に・何を教えたか」が分かれば十分です。"),
    ]

    # 11 第10章
    story += chapter("11 第10章：訓練")
    story += [
        P("消防訓練の実施計画です。特定防火対象物は年2回以上、非特定防火対象物は消防計画に定めた回数の訓練が必要です。"),
        P("訓練の種類", "h2"),
        P("• 部分訓練：消火・通報・避難誘導のいずれかを個別に実施", "bullet"),
        P("• 総合訓練：消火・通報・避難誘導を組み合わせて実施", "bullet"),
        Spacer(1, 0.2 * cm),
        warn("消防計画に「4月と10月に訓練実施」と書いたのに、実際には一度も実施していないケースが最も多い指摘事項です。計画に書いた以上は必ず実施し、「別表9 消防訓練実施結果表」に記録してください。訓練の事前通知は所轄消防署への電話1本で完了します。"),
        Spacer(1, 0.3 * cm),
        point("消防署に訓練の支援を依頼すると、消防士が来て指導してくれます（無料）。初回の訓練は消防署の支援を受けると、実効性の高い訓練ができます。「消防訓練を計画しているのですが、ご指導いただけますか？」と電話してみてください。"),
    ]

    # 12 別表の書き方
    story += chapter("12 別表の書き方")
    for title, text in [
        ("別表1：防火管理業務の一部委託状況表", "委託先の会社名・所在地・連絡先・委託内容を記載します。委託していない場合は「該当なし」と記入。"),
        ("別表2：日常の火災予防の担当者と注意事項", "防火担当責任者・火元責任者を指名し、日常的に注意すべき事項を記載します。実際の勤務体制に合わせてください。"),
        ("別表3：自主検査チェック表（火気関係）", "火気使用設備器具のチェック項目です。ガスコンロ・電子レンジなど、実際に使用している設備のみ記載します。"),
        ("別表4：自主検査チェック表（閉鎖障害等）", "防火戸・防火シャッターの周辺に物品がないか確認するチェック表です。"),
        ("別表5：自主検査チェック表（定期）", "月次や半期ごとに行う定期検査のチェック表です。"),
        ("別表6：消防用設備等自主点検チェック表", "消火器・火災報知設備など、設置している設備の自主点検用チェック表です。設置していない設備は削除してください。"),
        ("別表7：消防用設備等の法定点検実施計画", "年間の法定点検スケジュールを記載します。点検業者と相談して実施月を決めてください。"),
        ("別表8：自衛消防隊編成表", "第6章の内容と一致させてください。氏名・役割・連絡先を記入します。"),
        ("別表9：消防訓練実施結果表", "訓練実施後に記入する表です。提出時は空欄で構いません。"),
    ]:
        story += [P(title, "h3"), P(text)]
    story += [
        Spacer(1, 0.4 * cm),
        point("別表で最も指摘が多いのは「自衛消防隊編成表（別表8）」です。従業員の入れ替わりがあった場合は、速やかに変更届を提出してください。消防計画本文の変更は不要で、別表8のみの差し替えで対応できます。"),
    ]

    # 13 提出後の流れ
    story += chapter("13 提出後の流れ")
    story += [
        P("提出から受理まで", "h2"),
        P("消防計画は所轄消防署の窓口に持参して提出します。窓口で内容を確認してもらい、不備がなければその場で受理印をもらえます。不備がある場合は修正を求められますので、修正後に再度持参してください。"),
        P("提出後に必要なこと", "h2"),
        P("• 消防計画の写しを事業所内に保管してください", "bullet"),
        P("• 全従業員に計画の内容を周知してください", "bullet"),
        P("• 計画に記載した訓練を実施してください", "bullet"),
        P("• 変更事項（人事異動・設備変更など）が生じた場合は変更届を提出してください", "bullet"),
        Spacer(1, 0.6 * cm),
        boxed(
            "消防計画の作成・変更でお困りの方は<br/><br/>"
            "自動作成ツール：plan.todokede.jp<br/>"
            "代行サービス：todokede.jp<br/><br/>"
            "元消防士のスタッフがサポートいたします。",
            "contact", 14 * cm, LIGHT_BLUE, BLUE, 1, 20, 16,
        ),
    ]
    return story


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO / "public" / "guide.pdf"
    register_fonts()
    build_styles()
    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="消防計画 記入ガイド",
        author="トドケデ（todokede.jp）",
    )
    doc.build(content())
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
