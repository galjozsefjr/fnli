import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export const TrimmedText = (

): PropertyDecorator => {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeHtml(value);
    }
    return value;
  });
};
