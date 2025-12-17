#!/bin/bash

if [ -z "$1" ]; then
  echo "错误: 请指定包名"
  echo "用法: npm run dev <package-name>"
  exit 1
fi

pnpm --filter "$1" dev

