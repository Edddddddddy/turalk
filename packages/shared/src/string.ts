export function safeTruncate(value: string, maxLength: number): string {
  if (maxLength <= 0) {
    return '';
  }

  const characters = Array.from(value.trim());
  const marker = '.'.repeat(Math.min(3, maxLength));

  return characters.length <= maxLength
    ? characters.join('')
    : `${characters.slice(0, maxLength - marker.length).join('')}${marker}`;
}
