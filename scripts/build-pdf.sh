#!/usr/bin/env bash
# Compiles resume/resume.tex into public/resume.pdf and public/resume-1page.pdf.
# Needs Tectonic (https://tectonic-typesetting.github.io): `brew install tectonic` locally;
# CI installs a pinned release. Set TECTONIC to use a binary that isn't on PATH.
set -euo pipefail

cd "$(dirname "$0")/.."
tectonic="${TECTONIC:-tectonic}"

if ! command -v "$tectonic" >/dev/null 2>&1; then
  echo "build-pdf: tectonic not found (brew install tectonic, or set TECTONIC)" >&2
  exit 1
fi

out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

for name in resume resume-1page; do
  # Run from resume/ so resume-1page.tex can \input{resume.tex}.
  (cd resume && "$tectonic" -X compile --outdir "$out" "$name.tex" 2>&1 | grep -v '^note:' || true)
  test -s "$out/$name.pdf" || { echo "build-pdf: $name.pdf was not produced" >&2; exit 1; }
done

mkdir -p public
cp "$out/resume.pdf" "$out/resume-1page.pdf" public/
echo "build-pdf: wrote public/resume.pdf and public/resume-1page.pdf"
