# guide.pdf（消防計画 記入ガイド）の生成

`public/guide.pdf` はこのディレクトリのスクリプトから生成する。購入後の画面と料金表で「記入ガイドPDF」として配布しているファイル。

## 生成のしかた

```bash
pip3 install -r scripts/guide-pdf/requirements.txt
scripts/guide-pdf/fetch_fonts.sh
python3 scripts/guide-pdf/generate_guide_pdf.py
```

- 出力先の既定は `public/guide.pdf`。引数で別の場所に出せる（例: `python3 scripts/guide-pdf/generate_guide_pdf.py /tmp/guide.pdf`）。
- フォントは IPAゴシック・IPA Pゴシック（IPAフォントライセンスv1.0）。`fetch_fonts.sh` が配布元から取得し、チェックサムを確かめて `fonts/` に置く。フォント本体はコミットしない。
- 別の場所のフォントを使う場合は `GUIDE_PDF_FONT_DIR` で指定する。

## 文面を直すとき

- 文面は `generate_guide_pdf.py` の `content()` にある。経歴の表記は定数 `CAREER`。
- レイアウトは2026-04版の guide.pdf と同じになるように合わせてある。reportlab のバージョンを変えると折り返し位置が変わることがあるので、`requirements.txt` の版を使う。
- 生成後は、前の版とページごとに見比べて、意図しない差分がないことを確認する（例: `pdftoppm -r 100 -png` で画像にして比べる）。

## 経緯

- 2026-10: 元の生成スクリプトがリポジトリになかったため、既存の guide.pdf と同じ出力になるように作り直した。経歴の表記を「実務10年」から「実務13年」に訂正。
