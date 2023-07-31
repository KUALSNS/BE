import exp from "constants";

interface beforeMainCategory {
    name: string;
  }
  
interface beforeMainChallenge {
    title: string;
    category: {
      name: string;
      emogi: string;
    };
  }
  
 export interface beforeMainDTO {
    categoryDB: beforeMainCategory[];
    challengesDB: beforeMainChallenge[];
  }

  export interface categorySearchRequestDTO{
    categorySearch : string
  }


  export interface challengeSearchDTO{
    title: string;
    category: {
        name: string;
    };
  }
  
