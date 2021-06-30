/**
 * Trim whitespace except single leading/trailing non-breaking space
 */
export function trimText(text: string): string {
  let i = 0;
  let startPos;
  let endPos;

  while (i >= 0 && i < text.length) {
    if (/\S/.test(text[i])) {
      if (startPos === undefined) {
        startPos = i;
        i = text.length;
      } else {
        endPos = i;
        i = void 0;
      }
    }

    if (startPos === undefined) i++;
    else i--;
  }

  if (startPos === undefined) startPos = 0;
  if (endPos === undefined) endPos = text.length - 1;

  const hasLeadingSpace = startPos > 0 && /[^\S\r\n]/.test(text[startPos-1]);
  const hasTrailingSpace = endPos < (text.length - 1) && /[^\S\r\n]/.test(text[endPos+1]);

  return (hasLeadingSpace ? ' ' : '') + text.slice(startPos, endPos + 1) + (hasTrailingSpace ? ' ' : '');
}
