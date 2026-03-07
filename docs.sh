#!/bin/bash
set -e

echo "branch change gh-pages"
echo ""

git checkout gh-pages

echo "branch rebase main"
echo ""

git rebase main

echo "dashboard build"
echo ""

npx nx build apps-dashboard --prod --base-href /chirimen-lite-console/


echo "dashboard docs remove"
echo ""

rm -rf docs

echo "dashboard docs create"
echo ""

mkdir docs


echo "dashboard deploy code move"
echo ""

mv -f dist/dashboard/browser/* docs

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
