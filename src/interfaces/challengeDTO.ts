interface CategoryDBEntry {
    name: string;
  }
  
interface ChallengeDBEntry {
    title: string;
    category: {
      name: string;
      emogi: string;
    };
  }
  
 export interface beforeMainDTO {
    categoryDB: CategoryDBEntry[];
    challengesDB: ChallengeDBEntry[];
  }
  
