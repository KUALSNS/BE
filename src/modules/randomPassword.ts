export const randomPasswordFunction = () => {
  const characters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = '';

for (let i = 0; i < 10; i++) {
    const randomIndex = characters[Math.floor(Math.random() * characters.length)];
     result = result + randomIndex;
}
  return result;
}

