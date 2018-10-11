import Builder from './x2o-builder';

/**
 * 将xml字符串转化为对象
 */
export default function x2o(xml: string): any {
  return new Builder(xml).build();
}
