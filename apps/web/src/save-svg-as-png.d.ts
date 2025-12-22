declare module 'save-svg-as-png' {
  export interface SaveSvgAsPngOptions {
    scale?: number;
    responsive?: boolean;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    selectorRemap?: (text: string) => string;
    modifyStyle?: (style: string) => string;
    window?: Window;
    selector?: string;
    backgroundColor?: string;
    encoderOptions?: number;
    fonts?: {
      text: string;
      url: string;
      format: string;
    }[];
  }

  export function saveSvgAsPng(
    el: Node,
    filename: string,
    options?: SaveSvgAsPngOptions,
  ): Promise<void>;
}
