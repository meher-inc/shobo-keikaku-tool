#!/usr/bin/env bash
# guide.pdf の生成に使う IPAゴシック（ipag.ttf）・IPA Pゴシック（ipagp.ttf）を fonts/ に取得する。
# 配布元: 文字情報技術促進協議会（https://moji.or.jp/ipafont/）。IPAフォントライセンスv1.0。
# フォント本体はリポジトリに含めない（fonts/ は .gitignore 済み）。
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p fonts
tmp="$(mktemp -d)"
trap 'rm -r "$tmp"' EXIT

fetch() {
  local name="$1" sha="$2" ttf="$3"
  if [ -f "fonts/$ttf" ]; then echo "fonts/$ttf は取得済み"; return; fi
  curl -sSfL -o "$tmp/$name.zip" "https://moji.or.jp/wp-content/ipafont/IPAfont/$name.zip"
  echo "$sha  $tmp/$name.zip" | shasum -a 256 -c - >/dev/null
  unzip -q -o "$tmp/$name.zip" -d "$tmp"
  cp "$tmp/$name/$ttf" "fonts/$ttf"
  cp "$tmp/$name/IPA_Font_License_Agreement_v1.0.txt" fonts/
  echo "fonts/$ttf を取得しました"
}

fetch ipag00303  b5e6f61de7465476f2f946dd83ee0961dc4d0ceea0833d253bb697297f232d97 ipag.ttf
fetch ipagp00303 da84ddb85178c84b0c4adad9b867dd9a46bacb72a1f276cbcc2d6923b6657102 ipagp.ttf
