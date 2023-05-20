export const randomPasswordFunction = ()=> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;
    let result = '';
  
    for (let i = 0; i < 1; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      console.log(23)
      result = result + characters.charAt(randomIndex);
    }
    console.log(result)
  
    return result;
  }

