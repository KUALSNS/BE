

const getKoreanDateISOString = () =>  {
    const date = new Date();
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // 한국 시간으로 변환 (UTC+9)
  
    const year = koreanDate.getFullYear();
    const month = String(koreanDate.getMonth() + 1).padStart(2, '0');
    const day = String(koreanDate.getDate()).padStart(2, '0');
  
    const koreanDateISOString = `${year}-${month}-${day}`;
  
    return koreanDateISOString;
  }


  export {getKoreanDateISOString} 