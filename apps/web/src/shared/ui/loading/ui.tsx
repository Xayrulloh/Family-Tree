import { Flex, type FlexProps, Spin, type SpinProps } from 'antd';
import type React from 'react';

interface LoadingProps {
  type?: 'page' | 'section' | 'inline' | 'fullscreen';
  size?: SpinProps['size'];
  padding?: string | number;
  height?: string | number;
  flexProps?: FlexProps;
  spinProps?: SpinProps;
  children?: React.ReactNode;
}

export const Loading: React.FC<LoadingProps> = ({
  type = 'section',
  size,
  padding,
  height,
  flexProps = {},
  spinProps = {},
  children,
}) => {
  const configs = {
    page: {
      size: 'large' as const,
      padding: '64px 0',
      height: 'auto',
    },
    section: {
      size: 'large' as const,
      padding: '64px 0',
      height: 'auto',
    },
    inline: {
      size: 'small' as const,
      padding: '16px 0',
      height: 'auto',
    },
    fullscreen: {
      size: 'large' as const,
      padding: 0,
      height: '100vh',
    },
  };

  const config = configs[type];

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        padding: padding || config.padding,
        height: height || config.height,
        width: '100%',
      }}
      {...flexProps}
    >
      <Spin size={size || config.size} {...spinProps}>
        {children}
      </Spin>
    </Flex>
  );
};

export const PageLoading = () => <Loading type="page" />;
export const SectionLoading = () => <Loading type="section" />;
export const InlineLoading = () => <Loading type="inline" />;
export const FullscreenLoading = () => <Loading type="fullscreen" />;
