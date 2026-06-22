export function safeTruncate(value: string, maxLength: number): string {
  if (maxLength <= 0) {
    return '';
  }

  const characters = Array.from(value.trim());
  return characters.length <= maxLength
    ? characters.join('')
    : `${characters.slice(0, Math.max(0, maxLength - 3)).join('')}...`;
}
