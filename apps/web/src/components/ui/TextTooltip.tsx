import type { ComponentProps, FC, PropsWithChildren } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export type TextTooltipProps = Readonly<{
  content?: string;
}> & Pick<ComponentProps<typeof TooltipContent>, 'side' | 'sideOffset'>;

export const TextTooltip: FC<PropsWithChildren<TextTooltipProps>> = ({ children, content, side, sideOffset }) => {
  if (!content) {
    return <>{children}</>
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>{content}</TooltipContent>
    </Tooltip>
  );
};