

const getKoreanDateISOString = () =>  {
    const date = new Date();
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // 한국 시간으로 변환 (UTC+9
    const realKoreanDate = koreanDate.toISOString().slice(0, 10) + "T00:00:00.000Z";
 
    return realKoreanDate;
  }


  export {getKoreanDateISOString} 