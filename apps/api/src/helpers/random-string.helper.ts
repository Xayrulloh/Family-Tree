function generateRandomString(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));

  let result = '';

  for (let i = 0; i < length; i += 1) {
    const randomIndex = randomBytes[i] % characters.length;

    result += characters[randomIndex];
  }

  return result;
}

export default generateRandomString;
