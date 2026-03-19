"""
Visual Regression Compare Script
对比设计稿截图与实现截图，生成差异高亮图和 Markdown 报告。
支持静态区域对比 + 交互状态对比两种模式。

依赖: pip install Pillow numpy

用法:
  python compare.py --design-dir screenshots/ --impl-dir screenshots/ \
                    --output-dir screenshots/diff/ --report report.md \
                    [--metadata screenshots/metadata.json] \
                    [--side-by-side]

命名约定:
  设计稿文件: design_<zone>.png
  实现文件:   impl_<zone>.png
  输出差异:   diff_<zone>.png

交互场景命名约定（下划线分隔）:
  design_tab_switch.png    → 标签页切换场景
  design_resize_hover.png  → 分割线 hover 场景
  impl_deploy_disabled.png → 部署按钮禁用态
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageEnhance, ImageFilter
    import numpy as np
except ImportError:
    print("ERROR: 缺少依赖，请运行: pip install Pillow numpy")
    sys.exit(1)


def resize_to_match(img_src: Image.Image, img_ref: Image.Image) -> Image.Image:
    """将 img_src resize 到与 img_ref 相同尺寸（双线性插值）。"""
    if img_src.size == img_ref.size:
        return img_src
    return img_src.resize(img_ref.size, Image.LANCZOS)


def compute_diff(img_design: Image.Image, img_impl: Image.Image) -> tuple[Image.Image, float]:
    """
    计算两张图的像素差异。
    返回 (diff_highlighted_image, similarity_percent)
    差异区域用红色高亮显示。
    """
    design_rgb = img_design.convert("RGB")
    impl_rgb = img_impl.convert("RGB")

    design_arr = np.array(design_rgb, dtype=np.int16)
    impl_arr = np.array(impl_rgb, dtype=np.int16)

    diff_arr = np.abs(design_arr - impl_arr)
    diff_magnitude = diff_arr.mean(axis=2)  # shape: (H, W)

    threshold = 15
    diff_mask = diff_magnitude > threshold

    total_pixels = diff_mask.size
    diff_pixels = diff_mask.sum()
    similarity = (1 - diff_pixels / total_pixels) * 100

    # 生成高亮图：在实现截图上叠加红色差异
    highlight = impl_rgb.copy()
    highlight_arr = np.array(highlight)

    # 差异区域：红色半透明叠加
    highlight_arr[diff_mask, 0] = np.clip(highlight_arr[diff_mask, 0].astype(int) * 0.4 + 220, 0, 255)
    highlight_arr[diff_mask, 1] = np.clip(highlight_arr[diff_mask, 1].astype(int) * 0.3, 0, 255)
    highlight_arr[diff_mask, 2] = np.clip(highlight_arr[diff_mask, 2].astype(int) * 0.3, 0, 255)

    diff_image = Image.fromarray(highlight_arr.astype(np.uint8))
    return diff_image, round(similarity, 1)


def make_side_by_side(img_design: Image.Image, img_impl: Image.Image, diff_img: Image.Image, zone: str) -> Image.Image:
    """生成三图并排对比图（设计稿 | 实现 | 差异）。"""
    w, h = img_impl.size
    labels = ["设计稿", "实现", "差异高亮"]
    images = [resize_to_match(img_design, img_impl), img_impl, diff_img]

    from PIL import ImageDraw, ImageFont
    label_h = 30
    canvas_w = w * 3 + 4  # 2px 分隔线
    canvas_h = h + label_h
    canvas = Image.new("RGB", (canvas_w, canvas_h), (240, 240, 240))
    draw = ImageDraw.Draw(canvas)

    for i, (img, label) in enumerate(zip(images, labels)):
        x = i * (w + 2)
        canvas.paste(img, (x, label_h))
        draw.rectangle([x, 0, x + w, label_h], fill=(50, 50, 50))
        draw.text((x + 8, 6), label, fill=(255, 255, 255))

    return canvas


def parse_zone_width(zone_raw: str) -> tuple[str, int | None]:
    """解析 zone 名称中可能包含的分辨率后缀。

    Examples:
      "navbar@1920"  -> ("navbar", 1920)
      "navbar"       -> ("navbar", None)
    """
    if "@" in zone_raw:
        base, w = zone_raw.rsplit("@", 1)
        try:
            return base, int(w)
        except ValueError:
            pass
    return zone_raw, None


def find_pairs(design_dir: Path, impl_dir: Path) -> list[tuple[str, Path, Path]]:
    """找出所有 design_<zone>.png / impl_<zone>.png 配对。

    zone 可以包含下划线（如 tab_switch）和分辨率后缀（如 @1920）。
    """
    pairs = []
    for f in sorted(design_dir.glob("design_*.png")):
        zone = f.stem[len("design_"):]
        impl_file = impl_dir / f"impl_{zone}.png"
        if impl_file.exists():
            pairs.append((zone, f, impl_file))
        else:
            print(f"WARN: 没有找到对应的实现截图: {impl_file}")
    return pairs


def load_metadata(metadata_path: Path) -> dict:
    """加载 browser-use 生成的坐标元数据（可选）。
    
    metadata.json 格式示例:
    {
      "design_tabbar": {"x": 0, "y": 0, "width": 1440, "height": 42},
      "impl_tabbar": {"x": 0, "y": 0, "width": 1440, "height": 42}
    }
    """
    if not metadata_path.exists():
        return {}
    with open(metadata_path, encoding="utf-8") as f:
        return json.load(f)


def crop_to_region(img: Image.Image, region: dict) -> Image.Image:
    """根据坐标元数据裁剪图像到指定区域。"""
    x, y = region.get("x", 0), region.get("y", 0)
    w, h = region.get("width", img.width), region.get("height", img.height)
    box = (x, y, x + w, y + h)
    return img.crop(box)


def categorize_zone(zone: str) -> str:
    """将 zone 名称分类为 static（静态）或 interactive（交互场景）。

    会忽略 @width 后缀再分类。
    """
    interactive_keywords = [
        "hover", "click", "active", "drag", "dragging", "dragged",
        "switch", "toggle", "disabled", "enabled", "collapsed",
        "fullscreen", "restored", "focus", "pressed"
    ]
    base, _ = parse_zone_width(zone)
    parts = base.lower().split("_")
    if any(kw in parts for kw in interactive_keywords):
        return "interactive"
    return "static"


def build_responsive_groups(results: list[dict]) -> dict[str, dict]:
    """将含 @width 后缀的结果按基础 zone 名归组。

    Returns:
        {base_zone: {width_int: result_dict, ...}, ...}
        只包含至少在一个宽度有数据的 zone。
        不含 @width 后缀的 zone 不计入此分组（归入传统 Part A/B）。
    """
    groups: dict[str, dict] = {}
    for r in results:
        base, width = parse_zone_width(r["zone"])
        if width is None:
            continue
        groups.setdefault(base, {})[width] = r
    return groups


def generate_report(results: list[dict], design_url: str, local_url: str,
                    output_dir: Path, report_path: Path) -> str:
    """生成 Markdown 格式报告，分三个 Part：
      Part A: 静态区域对比
      Part B: 交互状态覆盖
      Part C: 多分辨率响应式对比（仅当存在 @width 后缀截图时出现）

    图片路径规范：
      report 文件与 screenshots/ 目录同级（均在 tests/visual/ 下）。
      - 截图:  screenshots/design_<zone>.png
      - 差异图: screenshots/diff/diff_<zone>.png
    """
    # 分辨率分组（含 @width 后缀）
    resp_groups = build_responsive_groups(results)
    resp_zones  = {r["zone"] for g in resp_groups.values() for r in g.values()}

    # Part A/B 只处理不含分辨率后缀的结果
    non_resp_results = [r for r in results if r["zone"] not in resp_zones]
    static_results      = [r for r in non_resp_results if r["category"] == "static"]
    interactive_results = [r for r in non_resp_results if r["category"] == "interactive"]

    total_score = round(sum(r["similarity"] for r in results) / len(results), 1) if results else 0
    date_str    = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 计算相对路径前缀（screenshots/ 相对于 report 文件）
    report_dir        = report_path.resolve().parent
    screenshots_rel   = Path(os.path.relpath(output_dir.resolve().parent, report_dir))
    diff_rel          = Path(os.path.relpath(output_dir.resolve(), report_dir))
    screenshots_prefix = screenshots_rel.as_posix()
    diff_prefix        = diff_rel.as_posix()

    # action 列说明（写入报告头部一次，供用户参考）
    ACTION_LEGEND = (
        "**处理动作说明**（请在每个区域的 `处理动作` 列填写）：\n"
        "- `fix` — 修改代码，与设计稿对齐\n"
        "- `keep` — 保留当前实现，不做修改\n"
        "- `defer` — 暂时挂起，后续处理\n"
        "- `discuss` — 需要进一步讨论或确认\n"
        "- `skip` — 截图范围/环境问题，本次跳过，下次重测\n"
        "- 留空或填写自定义意见均可，agent 将在 Phase 4 读取此列"
    )

    def score_badge(score: float) -> str:
        return "✅" if score >= 90 else ("⚠️" if score >= 75 else "❌")

    def action_placeholder(score: float) -> str:
        """根据相似度给出默认 action 建议（可被用户覆盖）。"""
        if score >= 95:
            return "keep"
        if score >= 90:
            return "<!-- keep / fix / defer / discuss / skip -->"
        if score >= 75:
            return "<!-- fix / defer / discuss / skip -->"
        return "<!-- fix / defer / discuss / skip -->"

    def section_block(r) -> list[str]:
        zone        = r["zone"]
        score       = r["similarity"]
        status      = score_badge(score)
        fix_current = r.get("fix_current", "<!-- agent-fill: 当前代码 -->")
        fix_target  = r.get("fix_target",  "<!-- agent-fill: 修复后代码 -->")
        action      = r.get("action", action_placeholder(score))
        lines = [
            f"### {status} {zone}（相似度：{score}%）",
            "",
            "| 设计稿 | 实现 | 差异高亮 | 当前代码 | 修复方向 | 处理动作 |",
            "|--------|------|----------|----------|----------|----------|",
            f"| ![design]({screenshots_prefix}/design_{zone}.png)"
            f" | ![impl]({screenshots_prefix}/impl_{zone}.png)"
            f" | ![diff]({diff_prefix}/diff_{zone}.png)"
            f" | {fix_current} | {fix_target} | {action} |",
            "",
        ]
        if r.get("notes"):
            lines += [f"**分析**：{r['notes']}", ""]
        return lines

    def responsive_section(base_zone: str, width_map: dict) -> list[str]:
        """生成单个 zone 的跨断点横向对比表格。"""
        sorted_widths = sorted(width_map.keys(), reverse=True)
        avg_score = round(sum(width_map[w]["similarity"] for w in sorted_widths) / len(sorted_widths), 1)
        status    = score_badge(avg_score)
        action    = width_map[sorted_widths[0]].get("action", action_placeholder(avg_score))

        # 表头：分辨率列 + 当前代码 + 修复方向 + 处理动作
        header_cells  = ["场景"] + [f"{w}px" for w in sorted_widths] + ["当前代码", "修复方向", "处理动作"]
        sep_cells     = ["-" * max(4, len(c)) for c in header_cells]

        # 设计稿行
        design_imgs = [f"![d{w}]({screenshots_prefix}/design_{base_zone}@{w}.png)" for w in sorted_widths]
        # 实现行
        impl_imgs   = [f"![i{w}]({screenshots_prefix}/impl_{base_zone}@{w}.png)"   for w in sorted_widths]
        # 差异行（含相似度徽标）
        diff_imgs   = []
        for w in sorted_widths:
            r  = width_map[w]
            sc = r["similarity"]
            b  = score_badge(sc)
            diff_imgs.append(f"{b}{sc}% ![diff{w}]({diff_prefix}/diff_{base_zone}@{w}.png)")

        fix_current = width_map[sorted_widths[0]].get("fix_current", "<!-- agent-fill: 当前代码 -->")
        fix_target  = width_map[sorted_widths[0]].get("fix_target",  "<!-- agent-fill: 修复后代码 -->")

        lines = [
            f"### {status} {base_zone}（均值：{avg_score}%）",
            "",
            "| " + " | ".join(header_cells) + " |",
            "| " + " | ".join(sep_cells)    + " |",
            "| 设计稿 | " + " | ".join(design_imgs) + f" | {fix_current} | {fix_target} | {action} |",
            "| 实现   | " + " | ".join(impl_imgs)   + " |  |  |  |",
            "| 差异   | " + " | ".join(diff_imgs)   + " |  |  |  |",
            "",
        ]
        return lines

    # ── 报告正文 ─────────────────────────────────────────────────────────────
    lines = [
        "# UI 还原度 & 交互对比报告",
        "",
        f"**生成时间**：{date_str}",
        f"**设计稿**：{design_url or '（未提供）'}",
        f"**实现**：{local_url or '（未提供）'}",
        "",
        f"## 总体评分：{total_score}%",
        "",
        f"{'✅ 还原度良好' if total_score >= 90 else '⚠️ 存在明显差异，建议优先修复低于 90% 的区域'}",
        "",
        "---",
        "",
        ACTION_LEGEND,
        "",
        "> **如何使用**：在各区域表格的 `处理动作` 列直接修改内容，保存文件后告知 agent 进入 Phase 4 修复阶段。",
        "",
        "---",
        "",
    ]

    if static_results:
        lines += ["## Part A：静态区域对比", ""]
        for r in sorted(static_results, key=lambda x: x["similarity"]):
            lines += section_block(r)

    if interactive_results:
        lines += ["## Part B：交互状态覆盖", ""]
        for r in sorted(interactive_results, key=lambda x: x["similarity"]):
            lines += section_block(r)

    if resp_groups:
        lines += ["## Part C：多分辨率响应式对比", ""]
        breakpoints_str = "、".join(
            str(w) + "px"
            for w in sorted(
                {w for g in resp_groups.values() for w in g.keys()}, reverse=True
            )
        )
        lines += [
            f"> 断点：{breakpoints_str}",
            "> 每个场景横向展示各断点的设计稿 / 实现 / 差异图，并标注相似度。",
            "",
        ]
        # 按平均相似度升序（差的优先）
        def avg_sim(item):
            _, wm = item
            return sum(r["similarity"] for r in wm.values()) / len(wm)

        for base_zone, width_map in sorted(resp_groups.items(), key=avg_sim):
            lines += responsive_section(base_zone, width_map)

    # ── 汇总表 ──────────────────────────────────────────────────────────────
    lines += [
        "## 差异优先级汇总",
        "",
        "| 场景 | 分辨率 | 类型 | 相似度 | 状态 | 处理动作 | 当前代码 | 修复方向 |",
        "|------|--------|------|--------|------|----------|----------|----------|",
    ]
    for r in sorted(results, key=lambda x: x["similarity"]):
        score       = r["similarity"]
        status      = "✅ 良好" if score >= 90 else ("⚠️ 需关注" if score >= 75 else "❌ 差异大")
        tag         = "交互" if r["category"] == "interactive" else "静态"
        fix_current = r.get("fix_current", "<!-- agent-fill -->")
        fix_target  = r.get("fix_target",  "<!-- agent-fill -->")
        action      = r.get("action", action_placeholder(score))
        _, width    = parse_zone_width(r["zone"])
        width_str   = f"{width}px" if width else "—"
        lines.append(
            f"| {r['zone']} | {width_str} | {tag} | {score}% | {status}"
            f" | {action} | {fix_current} | {fix_target} |"
        )

    lines += ["", "---", "*由 visual-regression-compare skill 自动生成*"]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="UI 截图像素级对比工具（支持交互状态）")
    parser.add_argument("--design-dir", default="screenshots", help="设计稿截图目录")
    parser.add_argument("--impl-dir", default="screenshots", help="实现截图目录")
    parser.add_argument("--output-dir", default="screenshots/diff", help="差异图输出目录")
    parser.add_argument("--report", default="visual-regression-report.md", help="报告输出路径")
    parser.add_argument("--metadata", default="", help="browser-use 生成的坐标元数据 JSON（可选）")
    parser.add_argument("--design-url", default="", help="设计稿 URL（仅写入报告）")
    parser.add_argument("--local-url", default="", help="本地实现 URL（仅写入报告）")
    parser.add_argument("--side-by-side", action="store_true", help="同时生成三图并排对比图")
    args = parser.parse_args()

    design_dir = Path(args.design_dir)
    impl_dir = Path(args.impl_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    metadata = load_metadata(Path(args.metadata)) if args.metadata else {}

    pairs = find_pairs(design_dir, impl_dir)
    if not pairs:
        print("ERROR: 未找到任何 design_*.png / impl_*.png 配对文件")
        sys.exit(1)

    results = []
    for zone, design_path, impl_path in pairs:
        category = categorize_zone(zone)
        label = f"[{'交互' if category == 'interactive' else '静态'}] {zone}"
        print(f"处理: {label} ...")

        img_design = Image.open(design_path)
        img_impl = Image.open(impl_path)

        # 如果有精确坐标，先裁剪再对比
        design_meta = metadata.get(f"design_{zone}")
        impl_meta = metadata.get(f"impl_{zone}")
        if design_meta:
            img_design = crop_to_region(img_design, design_meta)
        if impl_meta:
            img_impl = crop_to_region(img_impl, impl_meta)

        img_design_resized = resize_to_match(img_design, img_impl)
        diff_img, similarity = compute_diff(img_design_resized, img_impl)

        diff_path = output_dir / f"diff_{zone}.png"
        diff_img.save(diff_path)

        if args.side_by_side:
            sbs = make_side_by_side(img_design_resized, img_impl, diff_img, zone)
            sbs.save(output_dir / f"sbs_{zone}.png")

        _, width = parse_zone_width(zone)
        results.append({"zone": zone, "category": category, "similarity": similarity, "width": width})
        print(f"  → 相似度: {similarity}%，差异图: {diff_path}")

    report_path = Path(args.report)
    report_content = generate_report(results, args.design_url, args.local_url, output_dir, report_path)
    report_path.write_text(report_content, encoding="utf-8")
    print(f"\n[OK] 报告已生成: {report_path}")

    non_resp = [r for r in results if r.get("width") is None]
    resp_all = [r for r in results if r.get("width") is not None]
    static_scores      = [r["similarity"] for r in non_resp if r["category"] == "static"]
    interactive_scores = [r["similarity"] for r in non_resp if r["category"] == "interactive"]

    print("\n[summary]")
    print(f"  静态区域 ({len(static_scores)} 项):")
    for r in sorted([r for r in non_resp if r["category"] == "static"], key=lambda x: x["similarity"]):
        bar = "█" * int(r["similarity"] / 5)
        print(f"    {r['zone']:25s} {r['similarity']:5.1f}% {bar}")

    print(f"\n  交互场景 ({len(interactive_scores)} 项):")
    for r in sorted([r for r in non_resp if r["category"] == "interactive"], key=lambda x: x["similarity"]):
        bar = "█" * int(r["similarity"] / 5)
        print(f"    {r['zone']:25s} {r['similarity']:5.1f}% {bar}")

    if resp_all:
        resp_groups = build_responsive_groups(results)
        print(f"\n  多分辨率 ({len(resp_all)} 张，共 {len(resp_groups)} 个场景):")
        for base_zone, width_map in sorted(resp_groups.items()):
            for w in sorted(width_map.keys(), reverse=True):
                r   = width_map[w]
                bar = "█" * int(r["similarity"] / 5)
                print(f"    {base_zone}@{w}px{' ' * max(0, 18 - len(base_zone))} {r['similarity']:5.1f}% {bar}")

    overall = round(sum(r["similarity"] for r in results) / len(results), 1)
    print(f"\n  总体评分: {overall}%")

    resp_scores = [r["similarity"] for r in resp_all]
    results_json = output_dir / "results.json"
    with open(results_json, "w", encoding="utf-8") as f:
        json.dump({
            "overall": overall,
            "static_avg":      round(sum(static_scores)      / len(static_scores),      1) if static_scores      else None,
            "interactive_avg": round(sum(interactive_scores) / len(interactive_scores), 1) if interactive_scores else None,
            "responsive_avg":  round(sum(resp_scores)        / len(resp_scores),        1) if resp_scores         else None,
            "zones": results,
            "design_url": args.design_url,
            "local_url": args.local_url
        }, f, ensure_ascii=False, indent=2)

    # 输出供 Step 6 使用的差异清单（仅列出相似度 < 100% 的项目，按差异程度排序）
    diff_items = [
        {
            "id": i + 1,
            "zone": r["zone"],
            "width": r.get("width"),
            "category": r["category"],
            "similarity": r["similarity"],
            "gap": round(100 - r["similarity"], 1),
            "priority": "high" if r["similarity"] < 75 else ("medium" if r["similarity"] < 90 else "low"),
            "selected": None
        }
        for i, r in enumerate(sorted(results, key=lambda x: x["similarity"]))
        if r["similarity"] < 99.0
    ]

    diff_checklist_json = output_dir / "diff-checklist.json"
    with open(diff_checklist_json, "w", encoding="utf-8") as f:
        json.dump({"items": diff_items, "total": len(diff_items)}, f, ensure_ascii=False, indent=2)

    if diff_items:
        print(f"\n[diff-checklist] 差异清单已生成（共 {len(diff_items)} 项）: {diff_checklist_json}")
        print("   Agent 请在 Step 6 读取此文件，逐项向用户展示并收集选择。")


if __name__ == "__main__":
    main()
