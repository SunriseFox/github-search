export function parseInput(input: string) {
  const arr = input.split(' ');
  let lastCommand = '';
  let result: any = {};
  while (arr.length) {
    lastCommand += arr.shift();
    if (!lastCommand.endsWith('\\') || lastCommand.endsWith('\\\\')) {
      const match = /^([\d\w]+):(.+)/.exec(lastCommand);
      if (match) result[match[1]] = match[2].trim();
      else result['search'] = (result['search'] ?? '') + lastCommand;
      lastCommand = '';
    } else lastCommand += ' ';
  }
  if (lastCommand.trim()) result['search'] = lastCommand.trim();
  const { search, ...rest } = result;
  result.action = Object.entries(rest)
    .map(([key, value]) => key + ':' + value)
    .join(' ');
  return result;
}

// @ts-ignore
window.a = parseInput;
