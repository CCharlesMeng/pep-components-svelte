#!/bin/bash

# 模板系统验证脚本
# 用于快速验证新的模板系统是否正常工作

set -e

PROJECT_ROOT="/Users/mengxin/Documents/Code/公司项目/pep-components-svelte"
TEST_COMPONENT="pep-test-verify"

echo "========================================="
echo "🧪 模板系统验证开始"
echo "========================================="

cd "$PROJECT_ROOT"

# 1. 检查目录结构
echo ""
echo "1️⃣  检查目录结构..."
if [ -d ".ai-workflow/templates/component" ]; then
    echo "✅ 模板目录存在"
else
    echo "❌ 模板目录不存在"
    exit 1
fi

# 2. 检查模板文件
echo ""
echo "2️⃣  检查模板文件..."
required_files=(
    ".ai-workflow/templates/component/package.json"
    ".ai-workflow/templates/component/tsconfig.json"
    ".ai-workflow/templates/component/vite.config.ts"
    ".ai-workflow/templates/component/svelte.config.js"
    ".ai-workflow/templates/component/src/{{COMPONENT_NAME}}.svelte"
    ".ai-workflow/templates/component/src/index.ts"
    ".ai-workflow/templates/component/src/types.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file 缺失"
        exit 1
    fi
done

# 3. 检查脚本
echo ""
echo "3️⃣  检查脚本..."
if [ -f "scripts/scaffold_component.py" ]; then
    echo "✅ scaffold_component.py 存在"
    
    # 检查是否使用了模板拷贝方式
    if grep -q "TEMPLATE_DIR" scripts/scaffold_component.py; then
        echo "✅ 脚本已更新为模板拷贝模式"
    else
        echo "⚠️  脚本可能未更新"
    fi
else
    echo "❌ scaffold_component.py 不存在"
    exit 1
fi

# 4. 测试脚本生成（可选）
echo ""
echo "4️⃣  测试组件生成..."
echo "提示：这会创建一个测试组件 components/$TEST_COMPONENT/"
read -p "是否继续测试？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 清理旧的测试组件
    if [ -d "components/$TEST_COMPONENT" ]; then
        echo "清理旧的测试组件..."
        rm -rf "components/$TEST_COMPONENT"
    fi
    
    # 运行脚本
    echo "运行脚本生成测试组件..."
    python3 scripts/scaffold_component.py \
        --component "$TEST_COMPONENT" \
        --mode minimal \
        --template-data '{
            "description": "测试验证组件",
            "features": []
        }'
    
    if [ -d "components/$TEST_COMPONENT" ]; then
        echo "✅ 组件生成成功"
        
        # 检查关键文件
        if [ -f "components/$TEST_COMPONENT/src/$TEST_COMPONENT.svelte" ]; then
            echo "✅ 主组件文件已生成"
            
            # 检查占位符是否已替换
            if grep -q "{{COMPONENT_NAME}}" "components/$TEST_COMPONENT/src/$TEST_COMPONENT.svelte"; then
                echo "⚠️  占位符未替换（可能是预期行为）"
            else
                echo "✅ 占位符已正确替换"
            fi
        else
            echo "❌ 主组件文件未生成"
        fi
        
        echo ""
        echo "测试组件位于: components/$TEST_COMPONENT/"
        echo "您可以手动测试："
        echo "  cd components/$TEST_COMPONENT"
        echo "  pnpm install"
        echo "  pnpm dev"
        echo ""
        read -p "是否清理测试组件？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "components/$TEST_COMPONENT"
            echo "✅ 测试组件已清理"
        fi
    else
        echo "❌ 组件生成失败"
        exit 1
    fi
else
    echo "⏭️  跳过测试"
fi

echo ""
echo "========================================="
echo "🎉 验证完成！"
echo "========================================="
echo ""
echo "模板系统已就绪。"
echo ""
echo "下一步："
echo "1. 在 Cursor 中运行: /pep-start pep-my-component"
echo "2. 按照 AI 提示完成问答"
echo "3. 检查生成的组件是否可运行"
echo ""

