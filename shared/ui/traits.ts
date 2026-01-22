import type { FloorTraits } from "./types";

/**
 * 特征属性键值映射表
 * 用于在运行时从大 Props 对象中提取特定特征的属性
 */
const TRAIT_KEYS_MAP: Record<keyof FloorTraits, Array<string>> = {
  header: ['title', 'titleMb', 'subtitle', 'subtitleMb', 'more'],
  spacing: ['isMergeTopSpacing', 'isMergeBottomSpacing'],
  visibility: ['isShowMb']
};

/**
 * 自动化特征分拣器 (Type-Safe Picker)
 * 
 * @param props - 原始 Props 对象
 * @param trait - 要提取的特征名称
 * @returns 属于该特征的属性子集
 */
export function pickTrait<T extends keyof FloorTraits>(props: any, trait: T): FloorTraits[T] {
  const result: any = {};
  const keys = TRAIT_KEYS_MAP[trait];
  
  if (!keys) return result;

  keys.forEach(key => {
    if (key in props) {
      result[key] = props[key];
    }
  });

  return result;
}
