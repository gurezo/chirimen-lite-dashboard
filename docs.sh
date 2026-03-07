#!/bin/bash
set -e

echo "branch change gh-pages"
echo ""

git checkout gh-pages

echo "branch rebase main"
echo ""

git rebase main

echo "console build"
echo ""

npx nx build apps-console --prod --base-href /chirimen-lite-console/


echo "console docs remove"
echo ""

rm -rf docs

echo "console docs create"
echo ""

mkdir docs


echo "console deploy code move"
echo ""

mv -f dist/console/browser/* docs

echo "git add"
echo ""

git add .

echo "git commit"
echo ""

git commit -m 'new source'

echo "git push"
echo ""

git push origin gh-pages -f

echo "branch change main"
echo ""

git checkout main
